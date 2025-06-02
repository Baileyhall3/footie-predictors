<template>
    <!-- Set Manually Checkbox -->
    <div class="mb-4 mt-4 flex items-center">
        <input type="checkbox" id="setManually" v-model="setManually" class="mr-2">
        <label for="setManually" class="text-sm font-medium text-gray-700">Custom Match</label>
    </div>

    <!-- League & Match Selection -->
    <div>
        <template v-if="!setManually">
            <div class="mb-4" ref="leagueDropdown">
                <label class="block text-sm font-medium text-gray-700">Select League</label>
                <div class="relative">
                    <button 
                        @click="toggleLeagueDropdown"
                        class="mt-1 p-2 w-full border rounded-md flex justify-between items-center"
                    >
                        <span v-if="selectedLeague">
                            <img :src="selectedLeague.emblem" alt="League Emblem" class="w-6 h-6 inline-block mr-2">
                            {{ selectedLeague.name }}
                        </span>
                        <span v-else>Select...</span>
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
                    <button 
                        @click="toggleTeamsDropdown"
                        class="mt-1 p-2 w-full border rounded-md flex justify-between items-center"
                    >
                        <span v-if="selectedTeam">
                            <img :src="selectedTeam.crest" alt="Team Crest" class="w-6 h-6 inline-block mr-2">
                            {{ selectedTeam.shortName }}
                        </span>
                        <span v-else>Select...</span>
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
                    <button 
                        @click="toggleMatchesDropdown"
                        class="mt-1 p-2 w-full border rounded-md flex justify-between items-center"
                    >
                        <span>Select...</span>
                    </button>

                    <!-- Dropdown -->
                    <ul v-if="matchesDropdownOpen" class="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
                        <li v-for="match in matches" :key="match.id"
                            @click="selectMatch(match)"
                            :class="{
                                'bg-blue-100': props.selectedMatches.some(m => m.api_match_id === match.id),
                                'hover:bg-gray-100': !props.selectedMatches.some(m => m.api_match_id === match.id)
                            }"
                            class="p-2 cursor-pointer flex flex-col items-center border-b"
                        >
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
                <div class="p-2 border border-gray-300 rounded-md">
                    <DatePicker 
                        v-model="manuallySelectedMatch.match_time" 
                        showIcon 
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        class="w-full"
                        :minDate="minDateTime"
                        fluid
                    />
                </div>
            </div>                
            <button 
                @click="addMatch" 
                :disabled="!manuallySelectedMatch.home_team || !manuallySelectedMatch.away_team || !manuallySelectedMatch.match_time" 
                class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 w-full"
            >
                Add Match
            </button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import DateUtils from '../utils/dateUtils';
import { footballApiService } from '../api/footballApiService';

interface MatchItem {
    id: string;
    isNew: boolean;
    api_match_id?: string | null;
    home_team: string;
    away_team: string;
    home_team_api_id?: string | null;
    away_team_api_id?: string | null;
    home_team_crest?: string | null;
    away_team_crest?: string | null;
    match_time: Date | string;
}

export interface IProps {
    deadline: Date | string;
    selectedMatches: Array<MatchItem>;
}

const props = defineProps<IProps>();
const emit = defineEmits(["error-message", "match-added", "match-removed"]);

const leagues = ref([]);
const teams = ref([]);
const matches = ref([]);
const selectedLeague = ref();
const selectedMatch = ref();
const selectedTeam = ref();
const setManually = ref(false);

const minDateTime = computed(() => {
    return new Date(props.deadline);
});

const manuallySelectedMatch = ref({
    id: crypto.randomUUID(),
    home_team: '',
    away_team: '',
    match_time: null
});

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
const handleClickOutside = (event: any) => {
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

const selectLeague = async(league: any) => {
  selectedLeague.value = league;
  leagueDropdownOpen.value = false;
  const { data: teamsData } = await footballApiService.getTeams(league.id);
  teams.value = teamsData;
};

const selectTeam = async(team: any) => {
  selectedTeam.value = team;
  teamsDropdownOpen.value = false;
};

const selectMatch = (match: any) => {
  // Toggle the selection of the match
  const matchIndex = props.selectedMatches.findIndex(m => m.api_match_id === match.id);
  if (matchIndex === -1) {
    // If the match is not already selected, add it to the selectedMatches array
    const mappedMatch = {
        id: crypto.randomUUID(),
        isNew: true,
        api_match_id: match.id,
        home_team: match.homeTeam.shortName,
        away_team: match.awayTeam.shortName,
        home_team_api_id: match.homeTeam.id,
        away_team_api_id: match.awayTeam.id,
        home_team_crest: match.homeTeam.crest,
        away_team_crest: match.awayTeam.crest,
        match_time: match.utcDate
    };
    props.selectedMatches.push(mappedMatch);
    emit("match-added", match);
  } else {
    // If the match is already selected, remove it from the selectedMatches array
    emit("match-removed", match.id);
    props.selectedMatches.splice(matchIndex, 1);
  }
};
  
onMounted(async () => {
    document.addEventListener("click", handleClickOutside);
    fetchLeagues();
});

watch(() => selectedLeague.value, (newVal) => {
  fetchMatches(newVal.id, null);
});

watch(() => selectedTeam.value, (newVal) => {
  fetchMatches(null, newVal.id);
});

watch(() => props.deadline, (newVal) => {
  const newDeadlineMatches = matches.value.filter(x => new Date(x.utcDate) >= new Date(newVal));
  matches.value = newDeadlineMatches;
});

// Fetch leagues from football-data.org API
async function fetchLeagues() {
  const { data: leagueData } = await footballApiService.getLeagues();
  leagues.value = leagueData;
}

// Fetch matches for a selected league
async function fetchMatches(leagueId: string | null, teamId: string | null) {
    const { data: matchesData } = await footballApiService.getMatches(leagueId, teamId);

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const deadlineDate = new Date(props.deadline);

    const upcomingMatches = matchesData.filter(x => new Date(x.utcDate) >= deadlineDate);
    matches.value = upcomingMatches;
}

const addMatch = () => {
//   if (selectedMatch.value) {
//       props.selectedMatches.push({ ...selectedMatch.value })
//       selectedMatch.value = null;
//       return;
//   }
  if (manuallySelectedMatch.value.home_team != '' && manuallySelectedMatch.value.away_team != '' && manuallySelectedMatch.value.match_time) {
    if (manuallySelectedMatch.value.match_time && new Date(manuallySelectedMatch.value.match_time) < new Date(props.deadline)) {
      emit("error-message", 'Match time cannot be earlier than the deadline.');
      return;
    }
    emit("error-message", '');
    props.selectedMatches.push({ ...manuallySelectedMatch.value, id: crypto.randomUUID(), isNew: true });
    emit("match-added", manuallySelectedMatch.value);
    manuallySelectedMatch.value = { id: crypto.randomUUID(), home_team: '', away_team: '', match_time: null }; 
  }
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
  
</script>