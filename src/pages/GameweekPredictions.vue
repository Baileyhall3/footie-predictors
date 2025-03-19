<template>
    <div class="container mx-auto py-8">
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
        <!-- <div class="mb-8 justify-start flex">
            <SearchBar @search-entered="handleSearchQuery" />
        </div>
        <p class="ms-3 mb-3" style="align-self: end;" v-if="searchString">Showing predictions for "{{ searchString }}"</p> -->
        <div v-for="username in displayedUsers" :key="username" class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <h3 class="text-xl font-semibold">{{ username }}'s Predictions</h3>
            <ScoreCard 
                :matches="matches"
                :predictions="groupedPredictions[username] || {}"
                :locked="true"
                :totalPoints="getTotalPoints(groupedPredictions[username] || {})"
            />
            <!-- <div class="p-4 bg-gray-50 border-t border-gray-200">
                Total Points: 
            </div> -->
        </div>

        <!-- Observer div to trigger lazy loading -->
        <div ref="loadMoreTrigger" class="h-10"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsService } from '../api/predictionsService';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';
import SearchBar from '../components/UI/SearchBar.vue';

const route = useRoute();

const loading = ref(true);
const matches = ref([]);
const gameweekId = ref();
const gameweek = ref([]);
const predictions = ref([]);
const totalPoints = ref();
const searchString = ref('');
const usersList = ref([]); 
const displayedUsersCount = ref(5); // Initial users to display
const loadMoreTrigger = ref(null); // Observer target
const groupedPredictions = ref({});

const displayedUsers = computed(() => usersList.value.slice(0, displayedUsersCount.value));

function getTotalPoints(userPredictions) {
    if (!userPredictions) return 0;
    return Object.values(userPredictions).reduce((total, pred) => total + (pred.points || 0), 0);
}

onMounted(async () => {
    await fetchGameweek();
    nextTick(setupLazyLoading);
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

    await fetchPredictions();
}

async function fetchPredictions() {
    const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
        gameweeksService.getMatches(gameweekId.value),
        predictionsService.getGameweekPredictions(gameweekId.value)
    ]);

    matches.value = matchData;
    predictions.value = predictionsData || [];

    mapPredictions();
    
    loading.value = false;
}

function mapPredictions(searchQuery: string = null) {

    // if (searchQuery && searchQuery != "" && predictions.value.length > 0) {
    //     loading.value = true;
    //     predictions.value = predictionsData.filter(x => x.users.username.toLowerCase().includes(searchQuery));
    // }

    const grouped = {};

    predictions.value.forEach(prediction => {
        const username = prediction.users?.username ?? "Unknown User";

        if (!prediction.matches || !prediction.matches.id) {
            debugger
            console.warn("Skipping invalid prediction:", prediction);
            return;
        }

        if (!grouped[username]) {
            grouped[username] = {};
        }

        grouped[username][prediction.matches.id] = prediction;
    });

    groupedPredictions.value = grouped; 
    usersList.value = Object.keys(grouped); 

}

async function handleSearchQuery(searchQuery: string) {
    searchString.value = searchQuery;
    mapPredictions(searchQuery.toLowerCase())
}

function setupLazyLoading() {
    if (!loadMoreTrigger.value) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                loadMoreUsers();
            }
        },
        { rootMargin: '100px' }
    );

    observer.observe(loadMoreTrigger.value);
}

function loadMoreUsers() {
    if (displayedUsersCount.value < usersList.value.length) {
        displayedUsersCount.value += 5;
    }
}
</script>
