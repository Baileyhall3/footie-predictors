<template>
    <div class="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-6">
      <h2 class="text-2xl font-semibold mb-4">New Gameweek for {{ group?.name }}</h2>
      <p class="text-lg">Gameweek {{ weekNumber }}</p>
  
      <!-- Deadline Input -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Deadline</label>
        <input type="datetime-local" v-model="deadline" class="mt-1 p-2 w-full border rounded-md">
      </div>

        <!-- Set Manually Checkbox -->
        <div class="mb-4 flex items-center">
            <input type="checkbox" id="setManually" v-model="setManually" class="mr-2">
            <label for="setManually" class="text-sm font-medium text-gray-700">Set Manually</label>
        </div>
  
      <!-- League & Match Selection -->
       <div>
            <template v-if="!setManually">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Select League</label>
                    <select v-model="selectedLeague" @change="fetchMatches" class="mt-1 p-2 w-full border rounded-md">
                    <option v-for="league in leagues" :key="league.id" :value="league.id">
                        {{ league.name }}
                    </option>
                    </select>
                </div>
            
                <div class="mb-4" v-if="selectedLeague">
                    <label class="block text-sm font-medium text-gray-700">Select Match</label>
                    <select v-model="selectedMatch" class="mt-1 p-2 w-full border rounded-md">
                        <option v-for="match in matches" :key="match.id" :value="match">
                            {{ match.home_team }} vs {{ match.away_team }} - {{ match.match_time }}
                        </option>
                    </select>
                    </div>
            </template>
            <template v-else>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Home Team</label>
                    <input type="text" v-model="selectedMatch.home_team" class="mt-1 p-2 w-full border rounded-md">
                </div>
                    
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Away Team</label>
                    <input type="text" v-model="selectedMatch.away_team" class="mt-1 p-2 w-full border rounded-md">
                </div>
                    
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Match Time</label>
                    <input type="datetime-local" v-model="selectedMatch.match_time" class="mt-1 p-2 w-full border rounded-md">
                </div>                
            </template>
            <button @click="addMatch" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">Add Match</button>
        </div>
  
      <!-- Added Matches List -->
      <ul class="mb-4 mt-4">
        <li v-for="(match, index) in selectedMatches" :key="index" class="flex justify-between bg-gray-100 p-2 rounded-md mt-2">
          {{ match.home_team }} vs {{ match.away_team }} - {{ match.match_time }}
          <button @click="removeMatch(index)" class="text-red-500">Remove</button>
        </li>
      </ul>
  
      <!-- Submit Button -->
      <button @click="createGameweek" class="w-full bg-green-600 text-white py-2 rounded-md">Create Gameweek</button>
    </div>
  </template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService'
import { footballApiService } from '../api/footballApiService';  // We'll create this
import { groupsStore } from '../store/groupsStore';
  
const route = useRoute();
const router = useRouter();

const groupId = route.params.id;
const group = ref(null);
const weekNumber = ref(1);
const deadline = ref('');
const leagues = ref([]);
const matches = ref([]);
const selectedLeague = ref(null);
const selectedMatch = ref({
    home_team: '',
    away_team: '',
    match_time: null
});
const selectedMatches = ref([]);
const setManually = ref(false);
  
  onMounted(async () => {
    const { data: groupData } = await groupsStore.fetchGroupById(groupId);
    group.value = groupData;
  
    const { data: gameweeks } = await gameweeksService.getGameweeks(groupId);
    weekNumber.value = (gameweeks?.length || 0) + 1;

    fetchLeagues();
  
    // const { data: leagueData } = await footballApiService.getLeagues();
    // leagues.value = leagueData.map(x => x.league) || [];
  });
  
// Fetch leagues from football-data.org API
async function fetchLeagues() {
  const response = await fetch('https://api.football-data.org/v2/competitions', {
    headers: { 'X-Auth-Token': '8a95ce980f7549e0813011d8a66b519e' }
  });
  const data = await response.json();
  debugger
  return data.competitions;
}

// Fetch matches for a selected league
async function fetchMatches(leagueId) {
  const response = await fetch(`https://api.football-data.org/v2/competitions/${leagueId}/matches`, {
    headers: { 'X-Auth-Token': '8a95ce980f7549e0813011d8a66b519e' }
  });
  const data = await response.json();
  matches.value = data.matches;
}
  
const addMatch = () => {
    if (selectedMatch.value) {
        selectedMatches.value.push({ ...selectedMatch.value })
        selectedMatch.value = { home_team: '', away_team: '', match_time: null }; 
    }
};

  const removeMatch = (index) => {
    selectedMatches.value.splice(index, 1);
  };
  
  const createGameweek = async () => {
    if (!deadline.value || selectedMatches.value.length === 0) return; // add error checking
  
    const { data: newGameweek } = await gameweeksService.createGameweek({
      group_id: groupId,
      week_number: weekNumber.value,
      deadline: deadline.value
    });
  
    if (!newGameweek) return;
  
    for (const match of selectedMatches.value) {
      await gameweeksService.createMatch({
        gameweek_id: newGameweek.id,
        api_match_id: match.id,
        home_team: match.home_team,
        away_team: match.away_team,
        match_time: match.match_time
      });
    }
  
    router.push(`/group/${groupId}`);
  };
  
  </script>
  