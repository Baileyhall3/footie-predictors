<template>
    <div class="container mx-auto px-6 py-8">
        <div class="mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold">Your Rankings</h2>
                <SearchBar2 v-if="userGroups.length > 0" v-model="searchQuery" @update:model-value="handleSearchQuery" placeholder="Search for group..." />
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
                <NoGroupsJoined v-else />
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
import { SearchBar2 } from '../components/UI/input';
import NoGroupsJoined from '../components/UI/NoGroupsJoined.vue';

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