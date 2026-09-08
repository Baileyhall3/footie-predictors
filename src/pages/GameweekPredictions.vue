<template>
    <LoadingScreen v-if="isLoading" />
    <NoAccess v-else-if="!gameweekIsLocked" message="Gameweek is not locked yet." /> <!-- Add check to see if user is admin too? -->
    <MainContent v-else>
        <div class="mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold">Gameweek {{ gameweek?.week_number }} Predictions</h2>
                <SearchBar2 v-model="searchQuery" @update:model-value="handleSearchQuery" placeholder="Search for user..." />
            </div>
        </div>
        <!-- Matches List -->
        <RoundedContainer>
            <ScoreCard 
                :matches="matches"
                allowCollapse
                header="Match Results"
                matchesClickable
            />
        </RoundedContainer>

        <!-- Predictions Section -->
        <RoundedContainer v-for="user in displayedUsers" :key="user">
            <ScoreCard 
                :matches="matches"
                :predictions="groupedPredictions[user.username] || {}"
                :locked="true"
                :totalPoints="user.total_points"
                :header="`${user.username}'s Predictions`"
                allowCollapse
                matchesClickable
                :group-scoring="groupScoring"
            />
        </RoundedContainer>

        <!-- Observer div to trigger lazy loading -->
        <div ref="loadMoreTrigger" class="h-10"></div>
    </MainContent>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsService } from '../api/predictionsService';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';
import { leaderboardService } from '../api/leaderboardService';
import NoAccess from '../components/NoAccess.vue';
import type { GroupScoring } from '../types';
import { groupsStore } from '../store/groupsStore';
import MainContent from "../components/layout/MainContent.vue";
import { SearchBar2 } from '../components/UI/input';
import { RoundedContainer } from "../components/UI";

const route = useRoute();

const loading = ref(true);
const matches = ref([]);
const gameweekId = ref();
const gameweek = ref([]);
const predictions = ref([]);
const usersList = ref([]); 
const allUsers = ref([]);
const displayedUsersCount = ref(25); // Initial users to display
const loadMoreTrigger = ref(null); // Observer target
const groupedPredictions = ref({});
const matchesCollapsed = ref(false);
const scores = ref([]);
const gameweekIsLocked = ref(false);
const groupScoring = ref<GroupScoring>();
const searchQuery = ref<string>('');

const displayedUsers = computed(() => usersList.value.slice(0, displayedUsersCount.value));

onMounted(async () => {
    await fetchGameweek();
    nextTick(setupLazyLoading);
});

async function fetchGameweek() {
    try {
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
        await mapPredictions();

        const { data: groupData, error: groupError } = await groupsStore.fetchGroupById(gameweek.value.group_id);
        if (groupError) throw new Error('Failed to load group');

        groupScoring.value = { 
            exact_score_points: groupData.exact_score_points,
            correct_result_points: groupData.correct_result_points,
            incorrect_points: groupData.incorrect_points
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function fetchPredictions(searchQuery: string | null = null) {
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
    const baseUsers = Object.keys(grouped).map(username => {
        // Find matching score entry
        const userScore = scores.value.find(score => score.username === username) || {};

        return {
            username,
            total_points: userScore.total_points ?? 0, // Default to 0 if not found
            total_correct_scores: userScore.total_correct_scores ?? 0,
        };
    });

    allUsers.value = baseUsers.sort((a, b) => b.total_points - a.total_points); // Sort by total points descending
    usersList.value = allUsers.value.slice(0, displayedUsersCount.value); // Initialize displayed users
}

function handleSearchQuery() {
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        usersList.value = allUsers.value.filter(user => user.username.toLowerCase().includes(query));
    } else {
        usersList.value = allUsers.value.slice(0, displayedUsersCount.value); // Reset to initial displayed users
    }
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