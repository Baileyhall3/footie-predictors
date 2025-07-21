<template>
    <LoadingContainer v-if="loading" bgColor="none" />
    <RoundedContainer headerText="Your Stats" v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" v-if="Object.keys(userStats).length > 0">
            <StatRow icon="🔥" label="Avg. Points / Gameweek" :value="userStats.avg_points_per_gameweek" />
            <StatRow icon="🎯" label="Correct Scores" :value="userStats.total_correct_scores" />
            <StatRow icon="✅" label="Correct Results" :value="userStats.total_correct_results" />
            <StatRow icon="📈" label="Score Accuracy" :value="userStats.correct_score_ratio_percent + '%'" />
        </div>
        <p v-else class="text-gray-500 py-2">
            No stats data available. 
            <!-- <router-link :to="`/group/${props.groupId}/create-gameweek`" class="text-blue-600 hover:underline">
                Create a gameweek
            </router-link> 
            and start playing to see stats! -->
        </p>
    </RoundedContainer>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-8" v-if="groupOrSeasonStats.length > 0">
        <RoundedContainer>
            <Podium 
                :podiumData="bestAvgPoints" 
                header="Highest Points Per Gameweek" 
                icon="🔥" 
                displayField="avg_points_per_gameweek"
            />
        </RoundedContainer>
        <RoundedContainer>
            <Podium 
                :podiumData="mostGameweekWins" 
                header="Most Gameweek Wins" 
                icon="🥇" 
                displayField="gameweek_wins"
            />
        </RoundedContainer>
        <RoundedContainer>
            <Podium 
                :podiumData="bestCorrectScores" 
                header="Total Correct Scores" 
                icon="🎯" 
                displayField="total_correct_scores"
            />
        </RoundedContainer>
        <RoundedContainer>
            <Podium 
                :podiumData="bestScoreAccuracy" 
                header="Best Score Accuracy" 
                icon="📈" 
                displayField="correct_score_ratio_percent"
            />
        </RoundedContainer>
    </div>
</template>

<script setup lang="ts">
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import StatRow from '../components/StatRow.vue';
import Podium from '../components/Podium.vue';
import { ref, onMounted } from 'vue';
import { groupsService } from '../api/groupsService';
import { userStore } from '../store/userStore';
import LoadingContainer from '../components/LoadingContainer.vue';
import { seasonsService } from '../api/seasonsService';

const loading = ref(false);
const bestAvgPoints = ref([]);
const bestScoreAccuracy = ref([]);
const bestCorrectScores = ref([]);
const mostGameweekWins = ref([]);
const groupOrSeasonStats = ref([]);
const userStats = ref([]);

export interface IProps {
    groupId: string;
    seasonId?: string;
}
const props = defineProps<IProps>();

onMounted(() => {
    fetchStatsData();
});

async function fetchStatsData() {
    try {
        loading.value = true;

        let statsError = null;
        let statsData = [];

        if (!props.seasonId) {
            const { data: groupStatsData, error: groupStatsError } = await groupsService.getGroupStats(props.groupId);
            statsError = groupStatsError;
            statsData = groupStatsData;
        } else {
            const { data: seasonStatsData, error: seasonStatsError } = await seasonsService.getSeasonStats(props.seasonId);
            statsError = seasonStatsError;
            statsData = seasonStatsData;
        }

        if (statsError) throw new Error('Failed to load stats');
        groupOrSeasonStats.value = statsData || [];
        if (statsData.length > 0) {
            const userRecord = statsData.find(x => x.user_id === userStore.user?.id);
            userStats.value = userRecord;
    
            bestAvgPoints.value = getTopOrBottomThree(statsData, 'avg_points_per_gameweek');
            bestScoreAccuracy.value = getTopOrBottomThree(statsData, 'correct_score_ratio_percent');
            bestCorrectScores.value = getTopOrBottomThree(statsData, 'total_correct_scores');
            mostGameweekWins.value = getTopOrBottomThree(statsData, 'gameweek_wins');
        }
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