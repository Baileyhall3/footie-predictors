<template>
    <RoundedContainer headerText="Your Stats">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" v-if="Object.keys(userStats).length > 0">
            <StatRow icon="🔥" label="Avg. Points / Gameweek" :value="userStats.avg_points_per_gameweek" />
            <StatRow icon="🎯" label="Correct Scores" :value="userStats.total_correct_scores" />
            <StatRow icon="✅" label="Correct Results" :value="userStats.total_correct_results" />
            <StatRow icon="📈" label="Score Accuracy" :value="userStats.correct_score_ratio_percent + '%'" />
        </div>
        <p v-else class="text-gray-500 py-2">
            No stats data available. 
            <router-link :to="`/group/${props.groupId}/create-gameweek`" class="text-blue-600 hover:underline">
                Create a gameweek
            </router-link> 
            and start playing to see stats!
        </p>
    </RoundedContainer>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4" v-if="groupStats.length > 0">
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <Podium 
                :podiumData="bestAvgPoints" 
                header="Highest Points Per Gameweek" 
                icon="🔥" 
                displayField="avg_points_per_gameweek"
            />
        </div>
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <Podium 
                :podiumData="bestScoreAccuracy" 
                header="Best Score Accuracy" 
                icon="📈" 
                displayField="correct_score_ratio_percent"
            />
        </div>
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <Podium 
                :podiumData="bestCorrectScores" 
                header="Total Correct Scores" 
                icon="🎯" 
                displayField="total_correct_scores"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import StatRow from '../components/StatRow.vue';
import Podium from '../components/Podium.vue';
import { ref, onMounted } from 'vue';
import { groupsService } from '../api/groupsService';
import { userStore } from '../store/userStore';
import LoadingScreen from '../components/LoadingScreen.vue';

const loading = ref(false);
const bestAvgPoints = ref([]);
const bestScoreAccuracy = ref([]);
const bestCorrectScores = ref([]);
const groupStats = ref([]);
const userStats = ref([]);

export interface IProps {
    groupId: string
}
const props = defineProps<IProps>();

onMounted(() => {
    fetchStatsData();
});

async function fetchStatsData() {
    try {
        loading.value = true;

        const { data: statsData, error: statsError } = await groupsService.getGroupStats(props.groupId);
        if (statsError) throw new Error('Failed to load group stats');
        const userRecord = statsData.find(x => x.user_id === userStore.user?.id);
        userStats.value = userRecord;
        groupStats.value = statsData || [];

        bestAvgPoints.value = getTopOrBottomThree(statsData, 'avg_points_per_gameweek');
        bestScoreAccuracy.value = getTopOrBottomThree(statsData, 'correct_score_ratio_percent');
        bestCorrectScores.value = getTopOrBottomThree(statsData, 'total_correct_scores')

    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

function getTopOrBottomThree(array: any[], field: string, order = 'desc') {
    if (!Array.isArray(array) || array.length === 0) return [];

    const sorted = [...array].sort((a, b) => {
        const aVal = a[field] ?? -Infinity;
        const bVal = b[field] ?? -Infinity;

        if (order === 'asc') {
            return aVal - bVal;
        } else {
            return bVal - aVal;
        }
    });

    return sorted.slice(0, 3);
}

</script>