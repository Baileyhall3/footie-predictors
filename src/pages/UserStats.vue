<template>
    <div class="container mx-auto px-6 py-8">
        <LoadingScreen v-if="loading" />
        <template v-else>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold">Your Stats</h2>
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

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="groupStats.length > 0">
                <GroupCard 
                    :group="group" 
                    groupNameField="group_name" 
                    groupIdField="group_id"
                    :hideMemberCount="true" 
                    v-for="group in groupStats" :key="group.group_id"
                >
                    <template #additionalGroupInfo>
                        <div class="space-y-3 mt-4">
                            <StatRow icon="🔥" label="Avg. Points / Gameweek" :value="group.avg_points_per_gameweek" />
                            <StatRow icon="🎯" label="Correct Scores" :value="group.total_correct_scores" />
                            <StatRow icon="✅" label="Correct Results" :value="group.total_correct_results" />
                            <StatRow icon="📈" label="Score Accuracy" :value="group.correct_score_ratio_percent + '%'" />
                        </div>
                    </template>
                </GroupCard>
            </div>
            <div v-else class="bg-white rounded-xl shadow p-10 text-center text-gray-500 mt-4 border border-dashed border-gray-300">
                <div class="text-4xl mb-4">🤷‍♂️</div>
                <p class="text-lg font-medium mb-2">You're not part of any groups yet!</p>
                <p class="text-sm text-gray-400">Join or 
                    <router-link to="/create-group" class="text-blue-600 hover:underline">
                        create a group
                    </router-link> 
                    to start tracking your stats.
                </p>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import LoadingScreen from '../components/LoadingScreen.vue';
import { ref, onMounted, computed } from 'vue';
import { groupsService } from '../api/groupsService';
import { userStore } from '../store/userStore';
import StatRow from '../components/StatRow.vue';
import GroupCard from '../components/GroupCard.vue';
import { UserStats } from '../types';

const loading = ref(false);
const groupStats = ref<Array<UserStats>>([]);
const sortField = ref(null);
const showSortSelect = ref(false);
const searchQuery = ref<string>('');
const allGroupStats = ref([]);

const sortOptions = [
  { value: null, label: 'Select Sort' },
  { value: 'avg_points_per_gameweek', label: 'Avg. Points / Gameweek' },
  { value: 'total_correct_scores', label: 'Correct Scores' },
  { value: 'total_correct_results', label: 'Correct Results' },
  { value: 'correct_score_ratio_percent', label: 'Score Accuracy' },
]

onMounted(() => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;

        const { data, error } = await groupsService.getGroupStats(null, userStore.user?.id);
        if (error) throw new Error('Failed to load user stats');
        
        groupStats.value = data || [];
        allGroupStats.value = data || [];
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

function handleSearchQuery() {
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        groupStats.value = allGroupStats.value.filter(group =>
            group.group_name.toLowerCase().includes(query)
        );
    } else {
        groupStats.value = allGroupStats.value;
    }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>