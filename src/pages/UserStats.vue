<template>
    <div class="container mx-auto px-6 py-8">
        <LoadingScreen v-if="loading" />
        <template v-else>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold">Your Stats</h2>
                <SearchBar2 v-model="searchQuery" @update:model-value="handleSearchQuery" />
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
import { SearchBar2 } from '../components/UI/input';

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
        // loading.value = false;
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