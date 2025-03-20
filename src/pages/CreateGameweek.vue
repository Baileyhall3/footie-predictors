<template>
    <div class="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-6">
      <LoadingScreen v-if="loading" />
      <h2 class="text-2xl font-semibold mb-4">Gameweek {{ weekNumber }}</h2>
      <!-- <span class="text-lg"><span class="font-semibold">Step 1:</span> Set a deadline for the gameweek. This will be the cut-off time for predictions to be made.</span> -->
  
      <!-- Deadline Input -->
      <div class="mb-8 mt-4">
        <label class="block text-sm font-medium text-gray-700">Deadline</label>
        <input type="datetime-local" v-model="deadline" class="mt-1 p-2 w-full border rounded-md">
      </div>

      <!-- Active Gameweek Checkbox -->
      <!-- <div class="mb-4 flex items-center">
          <input type="checkbox" id="setActive" v-model="setActive" class="mr-2">
          <label for="setActive" class="text-sm font-medium text-gray-700">Set Active</label>
      </div> -->

      <template v-if="deadline">
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
                @match-removed="handleMatchRemoved"
            />
         </div>
    
        <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>
  
        <button v-if="selectedMatches.length > 0" @click="createGameweek" class="w-full bg-green-600 text-white py-2 rounded-md">Create Gameweek</button>
      </template>
    </div>
  </template>
  
<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService'
import LoadingScreen from "../components/LoadingScreen.vue"; 
import ScoreCard from '../components/ScoreCard.vue';
import AddMatches from '../components/AddMatches.vue';
  
const route = useRoute();
const router = useRouter();

const groupId = route.params.id;
const weekNumber = ref(1);
const deadline = ref('');
const selectedMatches = ref([]);
const setActive = ref(true);
const loading = ref(false);
const errorMessage = ref();

onMounted(async () => {
  loading.value = true;

  const { data: gameweeks } = await gameweeksService.getGameweeks(groupId);
  weekNumber.value = (gameweeks?.length || 0) + 1;

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
  
</script>