<template>
    <div class="container mx-auto px-6 py-8">
      <div v-if="!notInGroup" class="mb-1 ms-1">
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
    
        <!-- Not in group message -->
        <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
          <p>You are not a member of this group.</p>
          <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
            Go to Group
          </button>
        </div>
    
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
           <button @click="changeActiveStatus" class="px-4 py-2 bg-purple-600 text-white rounded-md">
              {{ gameweek?.is_active ? 'Make gameweek inactive' : 'Make gameweek active' }}
            </button>
            <button @click="changeGameWeekLockedStatus" class="px-4 py-2 bg-red-600 text-white rounded-md">
              {{ gameweek?.is_locked ? 'Unlock gameweek' : 'Lock gameweek' }}
            </button>
         </div>
      </div>
      
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <!-- Matches List -->
        <h3 class="text-xl font-semibold">Matches</h3>
        <div v-for="(matchGroup, day) in groupedMatches" :key="day" class="mt-6">
          <!-- Date Heading -->
          <h3 class="text-lg mb-2">{{ day }}</h3>
          
          <!-- Matches List -->
          <ul>
            <li v-for="match in matchGroup" :key="match.id" class="flex justify-between bg-gray-100 p-2 rounded-md my-2">
              <span>
                <span class="font-semibold">{{ match.home_team }}</span> vs <span class="font-semibold">{{ match.away_team }}</span> - {{ DateUtils.toTime(match.match_time) }}
                <span v-if="match.final_home_score !== null">({{ match.final_home_score }} - {{ match.final_away_score }})</span>
              </span>

              <!-- Edit Score (Admins Only) -->
              <div v-if="editMode">
                <input type="number" v-model="match.final_home_score" class="w-12 border rounded-md p-1 text-center" />
                -
                <input type="number" v-model="match.final_away_score" class="w-12 border rounded-md p-1 text-center" />
                <button @click="saveScore(match)" class="ml-2 text-green-600">Save</button>
                <button @click="removeMatch(match.id)" class="ml-2 text-red-600">Remove</button>
              </div>
            </li>
          </ul>
        </div>

    
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
          <h3 class="text-xl font-semibold">Your Predictions</h3>
          <div v-for="match in matches" :key="match.id" class="flex justify-between items-center bg-gray-100 p-2 rounded-md my-2">
            <span>
              <span class="font-semibold">{{ match.home_team }}</span> vs <span class="font-semibold">{{ match.away_team }}</span>
            </span>
            <div>
              <input type="number" v-model="predictions[match.id].home_score" class="w-12 border rounded-md p-1 text-center" />
              -
              <input type="number" v-model="predictions[match.id].away_score" class="w-12 border rounded-md p-1 text-center" />
            </div>
          </div>
          <button @click="submitPredictions" class="w-full bg-green-600 text-white py-2 rounded-md mt-4">Submit Predictions</button>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userStore } from '../store/userStore';
import { userIsAdmin } from "../utils/checkPermissions";
import { ShareIcon } from "@heroicons/vue/24/solid";
import { predictionsService } from '../api/predictionsService';
import DateUtils from '../utils/dateUtils';

const route = useRoute();
const router = useRouter();

const gameweekId = ref(null);
const gameweek = ref(null);
const matches = ref([]);
const editMode = ref(false);
const newMatch = ref({ home_team: '', away_team: '', match_time: '' });
const predictions = ref({});
const notInGroup = ref(false);
const members = ref([]);

const isAdmin = ref(false);

const groupedMatches = computed(() => {
  return matches.value.reduce((acc, match) => {
    const matchDay = DateUtils.toShortDayMonth(match.match_time); // "Mon Dec 30"

    if (!acc[matchDay]) {
      acc[matchDay] = [];
    }
    acc[matchDay].push(match);
    
    return acc;
  }, {});
});
  
onMounted(async () => {
  await fetchGameweek();
});
  
async function fetchGameweek() {
  gameweekId.value = route.params.id || route.query.id;

  const { data, error } = await gameweeksService.getGameweekById(gameweekId.value);
  if (error) return console.error(error);
  gameweek.value = data;

  const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(data.group_id);
  if (membersError) throw new Error('Failed to load group members');
  members.value = membersData || [];

  isAdmin.value = userIsAdmin(members.value);

  // Check if user is in the group
  const isMember = members.value.some(member => member.id === userStore.user?.id);
  if (!isMember) {
    notInGroup.value = true;
    return;
  }

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
    predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? '',
    predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? '',
    prediction_id: predictionsMap[match.id]?.id || null
  }));

  // Initialize predictions object for v-model binding
  predictions.value = matches.value.reduce((acc, match) => {
    acc[match.id] = {
      home_score: match.predicted_home_score,
      away_score: match.predicted_away_score
    };
    return acc;
  }, {});
}

  
function toggleEditMode() {
  editMode.value = !editMode.value;
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
  
  async function saveScore(match) {
    await gameweeksService.updateMatchScore(match.id, match.final_home_score, match.final_away_score);
  }
  
  async function submitPredictions() {
    console.log(predictions.value);

    for (const [matchId, prediction] of Object.entries(predictions.value)) {
      await predictionsService.savePrediction(
        userStore.user?.id, 
        matchId, 
        prediction.home_score,
        prediction.away_score 
      );
    }

    alert('Your predictions have been saved!');
  }

  
  function copyGameweekLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Gameweek link copied!');
  }
  
  function redirectToGroup() {
    router.push(`/group/${gameweek.value.group_id}`);
  }

  </script>
  