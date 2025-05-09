<template>
  <div class="flex justify-between items-center mb-4" v-if="props.includeHeader">
      <div class="items-center flex">
        <slot name="filter"></slot>
        <slot name="header"></slot>
        <template v-if="!slots.header">
          <h3 v-if="props.headerText" class="text-xl font-semibold">{{ props.headerText }}</h3>
          <h3 class="text-xl font-semibold" v-else-if="props.gameweekId">                    
            <router-link 
                :to="`/gameweek/${props.gameweekId}`" 
                class="text-blue-600 hover:underline"
            >
                Current Gameweek
            </router-link>
          </h3>
        </template>
        <button type="button" @click="toggleLeaderboardCollapse" v-if="props.allowCollapse">
            <ChevronDownIcon v-if="!leaderboardCollapsed" class="size-5 ms-2 transition-transform duration-300"  />
            <ChevronUpIcon v-else class="size-5 ms-2 transition-transform duration-300" />
        </button>
      </div>
  </div>

  <p v-if="props.lastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(props.lastUpdated) }}</p>

  <TransitionGroup name="leaderboard" tag="div">
    <template v-if="(!leaderboardCollapsed && props.allowCollapse) || !props.allowCollapse">
      <template v-if="props.includeSearchBar">
        <div class="justify-start flex">
            <SearchBar class="mt-2 mb-2" searchBasis="players" @search-entered="handleSearchQuery" />
        </div>
        <p class="mt-2" style="align-self: end;" v-if="searchString">Showing results for "{{ searchString }}"</p>
      </template>
      
      <div v-for="player in visibleLeaderboard" :key="player.id" class="flex justify-between items-center border-b py-3">
        <div class="flex items-center gap-2">
          <span class="font-medium w-6 text-center">{{ player.position }}.</span>
          <ArrowUpIcon class="size-3 text-green-600" v-if="player.movement == 'up'" />
          <ArrowDownIcon class="size-3 text-red-600" v-else-if="player.movement == 'down'" />
          <EqualsIcon class="size-3 text-gray-600" v-else-if="player.movement == 'same'" />
          <component
            :is="props.includeUserPredictionLink && props.gameweekId ? 'router-link' : 'span'"
            :to="props.includeUserPredictionLink && props.gameweekId ? `/user-gameweek-predictions/${props.gameweekId}/${player.user_id}` : undefined"
          >
          <div class="flex items-center space-x-2">
            <div
                class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium me-2"
                :style="{ backgroundColor: player.bg_colour || '#ccc' }"
            >
                {{ player.username.charAt(0).toUpperCase() }}
            </div>
            {{ player.username }}
          </div>
          </component>
          <span v-if="player.user_id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
        </div>
        
        <div class="text-right">
          <span v-if="!isEditing" class="font-semibold text-green-600">{{ player.total_points }} pts</span>
          <template v-if="isEditing">
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
  </TransitionGroup>
</template>
  
<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { userStore } from "../store/userStore";
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, ChevronUpIcon, EqualsIcon } from "@heroicons/vue/24/solid";
import DateUtils from '../utils/dateUtils';
import SearchBar from './UI/SearchBar.vue';
  
interface LeaderboardEntry {
  id: string;
  position: number;
  total_correct_results: number;
  total_correct_scores: number;
  total_points: number;
  user_id: string;
  username: string;
  movement: string;
  bg_colour?: string;
}
  
export interface IProps {
  leaderboard: LeaderboardEntry[];
  editable?: boolean;
  previewOnly?: boolean;
  gameweekId?: string;
  lastUpdated?: Date;
  includeHeader?: boolean;
  headerText?: string;
  allowCollapse?: boolean;
  includeSearchBar?: boolean;
  includeUserPredictionLink?: boolean;
}
const props = defineProps<IProps>();
const emit = defineEmits(["update-leaderboard-entry", "changes-saved", "changes-cancelled"]);
const slots = useSlots();

const updateScore = (leaderboardId: string, userId: string, value: string) => {
  hasLeaderboardChanges.value = true;
  emit("update-leaderboard-entry", { leaderboardId, userId, value: parseInt(value) || 0 });
};

const currentUserId = userStore.user?.id;
const isEditing = ref(false);
const hasLeaderboardChanges = ref(false);
const leaderboardCollapsed = ref(false);
const searchString = ref('');

const visibleLeaderboard = computed(() => {
  let list = props.leaderboard;

  if (props.previewOnly) {
    const index = list.findIndex(entry => entry.user_id === currentUserId);
    if (index === -1) return [];

    const totalEntries = list.length;
    let start = Math.max(index - 2, 0);
    let end = Math.min(index + 3, totalEntries); // non-inclusive end index

    if (index < 2) {
      end = Math.min(5, totalEntries);
    } else if (index > totalEntries - 3) {
      start = Math.max(totalEntries - 5, 0);
    }

    list = list.slice(start, end);
  }

  // Filter by search string if one is present
  if (searchString.value.trim() !== '') {
    const lower = searchString.value.toLowerCase();
    list = list.filter(player => player.username.toLowerCase().includes(lower));
  }

  return list;
});


const toggleLeaderboardCollapse = () => {
  leaderboardCollapsed.value = !leaderboardCollapsed.value;
}

const toggleEditMode = () => {
  isEditing.value = true;
}

const cancelChanges = () => {
  isEditing.value = false;
  hasLeaderboardChanges.value = false;
  emit("changes-cancelled");
}

const saveChanges = () => {
  isEditing.value = false;
  hasLeaderboardChanges.value = false;
  emit("changes-saved");
}

async function handleSearchQuery(searchQuery: string) {
    searchString.value = searchQuery;
    leaderboardCollapsed.value = false;
}

</script>  

<style scoped>

.leaderboard-enter-active,
.leaderboard-leave-active {
  transition: all 0.2s ease;
}
.leaderboard-enter-from,
.leaderboard-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

</style>