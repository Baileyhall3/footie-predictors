<template>
    <div class="container mx-auto px-6 py-8">
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
        </div>

        <!-- Matches List -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h3 class="text-xl font-semibold">Matches</h3>
            <div v-for="(matchGroup, day) in groupedMatches" :key="day" class="mt-6">
                <h3 class="text-lg mb-2">{{ day }}</h3>
                <ul>
                    <li v-for="match in matchGroup" :key="match.id" class="flex justify-between bg-gray-100 p-2 rounded-md my-2">
                        <span>
                            <span class="font-semibold">{{ match.home_team }}</span> vs <span class="font-semibold">{{ match.away_team }}</span> - {{ DateUtils.toTime(match.match_time) }}
                            <span v-if="match.final_home_score !== null">({{ match.final_home_score }} - {{ match.final_away_score }})</span>
                        </span>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Predictions Section -->
        <div v-for="(userPredictions, username) in groupedPredictions" :key="username" class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h3 class="text-xl font-semibold">{{ username }}'s Predictions</h3>

            <div v-for="(matchGroup, day) in groupedMatches" :key="day" class="mt-6">
                <h3 class="text-lg mb-2">{{ day }}</h3>

                <div v-for="match in matchGroup" :key="match.id" class="flex flex-col items-center justify-center py-2 bg-gray-100 mt-2 rounded-md">
                    <!-- Match Info (Score Row) -->
                    <div class="flex items-center justify-center w-full max-w-lg">
                        <!-- Home Team and Score -->
                        <div class="flex items-center space-x-2 w-1/3 justify-end">
                            <span class="font-medium">{{ match.home_team }}</span>
                            <span class="text-lg font-bold">
                                {{ userPredictions[match.id]?.predicted_home_score ?? '-' }}
                            </span>
                        </div>

                        <!-- Vertical Line (centered) -->
                        <div class="border-l border-gray-300 h-8 mx-4"></div>

                        <!-- Away Team and Score -->
                        <div class="flex items-center space-x-2 w-1/3 justify-start">
                            <span class="text-lg font-bold">
                                {{ userPredictions[match.id]?.predicted_away_score ?? '-' }}
                            </span>
                            <span class="font-medium">{{ match.away_team }}</span>
                        </div>
                    </div>

                    <div class="text-gray-500 text-sm mt-1">
                        {{ DateUtils.toTime(match.match_time) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DateUtils from '../utils/dateUtils';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsService } from '../api/predictionsService';
import LoadingScreen from "../components/LoadingScreen.vue";

const route = useRoute();

const loading = ref(true);
const matches = ref([]);
const gameweekId = ref();
const gameweek = ref([]);
const predictions = ref([]);

// Group matches by match day
const groupedMatches = computed(() => {
    return matches.value.reduce((acc, match) => {
        const matchDay = DateUtils.toShortDayMonth(match.match_time);

        if (!acc[matchDay]) {
            acc[matchDay] = [];
        }
        acc[matchDay].push(match);

        return acc;
    }, {});
});

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


onMounted(async () => {
    await fetchGameweek();
});

async function fetchGameweek() {
    loading.value = true;

    gameweekId.value = route.params.id || route.query.id;

    const { data, error } = await gameweeksService.getGameweekById(gameweekId.value);
    if (error) return console.error(error);
    gameweek.value = data;

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
