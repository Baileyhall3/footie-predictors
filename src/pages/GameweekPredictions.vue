<template>
    <div class="container mx-auto px-6 py-8">
        <LoadingScreen v-if="loading" />

        <div class="mb-1 ms-1">
            <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 hover:underline font-medium">
                ← Back to group
            </router-link>
        </div>

        <!-- Matches List -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex items-center gap-2 mb-4">
                <h2 class="text-2xl font-semibold">Gameweek {{ gameweek?.week_number }}</h2>
            </div>
            <ScoreCard 
                :matches="matches"
            />
        </div>

        <!-- Predictions Section -->
        <div v-for="(userPredictions, username) in groupedPredictions" :key="username" class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h3 class="text-xl font-semibold">{{ username }}'s Predictions</h3>
            <ScoreCard 
                :matches="matches"
                :predictions="userPredictions"
                :locked="true"
                :totalPoints="getTotalPoints(userPredictions)"
            />
            <!-- <div class="p-4 bg-gray-50 border-t border-gray-200">
                Total Points: 
            </div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsService } from '../api/predictionsService';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';

const route = useRoute();

const loading = ref(true);
const matches = ref([]);
const gameweekId = ref();
const gameweek = ref([]);
const predictions = ref([]);
const totalPoints = ref();

// Group predictions by user
const groupedPredictions = computed(() => {
    return predictions.value.reduce((acc, prediction) => {
        const username = prediction.users?.username ?? "Unknown User";
        
        // Ensure matches exist before accessing id
        if (!prediction.matches || !prediction.matches.id) {
            console.warn("Skipping invalid prediction:", prediction);
            return acc; // Skip this prediction if matches is missing
        }

        if (!acc[username]) {
            acc[username] = {};
        }

        acc[username][prediction.matches.id] = prediction;
        return acc;
    }, {});
});

function getTotalPoints(userPredictionsss) {
    debugger
}

onMounted(async () => {
    await fetchGameweek();
});

async function fetchGameweek() {
    loading.value = true;

    gameweekId.value = route.params.id || route.query.id;

    const { data, error } = await gameweeksService.getGameweekById(gameweekId.value);
    if (error) return console.error(error);
    gameweek.value = data;

    // const { data, error } = await gameweeksService.getUserGameweekScores(gameweekId.value), ;
    // if (error) return console.error(error);
    // gameweek.value = data;

    mapPredictions();
}

async function mapPredictions() {
    // Fetch matches and predictions
    const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
        gameweeksService.getMatches(gameweekId.value),
        predictionsService.getGameweekPredictions(gameweekId.value)
    ]);

    matches.value = matchData;
    predictions.value = predictionsData || [];
    
    loading.value = false;

}

</script>
