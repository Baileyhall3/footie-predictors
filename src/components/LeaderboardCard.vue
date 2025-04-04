<template>
  <div v-for="player in leaderboard" :key="player.id" class="flex justify-between items-center border-b py-3">
    <div class="flex items-center gap-2">
      <span class="font-medium w-6 text-center">{{ player.position }}.</span>
      <span>{{ player.username }}</span>
      <ArrowUpIcon class="size-3 text-green-600" v-if="player.movement == 'up'" />
      <ArrowDownIcon class="size-3 text-red-600" v-if="player.movement == 'down'" />
      <span v-if="player.user_id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
    </div>
    
    <div class="text-right">
      <span v-if="!props.editable" class="font-semibold text-green-600">{{ player.total_points }} pts</span>
      <template v-if="props.editable">
        <input type="number" 
            v-model="player.total_points"
            @input="updateScore(player.id, player.user_id, $event.target.value)"
            class="w-12 border rounded-md p-1 text-center" 
            min="0" 
        />
        <span class="text-green-600 font-semibold"> pts</span>
      </template>
      <div class="text-xs text-gray-500">
        {{ player.total_correct_scores ?? 0 }} exact scores
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { userStore } from "../store/userStore";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/vue/24/solid";
  
interface LeaderboardEntry {
  id: string;
  position: number;
  total_correct_results: number;
  total_correct_scores: number;
  total_points: number;
  user_id: string;
  username: string;
  movement: string;
}
  
export interface IProps {
  leaderboard: LeaderboardEntry[];
  editable?: boolean;
}
  
const props = defineProps<IProps>();
const emit = defineEmits(["update-leaderboard-entry"]);

const updateScore = (leaderboardId: string, userId: string, value: string) => {
    emit("update-leaderboard-entry", { leaderboardId, userId, value: parseInt(value) || 0 });
};

</script>  