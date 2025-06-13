<template>
  <template v-if="!isAdmin && !loading">
    <NoAccess />
  </template>
  
  <div v-else class="container mx-auto py-8">
    <div class="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
      <LoadingScreen v-if="loading" />
  
      <h2 class="text-2xl font-semibold mb-4">Gameweek {{ weekNumber }}</h2>
      <!-- <span class="text-lg"><span class="font-semibold">Step 1:</span> Set a deadline for the gameweek. This will be the cut-off time for predictions to be made.</span> -->

      <div class="mb-8 mt-4">
        <label class="block text-sm font-medium text-gray-700">Deadline</label>
        <div class="p-2 border border-gray-300 rounded-md">
            <DatePicker 
                v-model="deadline" 
                showIcon 
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                class="w-full"
                :minDate="minDateTime"
                fluid
                hideOnDateTimeSelect
            />
        </div>
      </div>

      <div class="mb-4 mt-4 flex items-center">
          <input type="checkbox" id="setManually" v-model="setActive" class="mr-2">
          <label for="setManually" class="text-sm font-medium text-gray-700">Set Active</label>
      </div>
      <p v-if="setActive" class="text-gray-600 text-sm">A group can only have 1 active gameweek. Setting this gameweek as active will end the current active season.</p>
  
      <div v-if="deadline" class="border-t mt-4">
        <AddMatches 
          :deadline="deadline"
          :selectedMatches="selectedMatches"
          @error-message="handleErrorMessage"
        />
    
        <!-- Added Matches List -->
        <div class="mt-4 mb-4" v-if="selectedMatches.length > 0">
          <p class="text-lg font-semibold">Matches</p>
          <ScoreCard 
              :matches="selectedMatches"
              canRemove
              oneMatchPerRow
              @match-removed="handleMatchRemoved"
          />
        </div>
    
        <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>
  
        <button v-if="selectedMatches.length > 0" @click="createGameweek" class="w-full bg-green-600 text-white py-2 rounded-md">Create Gameweek</button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService'
import LoadingScreen from "../components/LoadingScreen.vue"; 
import ScoreCard from '../components/ScoreCard.vue';
import AddMatches from '../components/AddMatches.vue';
import NoAccess from '../components/NoAccess.vue';
import { userIsAdmin } from '../utils/checkPermissions';
import { groupsStore } from '../store/groupsStore';
import { seasonsService } from '../api/seasonsService';
  
const route = useRoute();
const router = useRouter();

const groupId = route.params.id;
const weekNumber = ref(1);
const deadline = ref('');
const selectedMatches = ref([]);
const setActive = ref(true);
const loading = ref(false);
const errorMessage = ref();
const isAdmin = ref(false);
const groupExists = ref(true);

const minDateTime = computed(() => {
  return new Date();
});

onMounted(async () => {
  loading.value = true;

  const { data: groupData, error: groupError } = await groupsStore.fetchGroupById(groupId);
  console.log(groupError)
  if (groupError && groupError.code === "PGRST116") {
    groupExists.value = false;
    loading.value = false;
    return;
  }
  if (groupError) throw new Error('Failed to load group details');

  const { data: gameweeks, error } = await seasonsService.getSeasonGameweeks(groupData.active_season_id);

  // const { data: gameweeks } = await gameweeksService.getGameweeks(groupId);
  weekNumber.value = (gameweeks?.length || 0) + 1;

  const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(groupId);
  if (membersError) throw new Error('Failed to load group members');

  isAdmin.value = userIsAdmin(membersData);

  loading.value = false;
});

const handleMatchRemoved = async(matchId) => {
  const matchIndex = selectedMatches.value.findIndex(m => m.id === matchId);

  if (matchIndex !== -1) {  // Ensure the item exists
    selectedMatches.value.splice(matchIndex, 1);
  }
}

const handleErrorMessage = (errorMsg) => {
  errorMessage.value = errorMsg;
}

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

  const hasInvalidMatchTime = selectedMatches.value.some(match => new Date(match.match_time) < new Date(deadline.value));

  if (hasInvalidMatchTime) {
      errorMessage.value = 'One or more matches have a match time before the gameweek deadline.';
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

function handleInput(event) {
    console.log('hellooo', event)
}
</script>

<style>
:root {
    --time-picker-padding: 1rem; /* 16px */
    --time-picker-gap: 0.5rem; /* 8px */
    --p-datepicker-time-picker-button-gap: 0.25rem;
    --p-datepicker-time-picker-padding: 1rem;
    --p-datepicker-time-picker-gap: 0.25rem;
    --p-datepicker-title-gap: 0.5rem;
    --p-datepicker-panel-padding: 0.5rem;
}
</style>