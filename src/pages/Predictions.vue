<template>
    <div class="container mx-auto py-8">
        <div class="mb-6">
            <h2 class="text-2xl font-bold mb-4">Your Predictions</h2>
            <LoadingScreen v-if="isLoading" />
            <template v-else>
                <template v-if="userGroups.length > 0">
                    <div v-for="group in userGroups" :key="group.id">
                        <div v-if="group.gameweek" class="bg-white shadow-lg rounded-xl p-6 mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <div class=" flex items-center">
                                    <img :src="group.icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
                                    <h3 class="text-xl font-semibold">
                                        <router-link 
                                            :to="`/group/${group.id}`" 
                                            class="text-blue-600 hover:underline"
                                        >
                                            {{ group.name }}
                                        </router-link>
                                    </h3>
                                </div>
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
                                    :includeSubmitBtn="!group.gameweek.is_locked && group.gameweek.is_active"
                                    @update-prediction="(data) => handlePredictionUpdate({ ...data, group })"
                                    @predictions-submitted="submitPredictions(group)"
                                />
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
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// State
const isLoading = ref(true);
const userGroups = ref([]);

onMounted(async () => {
    await fetchAllData();
});

async function fetchAllData() {
    isLoading.value = true;

    try {
        let loadedGroups = []
        if (groupsStore.groups.length === 0) {
            const { data: groups, error: groupsError } = await groupsStore.fetchUserGroups();
            if (groupsError) throw new Error('Failed to load your groups');
            loadedGroups = groups;
        } else {
            console.log('Using stored groups')
            loadedGroups = groupsStore.groups;
        }

        // Fetch active gameweeks for each group
        const gameweekPromises = loadedGroups.map(group =>
            gameweeksService.getActiveGameweek(group.id)
        );

        const gameweeksResults = await Promise.all(gameweekPromises);
        
        // Filter out groups that don't have an active gameweek
        const activeGameweeks = gameweeksResults
            .map(result => result.data)
            .filter(gameweek => gameweek !== null);
        
        // If there are no active gameweeks, exit early
        if (activeGameweeks.length === 0) {
            userGroups.value = [];
            return;
        }

        // Fetch matches and predictions only for active gameweeks
        const matchPromises = activeGameweeks.map(gameweek =>
            gameweeksService.getMatches(gameweek.id)
        );
        const predictionPromises = activeGameweeks.map(gameweek =>
            predictionsService.getUserGameweekPredictions(userStore.user?.id, gameweek.id)
        );

        const matchesResults = await Promise.all(matchPromises);
        const predictionsResults = await Promise.all(predictionPromises);

        // Create a mapping of groups to their active gameweek
        const activeGroups = loadedGroups.filter(group => 
            activeGameweeks.some(gameweek => gameweek.group_id === group.id)
        );

        // Now, map over the active groups, and assign matches and predictions
        userGroups.value = activeGroups.map((group, index) => {
            const gameweek = activeGameweeks[index];  // Ensure that active gameweeks correspond correctly to groups
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
    isLoading.value = true;
    for (const [matchId, prediction] of Object.entries(group.predictions)) {
        await predictionsService.savePrediction(
            userStore.user?.id, 
            matchId, 
            prediction.predicted_home_score ? prediction.predicted_home_score : 0,
            prediction.predicted_away_score ? prediction.predicted_away_score : 0
        );
    }

    toast("Predictions have been saved!", {
        "type": "success",
        "position": "top-center"
    });
    isLoading.value = false;
}

</script>
