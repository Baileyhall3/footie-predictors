<template>
    <div class="container mx-auto px-6 py-8">
        <div class="mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold">Your Rankings</h2>
                <div class="relative w-full md:w-64">
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search for group..."
                        @keydown.enter="handleSearchQuery"
                        class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
                        stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                </div>
            </div>
            <LoadingScreen v-if="isLoading" />
            <template v-else>
                <template v-if="userGroups.length > 0">
                    <div v-for="group in userGroups" :key="group.id">
                        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <div class="flex items-center">
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
                                <!-- <router-link 
                                    :to="`/group/${group.id}/leaderboards`" 
                                    class="text-sm text-blue-600 hover:underline"
                                >
                                    View Full Leaderboard →
                                </router-link> -->
                            </div>

                            <div v-if="group.leaderboard && group.leaderboard.length">
                                <LeaderboardCard 
                                    :leaderboard="group.leaderboard"
                                    previewOnly
                                />
                            </div>
                            <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
                            <!-- <div class="p-4">
                                <router-link to="/leaderboards" class="text-green-600 font-medium hover:text-green-700 text-sm">
                                View all leaderboards →
                                </router-link>
                            </div> -->
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
import { leaderboardStore } from "../store/leaderboardStore";
import { userStore } from "../store/userStore";
import LeaderboardCard from "../components/LeaderboardCard.vue";
import LoadingScreen from "../components/LoadingScreen.vue";
import { Group } from "../types";

// State
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const userGroups = ref<Array<Group>>([]);
const searchQuery = ref<string>('');
const allUserGroups = ref<Array<Group>>([]);

onMounted(async () => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        isLoading.value = true;
        error.value = null;
        
        if (userStore.isAuthenticated) {
            // Fetch user's groups
            let loadedGroups = []
            if (groupsStore.groups.length === 0) {
                const { data: groups, error: groupsError } = await groupsStore.fetchUserGroups();
                if (groupsError) throw new Error('Failed to load your groups');
                loadedGroups = groups;
            } else {
                console.log('Using stored groups')
                loadedGroups = groupsStore.groups;
            }
            
            // Attach leaderboards to groups and filter out empty ones
            const groupsWithLeaderboards = await Promise.all(loadedGroups.map(async (group) => {
                const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(group.id, null, true);
                
                if (leaderboardError) {
                    console.error(`Failed to load leaderboard for group ${group.id}`);
                    return null; // Ignore this group in case of an error
                }

                return leaderboardData && leaderboardData.length > 0 ? { ...group, leaderboard: leaderboardData } : null;
            }));

            // Filter out null values (groups without a leaderboard)
            userGroups.value = groupsWithLeaderboards.filter(group => group !== null);
            allUserGroups.value = groupsWithLeaderboards.filter(group => group !== null);
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        error.value = err.message || 'An error occurred while loading your data';
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

</script>