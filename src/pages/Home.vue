<template>
  <div class="container mx-auto px-6 py-8">
    <!-- Welcome Message -->
    <div class="mb-8 bg-white rounded-lg shadow-md p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome{{ userStore.userProfile ? ', ' + userStore.userProfile.username : '' }}!</h1>
      <p class="text-gray-600">Track your football predictions and compete with friends.</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
      <p class="font-medium">Error loading your data</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="fetchUserData" class="mt-2 text-sm text-red-700 underline">Try again</button>
    </div>
    
    <!-- Content (only shown when not loading and no error) -->
    <div v-else>
      <!-- Groups Section -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Your Groups</h2>
          <router-link to="/create-group">
            <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              + Create Group
            </button>
          </router-link>
        </div>
        
        <div v-if="userGroups.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GroupCard v-for="group in userGroups" :key="group.id" :group="group" />
        </div>
        <div v-else class="bg-white rounded-lg shadow p-6 text-center">
          <p class="text-gray-500 mb-4">You haven't joined any groups yet.</p>
          <router-link to="/groups" class="text-green-600 font-medium hover:text-green-700">
            Browse Groups
          </router-link>
        </div>
      </div>

      <!-- Upcoming Predictions Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Upcoming Matches</h2>

        <div v-if="upcomingMatches.length" class="bg-white rounded-lg shadow overflow-hidden p-6">
          <!-- <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-700">Make your predictions</h3>
          </div> -->

          <ScoreCard
            :matches="upcomingMatches.slice(0, 3)"
          />
        </div>
        <div v-else class="bg-white rounded-lg shadow p-6 text-center">
          <p class="text-gray-500">No upcoming matches to predict.</p>
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Your Rankings</h2>
        
        <div v-if="userPositions.length" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-700">Your position in groups</h3>
          </div>
          
          <div class="divide-y divide-gray-200">
            <div v-for="position in userPositions" :key="position.groupId" class="p-4 flex justify-between items-center">
              <div>
                <div class="font-medium">
                  <router-link 
                      :to="`/group/${position.groupId}`" 
                      class="text-blue-600 hover:underline"
                  >
                    {{ position.groupName }}
                  </router-link>
                </div>
                <div class="text-sm text-gray-500">Position: {{ position.position }} of {{ position.totalMembers }}</div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-green-600">{{ position.points }} pts</div>
                <div class="text-xs text-gray-500">
                  {{ position.correctScores }} exact scores
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-gray-50 border-t border-gray-200">
            <router-link to="/leaderboards" class="text-green-600 font-medium hover:text-green-700 text-sm">
              View all leaderboards →
            </router-link>
          </div>
        </div>
        <div v-else class="bg-white rounded-lg shadow p-6 text-center">
          <p class="text-gray-500">Join a group to see your rankings.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import GroupCard from "../components/GroupCard.vue";
import { userStore } from "../store/userStore";
import { groupsStore } from "../store/groupsStore";
import { predictionsStore } from "../store/predictionsStore";
import { leaderboardStore } from "../store/leaderboardStore";
import ScoreCard from "../components/ScoreCard.vue";

// State
const isLoading = ref(true);
const error = ref(null);
const userGroups = ref([]);
const upcomingMatches = ref([]);
const userPositions = ref([]);

// Fetch all user data
const fetchUserData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Only fetch data if user is authenticated
    if (userStore.isAuthenticated) {
      // Fetch user's groups
      const { data: groups, error: groupsError } = await groupsStore.fetchUserGroups();
      if (groupsError) throw new Error('Failed to load your groups');
      userGroups.value = groups || [];
      
      // Fetch upcoming matches for predictions
      // We'll get matches from all groups the user is in
      upcomingMatches.value = [];
      for (const group of userGroups.value) {
        const { data: matches, error: matchesError } = await predictionsStore.fetchUpcomingMatches(group.id);
        if (!matchesError && matches) {
          upcomingMatches.value = [...upcomingMatches.value, ...matches];
        }
      }
      
      // Sort upcoming matches by date
      upcomingMatches.value.sort((a, b) => new Date(a.match_time) - new Date(b.match_time));
      
      // Fetch user's position in each group's leaderboard
      userPositions.value = [];
      for (const group of userGroups.value) {
        const { data: leaderboard, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(group.id);
        if (!leaderboardError && leaderboard) {
          const userPosition = leaderboard.find(entry => entry.user_id === userStore.user.id);
          if (userPosition) {
            userPositions.value.push({
              groupId: group.id,
              groupName: group.name,
              position: userPosition.position,
              totalMembers: leaderboard.length,
              points: userPosition.total_points,
              correctScores: userPosition.total_correct_scores
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = err.message || 'An error occurred while loading your data';
  } finally {
    isLoading.value = false;
  }
};

// Fetch data when component is mounted
onMounted(async () => {
  if (userStore.isAuthenticated) {
    await fetchUserData();
  } else {
    isLoading.value = false;
  }
});
</script>
