<template>
  <div class="container mx-auto px-6 py-8">
    <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-8"> -->
    <div>
      <!-- Welcome Message -->
      <RoundedContainer>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome{{ userStore.userProfile ? ', ' + userStore.userProfile.username : '' }}!</h1>
        <p class="text-gray-600">Track your football predictions and compete with friends.</p>
        <p class="text-gray-600">Need help getting set up? Read all about the app <router-link to="/app-info" class="text-blue-600 hover:underline">here</router-link>.</p>
      </RoundedContainer>
      <!-- <RoundedContainer>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">What's New?</h1>
        <p class="text-gray-600">Track your football predictions and compete with friends.</p>
      </RoundedContainer> -->
    </div>
    
    <!-- Loading State -->
    <LoadingScreen v-if="isLoading" />
    
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
            <button class="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition">
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
            topMargin="0"
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
import { predictionsStore } from "../store/predictionsStore";
import { leaderboardStore } from "../store/leaderboardStore";
import ScoreCard from "../components/ScoreCard.vue";
import { groupsService } from "../api/groupsService";
import LoadingScreen from "../components/LoadingScreen.vue";
import { RoundedContainer } from "../components/UI";

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
      const { data: groups, error: groupsError } = await groupsService.getUserGroupsUsingView();
      if (groupsError) throw new Error('Failed to load your groups');
      userGroups.value = groups || [];
      
      // Fetch upcoming matches for predictions
      upcomingMatches.value = [];
      const matchesMap = new Map();  // Use a Map to track unique matches by api_match_id

      for (const group of userGroups.value) {
        const { data: matches, error: matchesError } = await predictionsStore.fetchUpcomingMatches(group.id);
        if (!matchesError && matches) {
          // Add matches to the map, ensuring uniqueness based on api_match_id
          for (const match of matches) {
            matchesMap.set(match.api_match_id, match);
          }
        }
      }

      // Convert the unique matches back to an array
      upcomingMatches.value = Array.from(matchesMap.values());
      
      // Sort upcoming matches by date
      upcomingMatches.value.sort((a, b) => new Date(a.match_time) - new Date(b.match_time));
      
      // Fetch user's position in each group's leaderboard
      userPositions.value = [];
      for (const group of userGroups.value.slice(0, 5)) {
        const { data: leaderboard, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(group.id, null, true);
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
