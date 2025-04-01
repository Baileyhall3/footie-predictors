<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        
        <div class="mb-1 ms-1">
            <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 hover:underline font-medium">
                ← Back to group
            </router-link>
        </div>

        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex items-center gap-2 mb-4">
                <h2 class="text-2xl font-semibold">Gameweek {{ gameweek?.week_number }}</h2>
            </div>
            <p class="text-lg"><span class="font-semibold">Deadline:</span> {{ DateUtils.toFullDateTime(gameweek?.deadline) }}</p>
        
            <!-- Edit Mode Toggle (Admins Only) -->
            <div class="flex flex-wrap gap-2 mt-4">
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="showAllUsers" class="sr-only peer">
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show all fake users</span>
                </label>
            </div>
        </div>

        <!-- Predictions Section -->
        <div v-for="(userData, userId) in groupedPredictions" :key="userId" class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h3 class="text-xl font-semibold">{{ userData.username }}'s Predictions</h3>
            <ScoreCard 
                :matches="matches"
                :predictions="userData.predictions"
                :locked="gameweek?.is_locked"
                @update-prediction="(data) => handlePredictionUpdate({ ...data, userId })"
                @predictions-submitted="submitPredictions(userId)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsService } from '../api/predictionsService';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';
import { groupsStore } from '../store/groupsStore';
import DateUtils from '../utils/dateUtils';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const route = useRoute();

const loading = ref(true);
const matches = ref([]);
const gameweekId = ref();
const gameweek = ref([]);
const predictions = ref([]);
const predictionsChanged = ref(false);
const showAllUsers = ref(false);
const currentUserId = ref();

// Group predictions by user
const groupedPredictions = ref();

watch(showAllUsers, (state) => {
    mapPredictions(false);
})

onMounted(async () => {
    await fetchGameweek();
});

async function fetchGameweek() {
    loading.value = true;

    gameweekId.value = route.params.gameweek_id || route.query.gameweek_id;
    currentUserId.value = route.params.user_id || route.query.user_id;

    const { data, error } = await gameweeksService.getGameweekById(gameweekId.value);
    if (error) return console.error(error);
    gameweek.value = data;

    mapPredictions();
}

async function mapPredictions(skipLoad = true) {

    if (!skipLoad) {
        loading.value = true;
    }

    const groupId = gameweek.value.group_id;

    // Fetch matches, fake users, and all predictions
    const [{ data: matchData }, { data: fakeUsers }, { data: predictionsData }] = await Promise.all([
        gameweeksService.getMatches(gameweekId.value),
        groupsStore.fetchGroupMembers(groupId, true), // Get only fake users
        predictionsService.getGameweekPredictions(gameweekId.value, true) // Get all predictions
    ]);

    if (!matchData || !fakeUsers) {
        console.error("Failed to fetch matches or fake users.");
        loading.value = false;
        return;
    }
    
    let usersPredictionsData = [];
    let fakeUsersData = [];
    if (showAllUsers.value) {
        usersPredictionsData = predictionsData;
        fakeUsersData = fakeUsers;
    } else {
        usersPredictionsData = predictionsData.filter(x => x.user_id === currentUserId.value);
        fakeUsersData = fakeUsers.filter(x => x.id === currentUserId.value);
    }

    matches.value = matchData;

    // Organize predictions by userId and matchId
    const userPredictionsMap = usersPredictionsData.reduce((acc, prediction) => {
        const userId = prediction.users?.id;
        const matchId = prediction.match_id;

        if (!userId || !matchId) return acc;

        if (!acc[userId]) acc[userId] = {};

        acc[userId][matchId] = {
            predicted_home_score: prediction.predicted_home_score ?? '',
            predicted_away_score: prediction.predicted_away_score ?? '',
            prediction_id: prediction.id || null
        };

        return acc;
    }, {});

    // Initialize `groupedPredictions` so that each user has predictions mapped to matches
    groupedPredictions.value = fakeUsersData.reduce((acc, user) => {
        acc[user.id] = {
            username: user.username,
            predictions: matches.value.reduce((matchAcc, match) => {
                matchAcc[match.id] = userPredictionsMap[user.id]?.[match.id] || {
                    predicted_home_score: '',
                    predicted_away_score: '',
                    prediction_id: null
                };
                return matchAcc;
            }, {})
        };
        return acc;
    }, {});

    loading.value = false;
}

const handlePredictionUpdate = ({ userId, matchId, field, value }) => {
    if (!groupedPredictions.value[userId]) return;
    
    // Ensure deep reactivity
    groupedPredictions.value[userId] = {
        ...groupedPredictions.value[userId],
        predictions: {
            ...groupedPredictions.value[userId].predictions,
            [matchId]: {
                ...groupedPredictions.value[userId].predictions[matchId],
                [field]: value
            }
        }
    };
};

async function submitPredictions(userId) {
    const userPredictions = groupedPredictions.value[userId]?.predictions;

    if (!userPredictions) {
        console.error(`No predictions found for user ${userId}`);
        return;
    }

    loading.value = true;

    for (const [matchId, prediction] of Object.entries(userPredictions)) {
        await predictionsService.savePrediction(
            userId,
            matchId,
            prediction.predicted_home_score,
            prediction.predicted_away_score,
            true
        );
    }

    loading.value = false;

    toast(`Predictions for ${groupedPredictions.value[userId].username} have been saved!`, {
        "type": "success",
        "position": "top-center"
    });
}

</script>
