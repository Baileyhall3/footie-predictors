<template>
    <div class="container mx-auto px-6 py-8">
        <LoadingScreen v-if="loading" />
        <template v-else>
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
    </div>
</template>

<script setup lang="ts">
import LoadingScreen from '../components/LoadingScreen.vue';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { groupsService } from '../api/groupsService';
import Podium from '../components/Podium.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const groupStats = ref([]);
const groupId = ref(null);
const bestAvgPoints = ref([]);
const bestScoreAccuracy = ref([]);
const bestCorrectScores = ref([]);

// avg_points_per_gameweek
// correct_score_ratio_percent
// total_correct_scores

onMounted(() => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;

        // Get group ID from route
        groupId.value = route.params.id || route.query.id;
        
        if (!groupId.value) {
            throw new Error('Group ID is missing');
        }

        const { data: statsData, error: statsError } = await groupsService.getGroupStats(groupId.value);
        if (statsError) throw new Error('Failed to load user stats');
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