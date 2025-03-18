<template>
    <div class="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-6">
      <LoadingScreen v-if="loading" />
      <h2 class="text-2xl font-semibold mb-4">New Gameweek for {{ group?.name }}</h2>
      <p class="text-lg">Gameweek {{ weekNumber }}</p>
  
      <!-- Deadline Input -->
      <div class="mb-4 mt-4">
        <label class="block text-sm font-medium text-gray-700">Deadline</label>
        <input type="datetime-local" v-model="deadline" class="mt-1 p-2 w-full border rounded-md">
      </div>

      <!-- Active Gameweek Checkbox -->
      <!-- <div class="mb-4 flex items-center">
          <input type="checkbox" id="setActive" v-model="setActive" class="mr-2">
          <label for="setActive" class="text-sm font-medium text-gray-700">Set Active</label>
      </div> -->

      <!-- Set Manually Checkbox -->
      <div class="mb-4 flex items-center">
          <input type="checkbox" id="setManually" v-model="setManually" class="mr-2">
          <label for="setManually" class="text-sm font-medium text-gray-700">Custom Match</label>
      </div>
  
      <!-- League & Match Selection -->
       <div>
          <template v-if="!setManually">
            <div class="mb-4" ref="leagueDropdown">
              <label class="block text-sm font-medium text-gray-700">Select League</label>
              <div class="relative">
                <button @click="toggleLeagueDropdown"
                        class="mt-1 p-2 w-full border rounded-md flex justify-between items-center">
                  <span v-if="selectedLeague">
                    <img :src="selectedLeague.emblem" alt="League Emblem" class="w-6 h-6 inline-block mr-2">
                    {{ selectedLeague.name }}
                  </span>
                  <span v-else>Select a league</span>
                </button>
                
                <ul v-if="leagueDropdownOpen" class="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-20">
                  <li v-for="league in leagues" :key="league.id" 
                      @click="selectLeague(league)"
                      class="p-2 hover:bg-gray-100 flex items-center cursor-pointer">
                    <img :src="league.emblem" alt="League Emblem" class="w-6 h-6 mr-2">
                    {{ league.name }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="mb-4" ref="teamsDropdown" v-if="selectedLeague">
              <label class="block text-sm font-medium text-gray-700">Select Team (optional)</label>
              <div class="relative">
                <button @click="toggleTeamsDropdown"
                        class="mt-1 p-2 w-full border rounded-md flex justify-between items-center">
                  <span v-if="selectedTeam">
                    <img :src="selectedTeam.crest" alt="Team Crest" class="w-6 h-6 inline-block mr-2">
                    {{ selectedTeam.shortName }}
                  </span>
                  <span v-else>Select a team</span>
                </button>
                
                <ul v-if="teamsDropdownOpen" class="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-20">
                  <li v-for="team in teams" :key="team.id" 
                      @click="selectTeam(team)"
                      class="p-2 hover:bg-gray-100 flex items-center cursor-pointer">
                    <img :src="team.crest" alt="Team Crest" class="w-6 h-6 mr-2">
                    {{ team.shortName }}
                  </li>
                </ul>
              </div>
            </div>
          
            <div class="mb-4" v-if="selectedLeague" ref="matchesDropdown">
              <label class="block text-sm font-medium text-gray-700">Select Match</label>
              
              <!-- Button to toggle dropdown -->
              <div class="relative">
                <button @click="toggleMatchesDropdown"
                        class="mt-1 p-2 w-full border rounded-md flex justify-between items-center">
                  <span v-if="selectedMatch">
                    <img :src="selectedMatch.home_team_crest" alt="Home Team" class="w-6 h-6 inline-block mr-2">
                    {{ selectedMatch.home_team }} vs {{ selectedMatch.away_team }}
                    <img :src="selectedMatch.away_team_crest" alt="Away Team" class="w-6 h-6 inline-block ml-2">
                  </span>
                  <span v-else>Select a match</span>
                </button>

                <!-- Dropdown -->
                <ul v-if="matchesDropdownOpen" class="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
                  <li v-for="match in matches" :key="match.id"
                      @click="selectMatch(match)"
                      :class="{
                        'bg-blue-100': selectedMatches.some(m => m.api_match_id === match.id),
                        'hover:bg-gray-100': !selectedMatches.some(m => m.api_match_id === match.id)
                      }"
                      class="p-2 cursor-pointer flex flex-col items-center border-b">
                    <!-- Match Teams & Crests -->
                    <div class="flex items-center w-full justify-between">
                      <img :src="match.homeTeam.crest" alt="Home Team" class="w-6 h-6 mr-2">
                      <span class="text-sm font-medium">{{ match.homeTeam.shortName }} vs {{ match.awayTeam.shortName }}</span>
                      <img :src="match.awayTeam.crest" alt="Away Team" class="w-6 h-6 ml-2">
                    </div>
                    <!-- Match Date (Centered) -->
                    <span class="text-xs text-gray-500 mt-1">
                      {{ DateUtils.toDateTime(match.utcDate) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </template>
          <template v-else>
              <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700">Home Team</label>
                  <input type="text" v-model="manuallySelectedMatch.home_team" class="mt-1 p-2 w-full border rounded-md">
              </div>
                  
              <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700">Away Team</label>
                  <input type="text" v-model="manuallySelectedMatch.away_team" class="mt-1 p-2 w-full border rounded-md">
              </div>
                  
              <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700">Match Time</label>
                  <input type="datetime-local" v-model="manuallySelectedMatch.match_time" class="mt-1 p-2 w-full border rounded-md">
              </div>                
              <button @click="addMatch" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">Add Match</button>
          </template>
        </div>
  
      <!-- Added Matches List -->
       <div class="mt-4" v-if="selectedMatches.length > 0">
         <p class="text-lg">Matches</p>
         <ul class="mb-4 mt-4">
           <li v-for="(match, index) in selectedMatches" :key="index" class="flex justify-between bg-gray-100 p-2 rounded-md mt-2">
             {{ match.home_team }} vs {{ match.away_team }} - {{ DateUtils.toDateTime(match.match_time) }}
             <button @click="removeMatch(index)" class="text-red-500">Remove</button>
           </li>
         </ul>
       </div>
  
      <!-- Submit Button -->
      <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>

      <button v-if="selectedMatches.length > 0" @click="createGameweek" class="w-full bg-green-600 text-white py-2 rounded-md">Create Gameweek</button>
    </div>
  </template>
  
<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService'
import { groupsStore } from '../store/groupsStore';
import DateUtils from '../utils/dateUtils';
import LoadingScreen from "../components/LoadingScreen.vue"; 
import { footballApiService } from '../api/footballApiService';
  
const route = useRoute();
const router = useRouter();

const groupId = route.params.id;
const group = ref(null);
const weekNumber = ref(1);
const deadline = ref('');
const leagues = ref([]);
const teams = ref([]);
const matches = ref([]);
const selectedLeague = ref();
const manuallySelectedMatch = ref({
  home_team: '',
  away_team: '',
  match_time: null
});
const selectedMatch = ref();
const selectedTeam = ref();
const selectedMatches = ref([]);
const setManually = ref(false);
const setActive = ref(true);
const loading = ref(false);
const errorMessage = ref();

const leagueDropdownOpen = ref(false);
const leagueDropdown = ref(null);
const teamsDropdownOpen = ref(false);
const teamsDropdown = ref(null);
const matchesDropdownOpen = ref(false);
const matchesDropdown = ref(null);

const toggleLeagueDropdown = () => {
  leagueDropdownOpen.value = !leagueDropdownOpen.value;
};

const toggleTeamsDropdown = () => {
  teamsDropdownOpen.value = !teamsDropdownOpen.value
}

const toggleMatchesDropdown = () => {
  matchesDropdownOpen.value = !matchesDropdownOpen.value;
};

// Function to close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (leagueDropdown.value && !leagueDropdown.value.contains(event.target)) {
    leagueDropdownOpen.value = false;
  }
  if (teamsDropdown.value && !teamsDropdown.value.contains(event.target)) {
    teamsDropdownOpen.value = false;
  }
  if (matchesDropdown.value && !matchesDropdown.value.contains(event.target)) {
    matchesDropdownOpen.value = false;
  }
};

const selectLeague = async(league) => {
  selectedLeague.value = league;
  leagueDropdownOpen.value = false;
  const { data: teamsData } = await footballApiService.getTeams(league.id);
  teams.value = teamsData;
};

const selectTeam = async(team) => {
  selectedTeam.value = team;
  teamsDropdownOpen.value = false;
};

const selectMatch = (match) => {
  // Toggle the selection of the match
  const matchIndex = selectedMatches.value.findIndex(m => m.api_match_id === match.id);
  if (matchIndex === -1) {
    // If the match is not already selected, add it to the selectedMatches array
    const mappedMatch = {
      api_match_id: match.id,
      home_team: match.homeTeam.shortName,
      away_team: match.awayTeam.shortName,
      home_team_api_id: match.homeTeam.id,
      away_team_api_id: match.awayTeam.id,
      home_team_crest: match.homeTeam.crest,
      away_team_crest: match.awayTeam.crest,
      match_time: match.utcDate
    };
    selectedMatches.value.push(mappedMatch);
  } else {
    // If the match is already selected, remove it from the selectedMatches array
    selectedMatches.value.splice(matchIndex, 1);
  }
};
  
onMounted(async () => {
  loading.value = true;
  document.addEventListener("click", handleClickOutside);
  const { data: groupData } = await groupsStore.fetchGroupById(groupId);
  group.value = groupData;

  const { data: gameweeks } = await gameweeksService.getGameweeks(groupId);
  weekNumber.value = (gameweeks?.length || 0) + 1;

  fetchLeagues();
});

watch(() => selectedLeague.value, (newVal) => {
  fetchMatches(newVal.id, null);
});

watch(() => selectedTeam.value, (newVal) => {
  fetchMatches(null, newVal.id);
});

// Fetch leagues from football-data.org API
async function fetchLeagues() {
  const { data: leagueData } = await footballApiService.getLeagues();
  leagues.value = leagueData;
  loading.value = false;
}

// Fetch matches for a selected league
async function fetchMatches(leagueId, teamId) {
  const { data: matchesData } = await footballApiService.getMatches(leagueId, teamId);

  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const upcomingMatches = matchesData.filter(x => new Date(x.utcDate) >= today);
  matches.value = upcomingMatches;

}

const addMatch = () => {
  if (selectedMatch.value) {
      selectedMatches.value.push({ ...selectedMatch.value })
      selectedMatch.value = null;
      return;
  }
  if (manuallySelectedMatch.value.home_team != '' && manuallySelectedMatch.value.away_team != '' && manuallySelectedMatch.value.match_time) {
    selectedMatches.value.push({ ...manuallySelectedMatch.value })
    manuallySelectedMatch.value = { home_team: '', away_team: '', match_time: null }; 
  }
};

const removeMatch = (index) => {
  selectedMatches.value.splice(index, 1);
};
  
const createGameweek = async () => {
  if (!deadline.value) {
    errorMessage.value = 'Please enter a deadline for the gameweek.';
    return;
  }
  if (selectedMatches.value.length === 0) {
    errorMessage.value = 'Please add some matches to the gameweek.'
    return;
  }

  loading.value = true;
      
  const { data: newGameweek } = await gameweeksService.createGameweek({
    group_id: groupId,
    week_number: weekNumber.value,
    deadline: deadline.value,
    is_active: setActive.value
  });

  if (!newGameweek) return;

  for (const match of selectedMatches.value) {
    await gameweeksService.createMatch({
      gameweek_id: newGameweek.id,
      api_match_id: match.api_match_id,
      home_team: match.home_team,
      away_team: match.away_team,
      match_time: match.match_time,
      home_team_api_id: match.home_team_api_id,
      away_team_api_id: match.away_team_api_id,
      home_team_crest: match.home_team_crest,
      away_team_crest: match.away_team_crest
    });
  }

  router.push(`/group/${groupId}`);
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
  
</script>