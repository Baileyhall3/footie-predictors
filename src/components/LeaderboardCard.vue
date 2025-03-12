<template>
  <div v-for="player in leaderboard" :key="player.id" class="flex justify-between items-center border-b py-3">
    <div class="flex items-center gap-2">
      <span class="font-medium w-6 text-center">{{ player.position }}.</span>
      <span>{{ player.username }}</span>
      <span v-if="player.user_id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
    </div>
    
    <div class="text-right">
      <span class="font-semibold text-green-600">{{ player.total_points }} pts</span>
      <div class="text-xs text-gray-500">
        {{ player.total_correct_scores }} exact scores
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { userStore } from "../store/userStore";
  
interface LeaderboardEntry {
  id: string;
  position: number;
  total_correct_results: number;
  total_correct_scores: number;
  total_points: number;
  user_id: string;
  username: string;
}
  
export interface IProps {
  leaderboard: LeaderboardEntry[];
}
  
const props = defineProps<IProps>();

</script>  