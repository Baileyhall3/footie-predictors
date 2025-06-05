<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        <NoAccess v-if="notInGroup" message="You are not a member of this group." />
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p class="font-medium">Error loading group data</p>
            <p class="text-sm">{{ error }}</p>
            <button @click="fetchAllData" class="mt-2 text-sm text-red-700 underline">Try again</button>
        </div>
        <template v-else>
            <div class="mb-1 ms-1">
                <router-link :to="`/group/${groupId}`" class="text-blue-600 hover:underline font-medium">
                    ← Back to group
                </router-link>
            </div>
            
            <!-- All time leaderboard -->
            <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
                <div v-if="leaderboard.length">
                    <LeaderboardCard 
                        headerText="All-Time"
                        :leaderboard="leaderboard"
                        :editable="isAdmin"
                        includeHeader
                        :lastUpdated="leaderboardLastUpdated"
                        allowCollapse
                        includeSearchBar
                        :gameweekId="currentGameweek.id"
                        includeUserPredictionLink
                        @update-leaderboard-entry="handleLeaderboardUpdate"
                        @changes-saved="saveChanges"
                        @changes-cancelled="cancelChanges"
                    />
                </div>
                <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
            </div>

            <RoundedContainer headerText="All-Time Grid">
                <DataGrid 
                    :data="leaderboard" 
                    hideVerticalLines 
                    hideBorder
                    headerBgColor="rgb(22 157 74 /1)"
                >
                    <template #columns="{ row }">
                        <GridCol field="position" colName="Pos" :row="row" width="40px">
                            <template #display="{ row }">
                                <span class="font-medium w-6 text-center">{{ row.position }}.</span>
                            </template>
                        </GridCol>
                        <GridCol field="username" colName="Username" :row="row" width="200px">
                            <template #display="{ row }">
                                <UsernameDisplay :user="row" />
                            </template>
                        </GridCol>
                        <GridCol field="total_points" colName="Pts" :row="row" width="60px" colTitle="Total Points" />
                        <GridCol field="total_correct_scores" colName="CS" :row="row" width="60px" colTitle="Correct Scores" />
                        <GridCol field="total_correct_results" colName="CR" :row="row" width="60px" colTitle="Correct Results" />
                        <GridCol field="gameweek_wins" colName="GWW" :row="row" width="60px" colTitle="Gameweek Wins" />
                    </template>
                </DataGrid>
            </RoundedContainer>

            <!-- Current gameweek leaderboard -->
            <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="Object.keys(currentGameweek).length > 0">
                <div v-if="scores.length">
                    <LeaderboardCard 
                        :leaderboard="scores"
                        includeHeader
                        allowCollapse
                        includeSearchBar
                        :gameweekId="currentGameweek.id"
                        :lastUpdated="scoresLastUpdated"
                        includeUserPredictionLink
                    >
                        <template #filter>
                            <Lookup displayText="Showing: " :data="gameweekLkp" @item-selected="setCurrentGameweek" />
                        </template>
                        <template #header>
                            <h3 class="text-xl font-semibold">                    
                                <router-link 
                                    :to="`/gameweek/${currentGameweek.id}`" 
                                    class="text-blue-600 hover:underline"
                                >
                                    {{ currentGameweek.name }}
                                </router-link>
                            </h3>
                        </template>
                    </LeaderboardCard>
                </div>
                <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
            </div>
            
            <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="leaderboardHistory.length > 0">
                <div class="items-center flex mb-4">
                    <h3 class="text-xl font-semibold">                    
                        Leaderboard History
                    </h3>
                </div>
                <Tabs>
                    <Tab header="History">
                        <div class="divide-y divide-gray-200">
                            <div v-for="record in userLeaderboardHistory" :key="record.id" class="py-3 flex justify-between items-center">
                                <div>
                                    <div class="font-medium text-center">
                                        <router-link 
                                            :to="`/gameweek/${record.gameweek_id}`" 
                                            class="text-blue-600 hover:underline"
                                        >
                                            Gameweek {{ record.gameweek }}
                                        </router-link>
                                    </div>
                                    <div class="text-sm text-gray-500">Position: {{ record.position }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-green-600">{{ record.total_points }} pts</div>
                                    <div class="text-xs text-gray-500">
                                        {{ record.total_correct_scores }} exact scores
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab header="Position Chart">
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
                    </Tab>
                </Tabs>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import LoadingScreen from "../components/LoadingScreen.vue";
import { leaderboardStore } from '../store/leaderboardStore';
import LeaderboardCard from '../components/LeaderboardCard.vue';
import { leaderboardService } from '../api/leaderboardService';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import NoAccess from '../components/NoAccess.vue';
import { userStore } from '../store/userStore';
import Lookup from '../components/UI/Lookup.vue';
import LineChart from '../components/LineChart.vue';
import { LineData } from '../components/LineChart.vue';
import Tabs from '../components/UI/Tabs.vue';
import Tab from '../components/UI/Tab.vue';
import PageHeader from '../components/PageHeader.vue';
import { LookupOption } from '../components/UI/Lookup.vue';
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import DataGrid from '../components/UI/grid/DataGrid.vue';
import GridCol from '../components/UI/grid/GridCol.vue';
import { LeaderboardEntry } from '../types';
import UsernameDisplay from '../components/UI/UsernameDisplay.vue';

interface LeaderboardRecord {
    id: string;
    user_id: string;
    total_points: number;
}

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const notInGroup = ref(false);
const groupId = ref(null);
const members = ref([]);
const isAdmin = ref(false)
const leaderboard = ref<Array<LeaderboardEntry>>([]);
const currentGameweek = ref({});
const scores = ref([]);
const leaderboardLastUpdated = ref();
const scoresLastUpdated = ref();
const changedRecords = ref(<LeaderboardRecord[]>([])); 
const error = ref(null);
const leaderboardHistory = ref([]);
const userLeaderboardHistory = ref([]);
const gameweekLkp = ref<Array<LookupOption>>([]);
const positionHistory = ref<LineData>({});
const posXLabels = ref<string[]>([]);

onMounted(async () => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;
        groupId.value = route.params.id || route.query.id;
    
        const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(groupId.value);
        if (membersError) throw new Error('Failed to load group members');
        members.value = membersData || [];
    
        // Check if user is in the group
        const isMember = userInGroup(members.value);
        if (!isMember) {
            loading.value = false;
            notInGroup.value = true;
            return;
        }
    
        isAdmin.value = userIsAdmin(members.value);
    
        // Fetch all-time leaderboard
        const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(groupId.value);
        if (leaderboardError) throw new Error('Failed to load leaderboard');
        leaderboard.value = leaderboardData || [];
    
        if (leaderboard.value.length > 0) {
            leaderboardLastUpdated.value = new Date(leaderboard.value[0].leaderboard_last_updated);
        }
        
        // Fetch gameweeks
        const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
        if (gameweeksError) throw new Error('Failed to load gameweeks');
        if (gameweeksData.length > 0) {
            gameweekLkp.value = gameweeksData.map(x => {
                return {
                    id: x.id,
                    name: `Gameeek ${x.week_number} ${x.is_active ? '(current)' : ''}`,
                    selected: x.is_active ? true : false
                }
            });
            const activeGameweek = gameweekLkp.value.filter(x => x.selected);
            setCurrentGameweek(activeGameweek[0]);
        }

        // Fetch group leaderboard history
        const { data: historyData, error: scoresError } = await leaderboardService.getGroupLeaderboardHistory(groupId.value);
        if (scoresError) throw new Error('Failed to load leaderboard history');
        leaderboardHistory.value = (historyData || []);

        if (historyData.length > 0) {
            userLeaderboardHistory.value = historyData.filter(x => x.user_id === userStore.user?.id);
            userLeaderboardHistory.value.sort((a, b) => b.gameweek - a.gameweek);
            mapHistoryCharts(historyData);
        }

    } catch(err) {
        console.error('Error fetching leaderboard data:', err);
        error.value = err.message || 'An error occurred while loading leaderboard data';
    } finally {
        loading.value = false;
    }
}

async function setCurrentGameweek(gameweek: LookupOption) {
    currentGameweek.value = gameweek;
    // Fetch gameweek leaderboard
    const { data: scoresData, error: scoresError } = await leaderboardStore.fetchGameweekScores(groupId.value, gameweek.id);
    if (scoresError) throw new Error('Failed to load gameweek leaderboard');
    scores.value = scoresData || [];
    
    if (scores.value.length > 0) {
        scoresLastUpdated.value = leaderboard.value[0].updated_at ? new Date(leaderboard.value[0].updated_at) : null;
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

const cancelChanges = () => {
    changedRecords.value.splice(0, changedRecords.value.length);
}

const handleLeaderboardUpdate = ({ leaderboardId, userId, value }) => {
    const existingRecordIndex = changedRecords.value.findIndex(
        record => record.id === leaderboardId
    );

    if (existingRecordIndex !== -1) {
        changedRecords.value[existingRecordIndex].total_points = value;
    } else {
        changedRecords.value.push({
            id: leaderboardId,
            user_id: userId,
            total_points: value
        });
    }
};

async function saveChanges() {
    loading.value = true;

    for (const record of changedRecords.value) {
        try {
            await leaderboardService.updateUserTotalPoints(record.id, record.user_id, groupId.value, record.total_points);
        } catch(err) {
            console.error(err);
        }
    }

    toast("Leaderboard records have been updated!", {
        "type": "success",
        "position": "top-center"
    });

    loading.value = false;
    changedRecords.value.splice(0, changedRecords.value.length);
}
</script>