<template>
    <div class="container mx-auto py-8">
      <LoadingScreen v-if="loading" />
      <DoesNotExist v-else-if="!gameweekExists" entity="gameweek" />
      <!-- Not in group message -->
      <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
        <p>You are not a member of this group.</p>
        <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
          Go to Group
        </button>
      </div>

      <template v-else>
        <div class="px-2 mb-4">
          <!-- Header Row -->
          <div class="flex items-center justify-between gap-4 mb-4 flex-nowrap">
            <div class="flex items-center gap-3 min-w-0 max-w-full flex-1">
              <h2 class="text-2xl font-semibold">Gameweek {{ gameweek?.week_number }}</h2>
              <LockClosedIcon class="size-6 ms-1" v-if="gameweek?.is_locked" />
              <div v-if="gameweek?.is_active" class="text-sm bg-blue-100 text-purple-800 px-3 py-1 rounded-full transition ms-2">
                Active
              </div>
            </div>
  
            <div class="flex flex-wrap gap-2 justify-end flex-shrink-0">
              <button @click="copyGameweekLink()" class="p-1 rounded-md hover:bg-gray-200" title="Copy gameweek link">
                <LinkIcon class="size-6 text-blue-500" />
              </button>
              <Dropdown>
                <template #trigger>
                  <EllipsisVerticalIcon class="size-6 text-gray-500" />
                </template>
                <template #items>
                  <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 dropdown-item">
                    Go to Group
                  </router-link>
                  <router-link :to="`/season/${gameweek?.season_id}`" class="text-blue-600 dropdown-item">
                    {{ gameweek?.season_name }}
                  </router-link>
                  <template v-if="isAdmin">
                    <button v-if="canUnlockGameweek" @click="changeGameWeekLockedStatus" class="dropdown-item">
                      {{ gameweek?.is_locked ? 'Unlock' : 'Lock' }}
                    </button>
                    <button v-if="canUnlockGameweek" @click="changeGameWeekLockedStatus" class="dropdown-item">
                      {{ gameweek?.is_locked ? 'Unlock' : 'Lock' }}
                    </button>
                    <button @click="deleteGameweek" class="dropdown-item text-red-700">
                      Delete
                    </button>
                  </template>
                </template>
              </Dropdown>
            </div>
          </div>
          <!-- Gameweek deadline -->
          <p class="text-lg">
            <span class="font-semibold">Deadline: </span>
            <DeadlineCountdown :deadline="new Date(gameweek?.deadline)" v-if="gameweek?.deadline" />
          </p>
        </div>
        
        <Tabs @tab-selected="handleTabSelected">
          <Tab header="Predictions">
            <template v-if="gameweek?.is_finished">
              <GameweekWinnerCard 
                :username="gameweekWinner.username"
                :totalPoints="gameweekWinner.total_points"
                :isCurrentUser="userIsGameweekWinner"
                :weekNumber="gameweek?.week_number"
              />
            </template>
            <!-- Predictions -->
            <RoundedContainer>
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
            </RoundedContainer>
          </Tab>
          <Tab header="Matches">
            <RoundedContainer headerText="Matches" collapsable>
              <template #headerContent>
                <div class="flex items-center" v-if="isAdmin">
                  <router-link :to="`/gameweek/${gameweekId}/add-matches`">
                    <button @click="editMode = true" v-if="!gameweek?.is_locked && gameweek?.is_active"
                      class="p-1 rounded-md hover:bg-green-200" title="Add matches to gameweek"
                    >
                      <PlusIcon class="size-5 text-green-600" />
                    </button>
                  </router-link>
                  <template v-if="!gameweek?.is_finished">
                    <button v-if="!editMode" @click="editMode = true" class="p-1 rounded-md hover:bg-gray-200" title="Edit this gameweek">
                      <PencilSquareIcon class="size-5 text-gray-500" />
                    </button>
                    <button v-else @click="editMode = false" class="p-1 rounded-md hover:bg-red-200" title="Stop editing">
                      <XMarkIcon class="size-5 text-red-700" />
                    </button>
                  </template>
                </div>
              </template>
                <ScoreCard 
                    v-if="matches.length > 0"
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
            </RoundedContainer>
          </Tab>
          <Tab header="Leaderboard">
            <!-- Leaderboard Section -->
            <RoundedContainer headerText="Leaderboard">
              <template #headerContent>
                <router-link 
                  :to="`/group/${gameweek?.group_id}/leaderboards`" 
                  class="text-sm text-blue-600 hover:underline"
                >
                  View Full Leaderboard →
                </router-link>
              </template>
              <p v-if="leaderboardLastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(leaderboardLastUpdated) }}</p>
              <div v-if="leaderboard.length">
                <LeaderboardCard 
                  :leaderboard="leaderboard"
                  :gameweekId="gameweekId"
                  :includeUserPredictionLink="gameweek?.is_locked"
                  :winnerId="gameweek?.winner_id"
                />
              </div>
              <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
            </RoundedContainer>
            <!-- <RoundedContainer headerText="Potential Finishes">
              <PotentialFinishGrid 
                :scoringSystem="potentialFinishData.scoringSystem"
                :users="potentialFinishData.users"
                :predictions="potentialFinishData.predictions"
                :matches="potentialFinishData.matches"
              />
            </RoundedContainer> -->
          </Tab>
        </Tabs>
      </template>
    </div>

    <DeleteConfirm ref="deleteConfirm" title="Delete Gameweek" message="Are you sure you want to delete this gameweek?" />
  </template>
  
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userStore } from '../store/userStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import { ShareIcon, LockClosedIcon, LinkIcon, EllipsisVerticalIcon, PencilSquareIcon, XMarkIcon, PlusIcon } from "@heroicons/vue/24/solid";
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
import confetti from 'canvas-confetti';
import DeadlineCountdown from '../components/UI/DeadlineCountdown.vue';
import GameweekWinnerCard from '../components/GameweekWinnerCard.vue';
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import Dropdown from '../components/UI/Dropdown.vue';
import Tabs from '../components/UI/Tabs.vue';
import Tab from '../components/UI/Tab.vue';
import PotentialFinishGrid from '../components/PotentialFinishGrid.vue';
import DoesNotExist from '../components/DoesNotExist.vue';
import { Gameweek } from '../types';

const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(true);
const gameweekId = ref<string | null>(null);
const gameweek = ref<Gameweek>();
const matches = ref([]);
const editMode = ref(false);
const newMatch = ref({ home_team: '', away_team: '', match_time: '' });
const predictions = ref({});
const notInGroup = ref(false);
const members = ref([]);
const deleteConfirm = ref(null);
const leaderboard = ref([]);
const userGameweekScore = ref();
const gameweekWinner = ref();
const leaderboardLastUpdated = ref();
const potentialFinishData = ref({ scoringSystem: {}, users: [], predictions: [], matches: [] });
const gameweekExists = ref<boolean>(true);

const isAdmin = ref(false);

const matchesChanged = ref(false);

const canUnlockGameweek = computed(() => {
  return new Date(gameweek.value.deadline) > new Date();
});

const userIsGameweekWinner = computed(() => {
  return gameweek.value?.is_finished && gameweekWinner.value.user_id === userStore.user?.id;
});
  
onMounted(async () => {
  await fetchGameweek();
});
  
async function fetchGameweek() {
  try {
    loading.value = true;
    gameweekId.value = route.params.id || route.query.id;
  
    const { data, error } = await gameweeksService.getGameweekByIdUsingView(gameweekId.value);
    if (error) {
      if (error.code === "PGRST116") {
          gameweekExists.value = false;
          loading.value = false;
          throw new Error('Failed to load gameweek details');
      }
    }
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
  
    // Fetch both matches and predictions
    const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
      gameweeksService.getMatches(gameweekId.value),
      predictionsService.getUserGameweekPredictions(userStore.user?.id, gameweekId.value)
    ]);
  
    const { data: groupData, error: groupError } = await groupsStore.fetchGroupById(gameweek.value.group_id);
    if (groupError) throw new Error('Failed to load group');
  
    const { data: gameweekPredictions, error: gameweekPredictionsError } = await predictionsService.getGameweekPredictions(gameweek.value.id);
    if (gameweekPredictionsError) throw new Error('Failed to load all gameweek predictions')
  
    mapPredictions(predictionsData, matchData);
  
    mapPotentialFinishData(leaderboardData, groupData, matchData, gameweekPredictions);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function mapPredictions(predictionsData, matchData) {
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

function mapPotentialFinishData(leaderboardData: any[], groupData: any, matchData: any[], predictionsData: any[]) {
  potentialFinishData.value.scoringSystem = { 
    exactScorePoints: groupData.exact_score_points,
    correctResultPoints: groupData.correct_result_points,
    incorrectResultPoints: groupData.incorrect_points
  }

  potentialFinishData.value.users = leaderboardData.map(user => ({
    id: user.user_id,
    username: user.username,
    bgColor: user.bg_colour,
    currentPoints: user.total_points,
    currentPosition: user.position,
    currentTotalCorrectScores: user.total_correct_scores
  }));

  const unfinishedMatches = matchData.filter(x => x.final_home_score === null && x.final_away_score === null)

  potentialFinishData.value.matches = matchData.map(match => ({
    id: match.id,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    actualScore: (
      match.final_home_score !== null && match.final_away_score !== null
    ) ? { home: match.final_home_score, away: match.final_away_score } : null
  }));

  potentialFinishData.value.predictions = predictionsData.map(pred => ({
    userId: pred.user_id,
    matchId: pred.match_id,
    homeScore: pred.predicted_home_score,
    awayScore: pred.predicted_away_score
  }));
}
  
function toggleEditMode() {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    mapPredictions();
  }
}

function handleTabSelected(index: number) {
  editMode.value = false;
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
        debugger
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
  
function redirectToGroup() {
  router.push(`/group/${gameweek.value.group_id}`);
}

</script>
  