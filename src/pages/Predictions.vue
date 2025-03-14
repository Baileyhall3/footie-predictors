<template>
    <div class="container mx-auto px-6 py-8">
        <div class="mb-6">
            <h2 class="text-2xl font-bold mb-4">Your Predictions</h2>
            <LoadingScreen v-if="isLoading" />
            <template v-else>
                <template v-if="userGroups.length > 0">
                    <div v-for="group in userGroups" :key="group.id">
                        <div v-if="group.gameweek" class="bg-white shadow-lg rounded-xl p-6 mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-semibold">
                                    <router-link 
                                        :to="`/group/${group.id}`" 
                                        class="text-blue-600 hover:underline"
                                    >
                                        {{ group.name }}
                                    </router-link>
                                </h3>
                                <router-link 
                                    :to="`/gameweek/${group.gameweek.id}`" 
                                    class="text-sm text-blue-600 hover:underline"
                                >
                                    View Gameweek →
                                </router-link>
                            </div>
                            
                            <div>
                                <div class="items-center flex">
                                    <h3 class="text-xl font-semibold">Gameweek {{ group.gameweek.week_number }}</h3>
                                    <LockClosedIcon class="size-5 ms-2" v-if="group.gameweek.is_locked" />
                                </div>
                        
                                <ScoreCard 
                                    :matches="group.matches"
                                    :predictions="group.predictions"
                                    :locked="group.gameweek.is_locked || !group.gameweek.is_active"
                                    @update-prediction="(data) => handlePredictionUpdate({ ...data, group })"
                                />
                        
                                <template v-if="!group.gameweek.is_locked && group.gameweek.is_active">
                                    <button 
                                        v-if="group.allPredictionsSubmitted && !group.predictionsChanged" 
                                        class="w-full bg-white ring-2 ring-green-400 py-2 rounded-md mt-4 flex items-center justify-center" 
                                        disabled
                                    >
                                        Predictions Saved ✅
                                    </button>
                        
                                    <button 
                                        v-else 
                                        @click="submitPredictions(group)" 
                                        class="w-full bg-green-600 text-white py-2 rounded-md mt-4"
                                    >
                                        Submit Predictions
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <p class="text-gray-500">No groups joined yet.</p>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { groupsStore } from "../store/groupsStore";
import { gameweeksService } from "../api/gameweeksService";
import { predictionsService } from "../api/predictionsService";
import { userStore } from "../store/userStore";
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from "../components/ScoreCard.vue";
import { LockClosedIcon } from "@heroicons/vue/24/solid";

// State
const isLoading = ref(true);
const userGroups = ref([]);

onMounted(async () => {
    await fetchAllData();
});

async function fetchAllData() {
    isLoading.value = true;

    try {
        const { data: groups, error: groupsError } = await groupsStore.fetchUserGroups(userStore.user?.id);
        if (groupsError) throw new Error("Failed to load user groups");

        const gameweekPromises = groups.map(group =>
            gameweeksService.getActiveGameweek(group.id)
        );

        const gameweeksResults = await Promise.all(gameweekPromises);
        const activeGameweeks = gameweeksResults
        .map(result => result.data)
        .filter(gameweek => gameweek !== null);

        const matchPromises = activeGameweeks.map(gameweek =>
            gameweeksService.getMatches(gameweek.id)
        );

        const predictionPromises = activeGameweeks.map(gameweek =>
            predictionsService.getUserGameweekPredictions(userStore.user?.id, gameweek.id)
        );

        const matchesResults = await Promise.all(matchPromises);
        const predictionsResults = await Promise.all(predictionPromises);


        userGroups.value = groups.map((group, index) => {
            const gameweek = activeGameweeks[index];
            if (!gameweek) return { ...group, gameweek: null };

            const matches = matchesResults[index].data || [];
            const predictionsData = predictionsResults[index].data || [];

            // Map predictions by match_id
            const predictionsMap = predictionsData.reduce((acc, prediction) => {
                acc[prediction.match_id] = prediction;
                return acc;
            }, {});

            // Merge predictions into matches
            const mappedMatches = matches.map(match => ({
                ...match,
                previous_home_score: match.final_home_score,
                previous_away_score: match.final_away_score,
                predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? '',
                predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? '',
                prediction_id: predictionsMap[match.id]?.id || null
            }));

            // Initialize predictions object
            const predictions = mappedMatches.reduce((acc, match) => {
                acc[match.id] = {
                    predicted_home_score: match.predicted_home_score,
                    predicted_away_score: match.predicted_away_score
                };
                return acc;
            }, {});

            return {
                ...group,
                gameweek,
                matches: mappedMatches,
                predictions,
                allPredictionsSubmitted: predictionsData.length === matches.length,
                predictionsChanged: false
            };
        });

    } catch (error) {
        console.error(error);
    } finally {
        isLoading.value = false;
    }
}

const handlePredictionUpdate = ({ group, matchId, field, value }) => {
    group.predictions[matchId][field] = value;
    group.predictionsChanged = true;
};

async function submitPredictions(group) {
  for (const [matchId, prediction] of Object.entries(group.predictions)) {
    await predictionsService.savePrediction(
      userStore.user?.id, 
      matchId, 
      prediction.predicted_home_score,
      prediction.predicted_away_score 
    );
  }

  alert('Your predictions have been saved!');
}

</script>
