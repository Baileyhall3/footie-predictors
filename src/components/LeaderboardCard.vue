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
        <UsernameDisplay 
          :user="player" 
          :includeUserPredictionLink="props.includeUserPredictionLink" 
          :gameweek-id="gameweekId"
          :currentUserId="userStore.user.id"
          showUserPosition
        >
        <template #additionalDisplay>
          <TrophyIcon v-if="player.user_id === props.winnerId" class="size-5 text-yellow-300" />
          <StarIcon v-else-if="props.userId && player.user_id === props.userId" class="size-5 text-yellow-300" />
        </template>
        </UsernameDisplay>
        
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
  <div v-if="props.previewOnly && recordsNotLoaded != 0" class="text-center mt-4">
      <button 
          @click="allRecordsLoaded = true"
          class="text-blue-600 hover:underline font-medium"
      >
          Show {{ recordsNotLoaded }} more
      </button>
  </div>
</template>
  
<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { userStore } from "../store/userStore";
import { ChevronDownIcon, ChevronUpIcon, StarIcon, TrophyIcon } from "@heroicons/vue/24/solid";
import DateUtils from '../utils/dateUtils';
import SearchBar from './UI/SearchBar.vue';
import { LeaderboardEntry } from '../types';
import UsernameDisplay from './UI/UsernameDisplay.vue';
  
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
  userId?: string;
  winnerId?: string;
}
const props = defineProps<IProps>();
const emit = defineEmits(["update-leaderboard-entry", "changes-saved", "changes-cancelled"]);
const slots = useSlots();

const updateScore = (leaderboardId: string, userId: string, value: string) => {
  hasLeaderboardChanges.value = true;
  emit("update-leaderboard-entry", { leaderboardId, userId, value: parseInt(value) || 0 });
};

const isEditing = ref<boolean>(false);
const hasLeaderboardChanges = ref<boolean>(false);
const leaderboardCollapsed = ref<boolean>(false);
const searchString = ref<string>('');
const allRecordsLoaded = ref<boolean>(false);

const recordsNotLoaded = computed(() => {
  if (!props.previewOnly || allRecordsLoaded.value) return 0;
  return props.leaderboard.length - visibleLeaderboard.value.length;
});

const currentUserId = computed(() => {
  return props.userId ?? userStore.user?.id
})

const visibleLeaderboard = computed(() => {
  let list = props.leaderboard;

  if (props.previewOnly && props.leaderboard.length > 5) {
    const index = list.findIndex(entry => entry.user_id === currentUserId.value);
    if (index === -1) return [];

    const totalEntries = list.length;
    let start = Math.max(index - 2, 0);
    let end = Math.min(index + 3, totalEntries); // non-inclusive end index

    if (index < 2) {
      end = Math.min(5, totalEntries);
    } else if (index > totalEntries - 3) {
      start = Math.max(totalEntries - 5, 0);
    }

    if (!allRecordsLoaded.value) {
      list = list.slice(start, end);
      recordsNotLoaded.value = props.leaderboard.length - list.length;
    } else {
      recordsNotLoaded.value = 0; // 👈 set to zero when all records are shown
    }
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