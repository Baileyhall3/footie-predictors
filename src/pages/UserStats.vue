<template>
    <div class="container mx-auto px-6 py-8">
        <LoadingScreen v-if="loading" />
        <template v-else>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Your Group Stats</h2>
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
import { ref, onMounted } from 'vue';
import { groupsService } from '../api/groupsService';
import { userStore } from '../store/userStore';
import StatRow from '../components/StatRow.vue';
import GroupCard from '../components/GroupCard.vue';

const loading = ref(false);
const groupStats = ref([]);

onMounted(() => {
    fetchAllData();
})

async function fetchAllData() {
    try {
        loading.value = true;

        const { data, error } = await groupsService.getGroupStats(null, userStore.user?.id);
        if (error) throw new Error('Failed to load user stats');
        debugger
        groupStats.value = data || [];

    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}
</script>