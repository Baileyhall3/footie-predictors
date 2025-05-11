<template>
    <LoadingScreen v-if="loading" />
    <template v-else>
        <RoundedContainer headerText="All-Time">
            <template #headerContent>
                <router-link 
                :to="`/group/${$props.groupId}/leaderboards`" 
                class="text-sm text-blue-600 hover:underline"
                >
                    View Full Leaderboard →
                </router-link>
            </template>
    
            <p v-if="leaderboardLastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(leaderboardLastUpdated) }}</p>
    
            <div v-if="leaderboard.length > 0">
                <LeaderboardCard 
                    :leaderboard="leaderboard"
                    headerText="All-Time"
                    previewOnly
                    :gameweekId="props.activeGameweekId"
                    includeUserPredictionLink
                />
            </div>
            <p v-if="leaderboard.length === 0" class="text-gray-500 py-2">No leaderboard data available.</p>
        </RoundedContainer>
        <RoundedContainer headerText="History" v-if="leaderboard.length > 0">
            <LineChart 
                :lineData="positionHistory" 
                :xLabels="posXLabels"
                :options="{
                    stepSize: 1,
                    precision: 0,
                    beginAtZero: true,
                    reverse: true,
                    minY: 1
                }" 
            />
        </RoundedContainer>
    </template>
</template>

<script setup lang="ts">
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import DateUtils from '../utils/dateUtils';
import LineChart from '../components/LineChart.vue';
import { LineData } from '../components/LineChart.vue';
import { ref, onMounted } from 'vue';
import { leaderboardService } from '../api/leaderboardService';
import LeaderboardCard from '../components/LeaderboardCard.vue';
import LoadingScreen from '../components/LoadingScreen.vue';

const props = defineProps<{groupId: string, activeGameweekId?: string}>();

const leaderboardLastUpdated = ref();
const leaderboard = ref([]);
const leaderboardHistory = ref([]);
const positionHistory = ref<LineData>({});
const posXLabels = ref<string[]>([]);
const loading = ref(false);

onMounted(() => {
    getLeaderboard();
});

async function getLeaderboard() {
    try {
        loading.value = true;
        const { data: leaderboardData, error: leaderboardError } = await leaderboardService.getGroupLeaderboard(props.groupId);
        if (leaderboardError) throw new Error('Failed to load leaderboard');
        leaderboard.value = leaderboardData || [];
    
        if (leaderboard.value.length > 0) {
            leaderboardLastUpdated.value = leaderboard.value[0].leaderboard_last_updated ? new Date(leaderboard.value[0].leaderboard_last_updated) : null;
        }

        // Fetch group leaderboard history
        const { data: historyData, error: scoresError } = await leaderboardService.getGroupLeaderboardHistory(props.groupId);
        if (scoresError) throw new Error('Failed to load leaderboard history');
        leaderboardHistory.value = (historyData || []);

        if (historyData.length > 0) {
            mapHistoryCharts(historyData);
        }
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

function mapHistoryCharts(historyData: any[]) {
    const usersMap: Record<string, {
        username: string;
        borderColor: string;
        gameweekPositions: Record<number, number>; // gameweek: position
        totalPointsPerGameweek: Record<number, number>
    }> = {};

    const gameweekSet = new Set<number>();

    historyData.forEach(entry => {
        const { user_id, username, gameweek, position, bg_colour, total_points } = entry;

        gameweekSet.add(gameweek);

        if (!usersMap[user_id]) {
            usersMap[user_id] = {
                username,
                borderColor: bg_colour,
                gameweekPositions: {},
                totalPointsPerGameweek: {}
            };
        }

        usersMap[user_id].gameweekPositions[gameweek] = position;
        usersMap[user_id].totalPointsPerGameweek[gameweek] = total_points;

    });

    const sortedGameweeks = Array.from(gameweekSet).sort((a, b) => a - b);

    // Format data for chart
    positionHistory.value = Object.values(usersMap).map(user => ({
        title: user.username,
        borderColor: user.borderColor,
        data: sortedGameweeks.map(gw => user.gameweekPositions[gw] ?? null),
        totalPointsPerGameweek: sortedGameweeks.map(gw => user.totalPointsPerGameweek[gw] ?? null)
    }));

    posXLabels.value = sortedGameweeks.map(gw => `GW ${gw}`);
}
</script>