<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        <!-- Not in group message -->
        <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
            <p>You are not a member of this group.</p>
            <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
                Go to Group
            </button>
        </div>

        <template v-else>
            <div class="mb-1 ms-1">
                <router-link :to="`/group/${groupId}`" class="text-blue-600 hover:underline font-medium">
                    ← Back to group
                </router-link>
            </div>
        </template>

        <!-- All time leaderboard -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">All Time</h3>
            </div>
            
            <div v-if="leaderboard.length">
                <LeaderboardCard 
                    :leaderboard="leaderboard"
                />
            </div>
            <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
        </div>

        <!-- Current gameweek leaderboard -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">                    
                    <router-link 
                        :to="`/gameweek/${currentGameweek.id}`" 
                        class="text-blue-600 hover:underline"
                    >
                        Current Gameweek
                    </router-link>
                </h3>
            </div>
            
            <div v-if="scores.length">
                <LeaderboardCard 
                    :leaderboard="scores"
                />
            </div>
            <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import DateUtils from '../utils/dateUtils';
import LoadingScreen from "../components/LoadingScreen.vue";
import { leaderboardStore } from '../store/leaderboardStore';
import LeaderboardCard from '../components/LeaderboardCard.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const notInGroup = ref(false);
const groupId = ref(null);
const members = ref([]);
const isAdmin = ref(false)
const leaderboard = ref([]);
const currentGameweek = ref({});
const scores = ref([]);

onMounted(async () => {
    fetchAllData();
});

async function fetchAllData() {
    loading.value = true;
    groupId.value = route.params.id || route.query.id;

    const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(groupId.value);
    if (membersError) throw new Error('Failed to load group members');
    members.value = membersData || [];

    // Check if user is in the group
    const isMember = userInGroup(members.value);
    if (!isMember) {
        loading.value = false;
        notInGroup.value = true;
        return;
    }

    isAdmin.value = userIsAdmin(members.value);

    // Fetch all-time leaderboard
    const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(groupId.value);
    if (leaderboardError) throw new Error('Failed to load leaderboard');
    leaderboard.value = leaderboardData || [];

    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    
    if (gameweeksData.length > 0) {
        const activeGameweek = gameweeksData.filter(x => x.is_active);
        currentGameweek.value = activeGameweek.length > 0 ? activeGameweek[0] : {};
    }

    // Fetch gameweek leaderboard
    const { data: scoresData, error: scoresError } = await leaderboardStore.fetchGameweekScores(currentGameweek.value.group_id, currentGameweek.value.id);
    if (scoresError) throw new Error('Failed to load gameweek leaderboard');
    scores.value = scoresData || [];

    loading.value = false;

    // Fetch current gameweek leaderboard
    // const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGameweekScores(gameweek.value.group_id, gameweek.value.id);
    // if (leaderboardError) throw new Error('Failed to load leaderboard');
    // leaderboard.value = leaderboardData || [];
}

</script>