<template>
    <LoadingScreen v-if="loading" />
    <NoAccess v-else-if="!gameweek?.is_locked" message="Gameweek is not locked yet." />
    <div class="container mx-auto py-8" v-else>
        <template v-if="predictions.length > 0">
            <ScoreCard2
                :matches="predictions"
                :header="`${user?.username}'s Gameweek ${gameweek?.week_number} Predictions`"
                :totalPoints="totalPoints"
                matchesClickable
            >
            </ScoreCard2>
        </template>
        <template v-if="predictions.length === 0 && user?.username">
            <div class="min-h-screen flex flex-col items-center bg-gray-100 text-center px-4">
                <h1 class="text-7xl font-extrabold text-gray-800 mb-4 animate-pulse">
                    😞
                </h1>                    
                <p class="text-xl text-gray-600 mb-6">
                    {{ user?.username }} has not made any predictions for gameweek {{ gameweek?.week_number }} yet.
                </p>
            </div>
        </template>
        <template v-if="predictions.length === 0 && !user?.username">
            <DoesNotExist entity="user's gameweek predictions" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { predictionsService } from '../api/predictionsService';
import { predictionsStore } from '../store/predictionsStore';
import { userStore } from '../store/userStore';
import LoadingScreen from '../components/LoadingScreen.vue';
import ScoreCard2 from '../components/ScoreCard2.vue';
import DoesNotExist from '../components/DoesNotExist.vue';
import NoAccess from '../components/NoAccess.vue';
import { Prediction } from '../types';

const route = useRoute();

const loading = ref<boolean>(true);
const userId = ref<string | null>(null);
const user = ref({});
const gameweekId = ref<string | null>(null);
const predictions = ref<Array<Prediction>>([]);
const totalPoints = ref<number | undefined>();
const gameweek = ref({});

onMounted(() => {
    fetchAllData();
});

// try and use match_predictions view 
async function fetchAllData() {
    try {
        gameweekId.value = route.params.gameweek_id || route.query.gameweek_id;
        userId.value = route.params.user_id || route.query.user_id;
    
        if (!userId.value || !gameweekId.value) {
            throw new Error('User ID or gameweek ID is missing');
        }

        const { data: gameweekData, error: gameweekError } = await predictionsStore.fetchGameweek(gameweekId.value);
        if (gameweekError) {
            throw new Error(`Gameweek error: ${gameweekError}`)
        }
        gameweek.value = gameweekData;

        if (!gameweek.value.is_locked) {
            return
        }

        const { data: predictionsData, error: predictionsError } = await predictionsService.getUserGameweekPredictionsUsingView(userId.value, gameweekId.value)
        if (predictionsError) {
            throw new Error(`Predictions error: ${predictionsError}`)
        }

        if (predictionsData) {
            predictions.value = predictionsData.predictions;
            totalPoints.value = predictionsData.totalPoints;
        }

        const { data: userData, error: userError } = await userStore.getUser(userId.value)
        if (userError) {
            throw new Error(`User error: ${userError}`)
        }

        user.value = userData;

    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}
</script>