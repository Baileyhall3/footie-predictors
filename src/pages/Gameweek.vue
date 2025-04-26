<template>
    <div class="container mx-auto py-8">
      <LoadingScreen v-if="loading" />
      <!-- Not in group message -->
      <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
        <p>You are not a member of this group.</p>
        <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
          Go to Group
        </button>
      </div>

      <template v-else>
        <div class="mb-1 ms-1">
          <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 hover:underline font-medium">
            ← Back to group
          </router-link>
        </div>
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div class="flex items-center gap-2 mb-4">
            <h2 class="text-2xl font-semibold">Gameweek {{ gameweek?.week_number }}</h2>
            <LockClosedIcon class="size-6 ms-1" v-if="gameweek?.is_locked" />
            <div v-if="gameweek?.is_active" class="text-sm bg-blue-100 text-purple-800 px-3 py-1 rounded-full transition ms-2">
              Active
            </div>
          </div>
          <p class="text-lg">
            <span class="font-semibold">Deadline: </span>
            <DeadlineCountdown :deadline="new Date(gameweek?.deadline)" v-if="gameweek?.deadline" />
            <!-- {{ DateUtils.toFullDateTime(gameweek?.deadline) }} -->
          </p>
          <div class="items-center flex" v-if="gameweek?.is_finished">
            <p class="text-lg"><span class="font-semibold">Winner:</span> {{ userIsGameweekWinner ? 'You!' : gameweekWinner.username }}</p>
            <TrophyIcon class="size-5 ms-3" style="color: gold;" />
          </div>

          <!-- <p class="text-sm text-gray-600"><span class="font-semibold">Scoring System:</span> {{ getScoringSystem(group) }}</p> -->
      
          <!-- Edit Mode Toggle (Admins Only) -->
           <div class="flex flex-wrap gap-2 mt-3" v-if="isAdmin">
              <button @click="toggleEditMode" class="px-3 py-1 bg-green-600 text-white rounded-md">
                {{ editMode ? 'Exit Edit Mode' : 'Edit' }}
              </button>
             <!-- Share Gameweek -->
             <button @click="copyGameweekLink" class="px-3 py-1 bg-blue-500 text-white rounded-md">
               <div class="justify-between items-center flex">
                 Share
                 <ShareIcon class="text-white size-4 ms-2" />
               </div>
             </button>
             <template v-if="editMode">
               <!-- <button @click="changeGameWeekActiveStatus" class="px-3 py-1 bg-purple-600 text-white rounded-md">
                  {{ gameweek?.is_active ? 'Make inactive' : 'Make active' }}
                </button> -->
                <button v-if="canUnlockGameweek" @click="changeGameWeekLockedStatus" class="px-3 py-1 bg-gray-600 text-white rounded-md">
                  {{ gameweek?.is_locked ? 'Unlock' : 'Lock' }}
                </button>
                <button @click="deleteGameweek" class="px-3 py-1 bg-red-600 text-white rounded-md">
                  Delete
                </button>
             </template>
           </div>
        </div>

        <div v-if="userIsGameweekWinner" class="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div class="flex items-center justify-center gap-2">
            <!-- <TrophyIcon class="size-5 me-1" style="color: gold;" /> -->
            <h2 class="text-xl font-bold">Congratulations {{ gameweekWinner.username }}, you are the gameweek winner!</h2>
            <!-- <TrophyIcon class="size-5 ms-1" style="color: gold;" /> -->
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
          <!-- Matches List -->
          <div class="flex justify-between items-center mb-4">
            <div class="items-center flex">
              <h3 class="text-xl font-semibold">Matches</h3>
              <button type="button" @click="toggleMatchesCollapse">
                <ChevronDownIcon v-if="!matchesCollapsed" class="size-5 ms-2"  />
                <ChevronUpIcon v-else class="size-5 ms-2" />
              </button>
            </div>
            <router-link :to="`/gameweek/${gameweekId}/add-matches`">
              <button 
                v-if="isAdmin && !gameweek?.is_locked && gameweek?.is_active" 
                class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                + Add Matches
              </button>
            </router-link>
          </div>
          <template v-if="matches.length > 0 && !matchesCollapsed">
            <ScoreCard 
                :matches="matches"
                :isAdmin="editMode && gameweek?.is_active && gameweek?.is_locked"
                :canRemove="editMode && gameweek?.is_active && !gameweek?.is_locked"
                :matchesClickable="gameweek?.is_locked && !editMode"
                @update-score="handleScoreUpdate"
                @match-removed="handleMatchRemoved"
            />
  
            <button v-if="matchesChanged && editMode" @click="saveScores" class="w-full bg-green-600 text-white py-2 rounded-md mt-4">
              Save Scores
            </button>
          </template>
        </div>

        <template v-if="!editMode">
          <!-- Predictions -->
          <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div>
              <template v-if="Object.keys(predictions).length > 0">
                <ScoreCard 
                    :matches="matches"
                    :predictions="predictions"
                    :locked="gameweek?.is_locked || !gameweek?.is_active"
                    :totalPoints="userGameweekScore ?? null"
                    :includeSubmitBtn="!gameweek?.is_locked && gameweek?.is_active"
                    allowCollapse
                    header="Your Predictions"
                    :gameweekId="gameweekId"
                    :matchesClickable="gameweek?.is_locked"
                    @update-prediction="handlePredictionUpdate"
                    @predictions-submitted="submitPredictions"
                />
              </template>
              <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
            </div>
          </div>
  
          <!-- Leaderboard Section -->
          <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Leaderboard</h3>
              <router-link 
                :to="`/group/${gameweek?.group_id}/leaderboards`" 
                class="text-sm text-blue-600 hover:underline"
              >
                View Full Leaderboard →
              </router-link>
            </div>

            <p v-if="leaderboardLastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(leaderboardLastUpdated) }}</p>
            
            <div v-if="leaderboard.length">
              <LeaderboardCard 
                :leaderboard="leaderboard"
                
              />
            </div>
            <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
          </div>
        </template>
      </template>
    </div>

    <DeleteConfirm ref="deleteConfirm" title="Delete Gameweek" message="Are you sure you want to delete this gameweek?" />
  </template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userStore } from '../store/userStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import { ShareIcon, LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { predictionsService } from '../api/predictionsService';
import DateUtils from '../utils/dateUtils';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';
import DeleteConfirm from '../components/DeleteConfirm.vue';
import { predictionsStore } from '../store/predictionsStore';
import { leaderboardStore } from '../store/leaderboardStore';
import LeaderboardCard from '../components/LeaderboardCard.vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { TrophyIcon } from '@heroicons/vue/24/solid';
import confetti from 'canvas-confetti';
import DeadlineCountdown from '../components/UI/DeadlineCountdown.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const gameweekId = ref(null);
const gameweek = ref(null);
const matches = ref([]);
const editMode = ref(false);
const newMatch = ref({ home_team: '', away_team: '', match_time: '' });
const predictions = ref({});
const notInGroup = ref(false);
const members = ref([]);
const deleteConfirm = ref(null);
const leaderboard = ref([]);
const userGameweekScore = ref();
const matchesCollapsed = ref(false);
const gameweekWinner = ref();
const leaderboardLastUpdated = ref();

const isAdmin = ref(false);

const matchesChanged = ref(false);

const canUnlockGameweek = computed(() => {
  return new Date(gameweek.value.deadline) > new Date();
});

const userIsGameweekWinner = computed(() => {
  return gameweek.value?.is_finished && gameweekWinner.value.user_id === userStore.user?.id;
})
  
onMounted(async () => {
  await fetchGameweek();
});
  
async function fetchGameweek() {
  loading.value = true;
  gameweekId.value = route.params.id || route.query.id;

  const { data, error } = await gameweeksService.getGameweekById(gameweekId.value);
  if (error) return console.error(error);
  gameweek.value = data;

  const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(data.group_id);
  if (membersError) throw new Error('Failed to load group members');
  members.value = membersData || [];

  // Check if user is in the group
  const isMember = userInGroup(members.value);
  if (!isMember) {
    loading.value = false;
    notInGroup.value = true;
    return;
  }

  isAdmin.value = userIsAdmin(members.value);

  // Fetch leaderboard
  const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGameweekScores(gameweek.value.group_id, gameweek.value.id);
  if (leaderboardError) throw new Error('Failed to load leaderboard');
  leaderboard.value = leaderboardData || [];

  if (leaderboard.value.length > 0) {
    leaderboardLastUpdated.value = leaderboard.value[0].updated_at ? new Date(leaderboard.value[0].updated_at) : null;
  }

  if (leaderboard.value.length > 0) {
    userGameweekScore.value = leaderboard.value.find(x => x.user_id == userStore.user?.id).total_points;
    gameweekWinner.value = leaderboard.value.find(x => x.position == 1);
  }

  mapPredictions();
}

async function mapPredictions() {
  // Fetch both matches and predictions
  const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
    gameweeksService.getMatches(gameweekId.value),
    predictionsService.getUserGameweekPredictions(userStore.user?.id, gameweekId.value)
  ]);

  // Map predictions by match_id for quick lookup
  const predictionsMap = predictionsData.reduce((acc, prediction) => {
    acc[prediction.match_id] = prediction;
    return acc;
  }, {});

  // Merge predictions into matches
  matches.value = matchData.map(match => ({
    ...match,
    api_match_id: match.api_match_id,
    previous_home_score: match.final_home_score, // Store initial score
    previous_away_score: match.final_away_score,
    predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? '',
    predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? '',
    prediction_id: predictionsMap[match.id]?.id || null,
    home_team_crest: match.homeClub?.crest_url,
    away_team_crest: match.awayClub?.crest_url
  }));

  // Initialize predictions object for v-model binding
  predictions.value = matches.value.reduce((acc, match) => {
    acc[match.id] = {
      predicted_home_score: match.predicted_home_score,
      predicted_away_score: match.predicted_away_score
    };
    return acc;
  }, {});

  loading.value = false;

  if (gameweekWinner.value.user_id === userStore.user?.id && gameweek.value.is_finished) {
    triggerConfetti();
  }
}
  
function toggleEditMode() {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    mapPredictions();
  }
}

async function changeGameWeekActiveStatus() {
  const { data, error } = await gameweeksService.updateGameweek(gameweek.value.id, {
    is_active: !gameweek.value.is_active
  });
  
  if (!error) {
    toast("Gameweek active status changed.", {
      "type": "info",
      "position": "top-center"
    });
    window.location.reload();
  }
}

async function changeGameWeekLockedStatus() {
  const { data, error } = await gameweeksService.updateGameweek(gameweek.value.id, {
    is_locked: !gameweek.value.is_locked
  });
  
  if (!error) {
    toast("Gameweek locked status changed.", {
      "type": "info",
      "position": "top-center"
    });
    window.location.reload();
  }
}

const deleteGameweek = async () => {
  const confirmed = await deleteConfirm.value?.show();
  if (confirmed) {
    try {
      loading.value = true;
      const { success, error: deleteError } = await gameweeksService.deleteGameweek(gameweekId.value)
      
      if (deleteError) throw new Error('Failed to delete gameweek');
      
      // Redirect to groups page
      router.push(`/group/${gameweek.value.group_id}`);
    } catch (err) {
      err.value = err.message || 'An error occurred while deleting the gameweek';
    } finally {
      loading.value = false;
      showDeleteConfirmation.value = false;
    }
  } else {
    console.log("Deletion cancelled!");
  }
};
  
async function submitPredictions() {
  loading.value = true;

  console.log(predictions.value)

  for (const [matchId, prediction] of Object.entries(predictions.value)) {
    await predictionsService.savePrediction(
      userStore.user?.id, 
      matchId, 
      prediction.predicted_home_score ? prediction.predicted_home_score : 0,
      prediction.predicted_away_score ? prediction.predicted_away_score : 0
    );
  }

  toast("Your predictions have been saved!", {
    "type": "success",
    "position": "top-center"
  });

  loading.value = false;
}

function copyGameweekLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  toast("Gameweek link copied!", {
    "type": "info",
    "position": "top-center"
  });
}

async function saveScores() {
  loading.value = true;
  const customMatches = matches.value.filter(x => !x.api_match_id);
  for (const match of customMatches) {
    try {
      if (
        match.final_home_score !== match.previous_home_score || 
        match.final_away_score !== match.previous_away_score
      ) {
        await predictionsStore.updateMatchScore(match.id, match.final_home_score, match.final_away_score);
        // await predictionsService.calculateMatchScores(match.id);
      }
    } catch(err) {
      console.error(err);      
    }
  }
  
  toast("Final scores have been saved!", {
    "type": "success",
    "position": "top-center"
  });
  
  loading.value = false;
  editMode.value = false;
  matchesChanged.value = false;
  fetchGameweek();
  
}

const handlePredictionUpdate = ({ matchId, field, value }) => {
    if (!predictions.value[matchId]) {
        predictions.value[matchId] = { predicted_home_score: 0, predicted_away_score: 0 };
    }
    predictions.value[matchId][field] = value;
};

const handleScoreUpdate = ({ matchId, field, value }) => {
    const match = matches.value.find(m => m.id === matchId);

    if (match) {
        match[field] = value;
        matchesChanged.value = true;
    } else {
        console.error(`Match with ID ${matchId} not found.`);
    }
};

const handleMatchRemoved = async(matchId) => {
  const match = matches.value.find(m => m.id === matchId);

    if (match) {
        try {
          const { data, error } = await gameweeksService.deleteMatch(matchId);
          
          if (!error) {
            mapPredictions();
          }
        } catch (err) {
          console.error(err);
        }
    } else {
        console.error(`Match with ID ${matchId} not found.`);
    }
}

const triggerConfetti = () => {
  confetti({
    particleCount: 1000,
    spread: 100,
    origin: { y: 0.6 }, // Adjust origin for better effect
  });
};

const toggleMatchesCollapse = () => {
  matchesCollapsed.value = !matchesCollapsed.value;
}
  
function redirectToGroup() {
  router.push(`/group/${gameweek.value.group_id}`);
}

</script>
  