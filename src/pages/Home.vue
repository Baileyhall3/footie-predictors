<template>
  <div class="container mx-auto px-6 py-8">
    
    <!-- Groups Section -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Your Groups</h2>
        <router-link to="/create-group">
          <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            + Create Group
          </button>
        </router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GroupCard v-for="group in userGroups" :key="group.id" :group="group" />
      </div>
    </div>

    <!-- Predictions Section -->
    <div class="mb-6">
        <h2 class="text-2xl font-bold mb-4">Your Predictions</h2>

        <div v-if="userPredictions.length">
            <PredictionCard 
                v-for="gameweek in userPredictions"
                :key="gameweek.gameweek.id"
                :gameweek="gameweek.gameweek"
                :predictions="gameweek.predictions"
            />
        </div>
        <p v-else class="text-gray-500">No predictions made yet.</p>
    </div>

    <!-- Leaderboard Section -->
    <div>
      <LeaderboardCard :leaderboard="leaderboard" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import GroupCard from "../components/GroupCard.vue";
import PredictionCard from "../components/PredictionCard.vue";
import LeaderboardCard from "../components/LeaderboardCard.vue";
import Groups from "./Groups.vue";
import Predictions from "./Predictions.vue";

import { getUserGroups } from "../api/groups";
import { getUserPredictions } from "../api/predictions";
import { getLeaderboardPosition } from "../api/leaderboard";
import { getGameweeks } from '../api/gameweeks';

const userGroups = ref([]);
const userPredictions = ref([]);
const leaderboard = ref({});

onMounted(() => {
  userGroups.value = getUserGroups();
  userPredictions.value = getUserPredictions();
  leaderboard.value = getLeaderboardPosition();
});
</script>

