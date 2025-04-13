<template>
  <div class="flex justify-between items-center mb-4" v-if="props.includeHeader">
      <div class="items-center flex">
        <h3 class="text-xl font-semibold" v-if="props.gameweekId">                    
            <router-link 
                :to="`/gameweek/${props.gameweekId}`" 
                class="text-blue-600 hover:underline"
            >
                Current Gameweek
            </router-link>
        </h3>
        <h3 v-else class="text-xl font-semibold">{{ props.headerText }}</h3>
        <button type="button" @click="toggleLeaderboardCollapse" v-if="props.allowCollapse">
            <ChevronDownIcon v-if="!leaderboardCollapsed" class="size-5 ms-2 transition-transform duration-300"  />
            <ChevronUpIcon v-else class="size-5 ms-2 transition-transform duration-300" />
        </button>
      </div>
      <div v-if="props.editable" class="mt-4 flex flex-wrap gap-2">
          <button v-if="!isEditing" @click="toggleEditMode" 
            class="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition">
              Edit
          </button>
          <button v-if="isEditing" @click="cancelChanges" 
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm hover:bg-gray-400">
              Cancel
          </button>
          <button v-if="isEditing" @click="saveChanges" :disabled="!hasLeaderboardChanges" 
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50">
              Save
          </button>
      </div>
  </div>

  <p v-if="props.lastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(props.lastUpdated) }}</p>

  <template v-if="props.includeSearchBar">
    <div class="justify-start flex">
        <SearchBar class="mt-2 mb-2" searchBasis="players" @search-entered="handleSearchQuery" />
    </div>
    <p class="mt-2" style="align-self: end;" v-if="searchString">Showing results for "{{ searchString }}"</p>
  </template>

  <TransitionGroup name="leaderboard" tag="div">
    <template v-if="(!leaderboardCollapsed && props.allowCollapse) || !props.allowCollapse">
      <div v-for="player in visibleLeaderboard" :key="player.id" class="flex justify-between items-center border-b py-3">
        <div class="flex items-center gap-2">
          <span class="font-medium w-6 text-center">{{ player.position }}.</span>
          <span>{{ player.username }}</span>
          <ArrowUpIcon class="size-3 text-green-600" v-if="player.movement == 'up'" />
          <ArrowDownIcon class="size-3 text-red-600" v-if="player.movement == 'down'" />
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
import { computed, ref } from 'vue';
import { userStore } from "../store/userStore";
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
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
}
const props = withDefaults(defineProps<IProps>(), {
  headerText: 'All-Time',
})
const emit = defineEmits(["update-leaderboard-entry", "changes-saved", "changes-cancelled"]);

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