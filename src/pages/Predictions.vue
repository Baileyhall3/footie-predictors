<template>
    <div class="container mx-auto py-8">
        <div class="mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold">Your Predictions</h2>
                <SearchBar2 v-if="userGroups.length > 0" v-model="searchQuery" @update:model-value="handleSearchQuery" placeholder="Search for group..." />
            </div>
            <LoadingScreen v-if="isLoading" />
            <template v-else>
                <template v-if="userGroups.length > 0">
                    <div v-for="group in userGroups" :key="group.id">
                        <RoundedContainer v-if="group.gameweek" collapsable>
                            <template #header>
                                <div class=" flex items-center">
                                    <img :src="group.icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
                                    <h3 class="text-xl font-semibold">
                                        <router-link 
                                            :to="`/group/${group.id}`" 
                                            class="hover:text-blue-600"
                                        >
                                            {{ group.name }}
                                        </router-link>
                                    </h3>
                                </div>
                            </template>
                            
                            <div>
                                <ScoreCard 
                                    :matches="group.matches"
                                    :predictions="group.predictions"
                                    :locked="group.gameweek.is_locked || !group.gameweek.is_active"
                                    :includeSubmitBtn="!group.gameweek.is_locked && group.gameweek.is_active"
                                    showActualAndPredictedScores
                                    showLockedIcon
                                    :groupScoring="{ 
                                        exact_score_points: group.exact_score_points,
                                        correct_result_points: group.correct_result_points,
                                        incorrect_points: group.incorrect_points
                                    }"      
                                    @update-prediction="(data) => handlePredictionUpdate({ ...data, group })"
                                    @predictions-submitted="submitPredictions(group)"
                                >
                                    <template #header>
                                        <router-link 
                                            :to="`/gameweek/${group.gameweek.id}`" 
                                            class="text-xl  hover:text-blue-600"
                                        >
                                            <h3 class="text-xl font-semibold">
                                                Gameweek {{ group.gameweek.week_number }}
                                            </h3>
                                        </router-link>
                                    </template>
                                </ScoreCard>
                            </div>
                        </RoundedContainer>
                    </div>
                </template>
                <NoGroupsJoined v-else />
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
import type { Group } from "../types";
import { SearchBar2 } from '../components/UI/input';
import { mapPredictions } from "../utils/sharedFunctions";
import { RoundedContainer } from "../components/UI";
import NoGroupsJoined from "../components/UI/NoGroupsJoined.vue";

const isLoading = ref<boolean>(true);
const userGroups = ref<Array<Group>>([]); // incorrect type
const searchQuery = ref<string>('');
const allUserGroups = ref<Array<Group>>([]);

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
        const finalGroups = activeGroups.map((group, index) => {
            const gameweek = activeGameweeks[index];  // Ensure that active gameweeks correspond correctly to groups
            const matches = matchesResults[index].data || [];
            const predictionsData = predictionsResults[index].data || [];

            const formattedMatches = mapPredictions(predictionsData, matches);

            return {
                ...group,
                gameweek,
                matches: formattedMatches.matches,
                predictions: formattedMatches.predictions,
                allPredictionsSubmitted: predictionsData.length === matches.length,
                predictionsChanged: false
            };
        });

        userGroups.value = finalGroups;
        // console.log('Final Groups with Gameweeks, Matches, and Predictions:', finalGroups);
        allUserGroups.value = finalGroups;

    } catch (error) {
        console.error(error);
    } finally {
        isLoading.value = false;
    }
}

function handleSearchQuery() {
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        userGroups.value = allUserGroups.value.filter(group =>
            group.name.toLowerCase().includes(query)
        );
    } else {
        userGroups.value = allUserGroups.value;
    }
}

const handlePredictionUpdate = ({ group, matchId, field, value }) => {
    group.predictions[matchId][field] = value;
    group.predictionsChanged = true;
};

async function submitPredictions(group) {
  try {
    isLoading.value = true;
      
    const predictionsToSubmit = Object.entries(group.predictions).map(
      ([matchId, prediction]) => ({
        match_id: matchId,
        predicted_home_score: prediction.predicted_home_score ?? 0,
        predicted_away_score: prediction.predicted_away_score ?? 0
      })
    );
  
    const { success, error} = await predictionsService.submitPredictions(userStore.user.id, predictionsToSubmit);
    if (error) {
      toast("An error occurred while submitting your predictions.", {
        "type": "error",
        "position": "top-center"
      });
      throw new Error("An error occurred while submitting your predictions.")
    } else if (success) {
      toast("Your predictions have been saved!", {
        "type": "success",
        "position": "top-center"
      });
    }
  } catch(err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
</script>
