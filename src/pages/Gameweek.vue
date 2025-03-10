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
            <div v-if="gameweek?.is_active" class="text-sm bg-blue-100 text-purple-800 px-3 py-1 rounded-full transition ms-2">
              Active
            </div>
            <div v-if="gameweek?.is_locked" class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full transition">
              Locked
            </div>
          </div>
          <p class="text-lg">Deadline: {{ DateUtils.toFullDateTime(gameweek?.deadline) }}</p>
      
          <!-- Edit Mode Toggle (Admins Only) -->
           <div class="flex flex-wrap gap-2 mt-3" v-if="isAdmin">
              <button @click="toggleEditMode" class="px-4 py-2 bg-green-600 text-white rounded-md">
                {{ editMode ? 'Exit Edit Mode' : 'Edit Gameweek' }}
              </button>
             <!-- Share Gameweek -->
             <button @click="copyGameweekLink" class="px-4 py-2 bg-blue-500 text-white rounded-md">
               <div class="justify-between items-center flex">
                 Share Gameweek
                 <ShareIcon class="text-white size-4 ms-2" />
               </div>
             </button>
             <template v-if="editMode">
               <button @click="changeGameWeekActiveStatus" class="px-4 py-2 bg-purple-600 text-white rounded-md">
                  {{ gameweek?.is_active ? 'Make gameweek inactive' : 'Make gameweek active' }}
                </button>
                <button @click="changeGameWeekLockedStatus" class="px-4 py-2 bg-gray-600 text-white rounded-md">
                  {{ gameweek?.is_locked ? 'Unlock gameweek' : 'Lock gameweek' }}
                </button>
                <button @click="deleteGameweek" class="px-4 py-2 bg-red-600 text-white rounded-md">
                  Delete Gameweek
                </button>
             </template>
           </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
          <!-- Matches List -->
          <h3 class="text-xl font-semibold">Matches</h3>
          <ScoreCard 
              :matches="matches"
              :isAdmin="editMode && gameweek?.is_active"
              @update-score="handleScoreUpdate"
          />

          <button v-if="matchesChanged && editMode" @click="saveScores" class="w-full bg-green-600 text-white py-2 rounded-md mt-4">
            Save Scores
          </button>
  
          <!-- Add Match (Admins Only) -->
          <div v-if="editMode" class="mt-4">
            <h3 class="text-xl font-semibold">Add Match</h3>
            <input type="text" v-model="newMatch.home_team" placeholder="Home Team" class="p-2 border rounded-md w-full my-2" />
            <input type="text" v-model="newMatch.away_team" placeholder="Away Team" class="p-2 border rounded-md w-full my-2" />
            <input type="datetime-local" v-model="newMatch.match_time" class="p-2 border rounded-md w-full my-2" />
            <button @click="addMatch" class="px-4 py-2 bg-blue-600 text-white rounded-md">Add Match</button>
          </div>
        </div>

        <!-- Predictions -->
          <div v-if="!editMode" class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div>
              <div class="items-center flex">
                <h3 class="text-xl font-semibold">Your Predictions</h3>
                <LockClosedIcon class="size-5 ms-2" v-if="gameweek?.is_locked" />
              </div>
    
              <ScoreCard 
                  :matches="matches"
                  :predictions="predictions"
                  :locked="gameweek?.is_locked"
                  @update-prediction="handlePredictionUpdate"
              />
    
               <template v-if="!gameweek?.is_locked">
                 <button v-if="allPredictionsSubmitted && !predictionsChanged" class="w-full bg-white ring-2 ring-green-400 py-2 rounded-md mt-4 flex items-center justify-center" disabled>
                   Predictions Saved ✅
                 </button>
       
                 <button v-else @click="submitPredictions" class="w-full bg-green-600 text-white py-2 rounded-md mt-4">
                   Submit Predictions
                 </button>
               </template>
            </div>
          </div>
      </template>
    </div>

    <DeleteConfirm ref="deleteConfirm" title="Delete Gameweek" message="Are you sure you want to delete this gameweek?" />
  </template>
  
<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userStore } from '../store/userStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import { ShareIcon, LockClosedIcon } from "@heroicons/vue/24/solid";
import { predictionsService } from '../api/predictionsService';
import DateUtils from '../utils/dateUtils';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';
import DeleteConfirm from '../components/DeleteConfirm.vue';
import { predictionsStore } from '../store/predictionsStore';

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

const isAdmin = ref(false);

const predictionsChanged = ref(false);
const matchesChanged = ref(false);

const allPredictionsSubmitted = computed(() => {
  return matches.value.length > 0 && matches.value.every(match => {
    const prediction = predictions.value[match.id];
    return prediction?.predicted_home_score !== '' && prediction?.predicted_away_score !== '';
  });
});
  
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
    previous_home_score: match.final_home_score, // Store initial score
    previous_away_score: match.final_away_score,
    predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? '',
    predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? '',
    prediction_id: predictionsMap[match.id]?.id || null
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
    alert('Gameweek active status changed');
    window.location.reload();
  }
}

async function changeGameWeekLockedStatus() {
  const { data, error } = await gameweeksService.updateGameweek(gameweek.value.id, {
    is_locked: !gameweek.value.is_locked
  });
  
  if (!error) {
    alert('Gameweek locked status changed');
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
  
  async function addMatch() {
    if (!newMatch.value.home_team || !newMatch.value.away_team || !newMatch.value.match_time) {
      alert('Please fill in all fields.');
      return;
    }
  
    const { data, error } = await gameweeksService.createMatch({
      gameweek_id: gameweekId.value,
      home_team: newMatch.value.home_team,
      away_team: newMatch.value.away_team,
      match_time: newMatch.value.match_time
    });
  
    if (!error) {
      matches.value.push(data);
      newMatch.value = { home_team: '', away_team: '', match_time: '' };
    }
  }
  
  async function removeMatch(matchId) {
    await gameweeksService.deleteMatch(matchId);
    matches.value = matches.value.filter(match => match.id !== matchId);
  }
  
async function submitPredictions() {
  console.log(predictions.value);

  for (const [matchId, prediction] of Object.entries(predictions.value)) {
    await predictionsService.savePrediction(
      userStore.user?.id, 
      matchId, 
      prediction.predicted_home_score,
      prediction.predicted_away_score 
    );
  }

  // toggleEditMode();
  alert('Your predictions have been saved!');
  // fetchGameweek();
}

function copyGameweekLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert('Gameweek link copied!');
}

async function saveScores() {
  for (const match of matches.value) {
    try {
      loading.value = true;
      if (
        match.final_home_score !== match.previous_home_score || 
        match.final_away_score !== match.previous_away_score
      ) {
        await predictionsStore.updateMatchScore(match.id, match.final_home_score, match.final_away_score);
        await predictionsService.calculateMatchScores(match.id);
      }
    } catch(err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  alert('Final scores have been saved!');
}

const handlePredictionUpdate = ({ matchId, field, value }) => {
    if (!predictions.value[matchId]) {
        predictions.value[matchId] = { predicted_home_score: 0, predicted_away_score: 0 };
    }
    predictions.value[matchId][field] = value;
    predictionsChanged.value = true;
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
  
function redirectToGroup() {
  router.push(`/group/${gameweek.value.group_id}`);
}

  </script>
  