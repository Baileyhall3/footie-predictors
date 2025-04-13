<template>
    <NoAccess v-if="!gameweekIsLocked && !loading" message="Gameweek is not locked yet." /> <!-- Add check to see if user is admin too? -->
    <div v-else class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />

        <div class="mb-1 ms-1">
            <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 hover:underline font-medium">
                ← Back to group
            </router-link>
        </div>

        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex items-center gap-2 mb-4">
                <h2 class="text-2xl font-semibold">Gameweek {{ gameweek?.week_number }}</h2>
                <div v-if="gameweek?.is_active" class="text-sm bg-blue-100 text-purple-800 px-3 py-1 rounded-full transition ms-2">
                    Active
                </div>
            </div>     
            <div class="justify-start flex">
                <SearchBar searchBasis="user predictions" @search-entered="handleSearchQuery" />
            </div>
            <p class="mt-2" style="align-self: end;" v-if="searchString">Showing predictions for "{{ searchString }}"</p>
        </div>

        <!-- Matches List -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <ScoreCard 
                :matches="matches"
                allowCollapse
                header="Match Results"
            />
        </div>

        <!-- Predictions Section -->
        <div v-for="user in displayedUsers" :key="user" class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <ScoreCard 
                :matches="matches"
                :predictions="groupedPredictions[user.username] || {}"
                :locked="true"
                :totalPoints="user.total_points"
                :header="`${user.username}'s Predictions`"
                allowCollapse
            />
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
import { leaderboardService } from '../api/leaderboardService';
import NoAccess from '../components/NoAccess.vue';

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
const matchesCollapsed = ref(false);
const scores = ref([]);
const gameweekIsLocked = ref(false);

const displayedUsers = computed(() => usersList.value.slice(0, displayedUsersCount.value));

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

    gameweekIsLocked.value = gameweek.value.is_locked;
    if (!gameweekIsLocked.value) {
        loading.value = false;
        return;
    }

    await fetchPredictions();
}

async function fetchPredictions(searchQuery: string = null) {
    const [{ data: matchData }, { data: predictionsData }, { data: scoresData }] = await Promise.all([
        gameweeksService.getMatches(gameweekId.value),
        predictionsService.getGameweekPredictions(gameweekId.value),
        leaderboardService.getGameweekScores(gameweek.value.group_id, gameweekId.value)
    ]);

    matches.value = matchData;
    if (searchQuery && searchQuery != "" && predictions.value.length > 0) {
        loading.value = true;
        predictions.value = predictionsData.filter(x => x.users.username.toLowerCase().includes(searchQuery));
    } else {
        matchesCollapsed.value = false;
        predictions.value = predictionsData || [];
    }

    scores.value = scoresData || [];

    await mapPredictions();
    
    loading.value = false;
}

async function mapPredictions() {
    const grouped = {};

    predictions.value.forEach(prediction => {
        const username = prediction.users?.username ?? "Unknown User";

        if (!prediction.matches || !prediction.matches.id) {
            console.warn("Skipping invalid prediction:", prediction);
            return;
        }

        if (!grouped[username]) {
            grouped[username] = {};
        }

        grouped[username][prediction.matches.id] = prediction;
    });

    groupedPredictions.value = grouped; 

    // Convert usernames to user objects & attach scores
    usersList.value = Object.keys(grouped).map(username => {
        // Find matching score entry
        const userScore = scores.value.find(score => score.username === username) || {};

        return {
            username,
            total_points: userScore.total_points ?? 0, // Default to 0 if not found
            total_correct_scores: userScore.total_correct_scores ?? 0,
        };
    });
}


async function handleSearchQuery(searchQuery: string) {
    searchString.value = searchQuery;
    matchesCollapsed.value = true;
    fetchPredictions(searchQuery.toLowerCase())
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

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-slide-enter-to, .fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>