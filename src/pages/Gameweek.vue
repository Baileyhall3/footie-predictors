<template>
    <div class="p-6 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-4">Gameweek {{ gameweek?.week_number }}</h2>
      <p class="text-lg">Deadline: {{ formatDate(gameweek?.deadline) }}</p>
  
      <!-- Not in group message -->
      <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
        <p>You are not a member of this group.</p>
        <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
          Go to Group
        </button>
      </div>
  
      <!-- Edit Mode Toggle (Admins Only) -->
      <div v-if="isAdmin" class="my-4">
        <button @click="toggleEditMode" class="px-4 py-2 bg-green-600 text-white rounded-md">
          {{ editMode ? 'Exit Edit Mode' : 'Edit Gameweek' }}
        </button>
      </div>
  
      <!-- Matches List -->
      <ul>
        <li v-for="match in matches" :key="match.id" class="flex justify-between bg-gray-100 p-2 rounded-md my-2">
          <span>
            {{ match.home_team }} vs {{ match.away_team }} - {{ formatDate(match.match_time) }}
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
  
      <!-- Add Match (Admins Only) -->
      <div v-if="editMode" class="mt-4">
        <h3 class="text-xl font-semibold">Add Match</h3>
        <input type="text" v-model="newMatch.home_team" placeholder="Home Team" class="p-2 border rounded-md w-full my-2" />
        <input type="text" v-model="newMatch.away_team" placeholder="Away Team" class="p-2 border rounded-md w-full my-2" />
        <input type="datetime-local" v-model="newMatch.match_time" class="p-2 border rounded-md w-full my-2" />
        <button @click="addMatch" class="px-4 py-2 bg-blue-600 text-white rounded-md">Add Match</button>
      </div>
  
      <!-- Predictions -->
      <div v-if="!editMode" class="mt-6">
        <h3 class="text-xl font-semibold">Your Predictions</h3>
        <div v-for="match in matches" :key="match.id" class="flex justify-between items-center bg-gray-100 p-2 rounded-md my-2">
          <span>{{ match.home_team }} vs {{ match.away_team }}</span>
          <div>
            <input type="number" v-model="predictions[match.id].home_score" class="w-12 border rounded-md p-1 text-center" />
            -
            <input type="number" v-model="predictions[match.id].away_score" class="w-12 border rounded-md p-1 text-center" />
          </div>
        </div>
        <button @click="submitPredictions" class="w-full bg-green-600 text-white py-2 rounded-md mt-4">Submit Predictions</button>
      </div>
  
      <!-- Share Gameweek -->
      <button @click="copyGameweekLink" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Share Gameweek</button>
    </div>
  </template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userStore } from '../store/userStore';

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

const isAdmin = computed(() => {
    return members.value.some(member => 
        member.id === userStore.user?.id && member.is_admin
    );
});
  
  // Get user & admin status
//   const user = userStore.getUser();
//   const isAdmin = computed(() => gameweek.value?.group_id && groupsStore.isAdmin(userStore.user?.id, gameweek.value.group_id));
  
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
  
    // Check if user is in the group
    const isMember = members.value.some(member => member.id === userStore.user?.id);
    if (!isMember) {
      notInGroup.value = true;
      return;
    }
  
    const { data: matchData } = await gameweeksService.getMatches(gameweekId.value);
    matches.value = matchData;
  
    // Initialize predictions
    predictions.value = matchData.reduce((acc, match) => {
      acc[match.id] = { home_score: '', away_score: '' };
      return acc;
    }, {});
  }
  
  function toggleEditMode() {
    editMode.value = !editMode.value;
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
    console.log('Predictions:', predictions.value);
    alert('Predictions submitted!');
  }
  
  function copyGameweekLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Gameweek link copied!');
  }
  
  function redirectToGroup() {
    router.push(`/group/${gameweek.value.group_id}`);
  }
  
  function formatDate(date) {
    return new Date(date).toLocaleString();
  }
  </script>
  