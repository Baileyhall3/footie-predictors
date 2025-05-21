<template>
    <LoadingScreen v-if="loading" />
    <div class="container mx-auto py-8" v-else>
        <DoesNotExist v-if="!userExists" entity="user" />
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p class="font-medium">Error loading user data</p>
            <p class="text-sm">{{ error }}</p>
            <button @click="fetchAllData" class="mt-2 text-sm text-red-700 underline">Try again</button>
        </div>
        <template v-else>
            <PageHeader>
                <template #header>
                    <div class="flex items-center justify-center rounded-full w-8 h-8 text-white text-sm font-medium"
                        :style="{ backgroundColor: user?.bg_colour || '#ccc' }"
                    >
                        {{ user?.username.charAt(0).toUpperCase() }}
                    </div>
                    <h2 class="text-2xl font-semibold">{{ userId === userStore.user?.id ? 'You' : user?.username }}</h2>
                </template>

                <template #actionItems>
                    <button @click="copyProfileLink()" class="p-1 rounded-md hover:bg-gray-200" title="Copy user profile link">
                        <LinkIcon class="size-6 text-blue-500" />
                    </button>
                    <Dropdown>
                        <template #trigger>
                            <EllipsisVerticalIcon class="size-6 text-gray-500" />
                        </template>
                        <template #items>
                            <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item">
                                Go to group
                            </router-link>
                        </template>
                    </Dropdown>
                </template>

                <template #details>
                    <p class="text-gray-500">Member of {{ groupName }} since {{ DateUtils.toShortDate(user?.joined_at) }}</p>
                </template>
            </PageHeader>
            <Tabs>
                <Tab header="Predictions">
                    <ScoreCard2
                        :matches="userGameweekPredictions"
                        :header="currentGameweek?.name"
                        :totalPoints="gameweekTotalPoints"
                        matchesClickable
                    >
                        <template #filter>
                            <Lookup displayText="Showing: " :data="gameweekLkp" @item-selected="setCurrentGameweek" />
                        </template>
                    </ScoreCard2>
                </Tab>
                <Tab header="Performance">
                    <RoundedContainer headerText="All-Time">
                        <template #headerContent>
                            <router-link 
                            :to="`/group/${groupId}/leaderboards`" 
                            class="text-sm text-blue-600 hover:underline"
                            >
                                View Full Leaderboard →
                            </router-link>
                        </template>
                                
                        <div v-if="groupLeaderboard.length > 0">
                            <LeaderboardCard 
                                :leaderboard="groupLeaderboard"
                                headerText="All-Time"
                                previewOnly
                                :userId="userId"
                            />
                        </div>
                        <p v-if="groupLeaderboard.length === 0" class="text-gray-500 py-2">No leaderboard data available.</p>
                    </RoundedContainer>

                    <RoundedContainer v-if="currentGameweek">
                        <div v-if="scores.length">
                            <LeaderboardCard 
                                :leaderboard="scores"
                                includeHeader
                                allowCollapse
                                includeSearchBar
                                :gameweekId="currentGameweek?.id"
                                previewOnly
                                :userId="userId"
                            >
                                <template #filter>
                                    <Lookup displayText="Showing: " :data="gameweekLkp" @item-selected="setCurrentGameweek" />
                                </template>
                                <template #header>
                                    <h3 class="text-xl font-semibold">                    
                                        <router-link 
                                            :to="`/gameweek/${currentGameweek?.id}`" 
                                            class="text-blue-600 hover:underline"
                                        >
                                            {{ currentGameweek?.name }}
                                        </router-link>
                                    </h3>
                                </template>
                            </LeaderboardCard>
                        </div>
                        <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
                    </RoundedContainer>
                    <RoundedContainer headerText="History" v-if="groupLeaderboard.length > 0">
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
                </Tab>
                <Tab header="Stats">
                    <RoundedContainer>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" v-if="Object.keys(userStats).length > 0">
                            <StatRow icon="🥇" label="Gameweek Wins" :value="userStats?.gameweek_wins" />
                            <StatRow icon="🔥" label="Avg. Points / Gameweek" :value="userStats?.avg_points_per_gameweek" />
                            <StatRow icon="🎯" label="Correct Scores" :value="userStats?.total_correct_scores" />
                            <StatRow icon="✅" label="Correct Results" :value="userStats?.total_correct_results" />
                            <StatRow icon="📈" label="Score Accuracy" :value="userStats?.correct_score_ratio_percent + '%'" />
                        </div>
                        <p v-else class="text-gray-500 py-2">
                            No stats data available. 
                        </p>
                    </RoundedContainer>
                </Tab>
            </Tabs>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import Tabs from "../components/UI/Tabs.vue";
import Tab from "../components/UI/Tab.vue";
import LoadingScreen from '../components/LoadingScreen.vue';
import DoesNotExist from "../components/DoesNotExist.vue";
import { Prediction, UserStats, LeaderboardEntry } from '../types';
import PageHeader from '../components/PageHeader.vue';
import DateUtils from '../utils/dateUtils';
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import Dropdown from "../components/UI/Dropdown.vue";
import { EllipsisVerticalIcon, LinkIcon } from '@heroicons/vue/24/solid';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ScoreCard2 from '../components/ScoreCard2.vue';
import { predictionsService } from '../api/predictionsService';
import { userStore } from "../store/userStore";
import { leaderboardService } from '../api/leaderboardService';
import StatRow from '../components/StatRow.vue';
import { groupsService } from '../api/groupsService';
import Lookup from '../components/UI/Lookup.vue';
import { LookupOption } from '../components/UI/Lookup.vue';
import { gameweeksService } from '../api/gameweeksService';
import LeaderboardCard from '../components/LeaderboardCard.vue';
import LineChart from '../components/LineChart.vue';
import { LineData } from '../components/LineChart.vue';

const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(false);
const userExists = ref<boolean>(true);
const userId = ref<string | null>(null);
const user = ref(); // TODO: User type
const isAdmin = ref<boolean>(false);
const error = ref<string | null>(null);
const userGameweekPredictions = ref<Array<Prediction>>();
const groupId = ref<string | null>(null);
const groupLeaderboard = ref<Array<LeaderboardEntry>>(); // TODO: Leaderboard type
const groupName = ref<string>();
const userStats = ref<UserStats>();
const currentGameweek = ref<LookupOption>();
const gameweekTotalPoints = ref<number>();
const gameweekLkp = ref<Array<LookupOption>>();
const scores = ref<Array<LeaderboardEntry>>([]); // TODO: Types for this
const leaderboardHistory = ref([]);
const positionHistory = ref<Array<LineData>>();
const posXLabels = ref<string[]>([]);

onMounted(() => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;

        groupId.value = route.params.group_id || route.query.group_id;
        userId.value = route.params.user_id || route.query.user_id;
    
        if (!userId.value || !groupId.value) {
            throw new Error('User ID or group ID is missing');
        }

        const { data: leaderboardData, error: leaderboardError } = await leaderboardService.getGroupLeaderboard(groupId.value)
        if (leaderboardError) {
            throw new Error(`Leaderboard error: ${leaderboardError}`)
        }
        groupLeaderboard.value = leaderboardData || [];
        
        if (leaderboardData.length > 0) {
            const currentUser = leaderboardData.find(x => x.user_id === userId.value);
            if (!currentUser) {
                userExists.value = false;
                loading.value = false;
                return;
            }
            user.value = currentUser;
            groupName.value = currentUser.group_name;
        }

        // Fetch group leaderboard history
        const { data: historyData, error: scoresError } = await leaderboardService.getUserGroupLeaderboardHistory(groupId.value, userId.value);
        if (scoresError) throw new Error('Failed to load leaderboard history');
        leaderboardHistory.value = (historyData || []);

        if (historyData.length > 0) {
            mapHistoryCharts(historyData);
        }

        const { data: statsData, error: statsError } = await groupsService.getGroupStats(groupId.value);
        if (statsError) throw new Error('Failed to load group stats');
        const userRecord = statsData.find(x => x.user_id === userId.value);
        userStats.value = userRecord;

        const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
        if (gameweeksError) throw new Error('Failed to load gameweeks');
        const sortedGameweeks = gameweeksData ? gameweeksData.sort((a, b) => b.week_number - a.week_number).filter(x => x.is_locked) : []

        if (sortedGameweeks.length > 0) {            
            gameweekLkp.value = gameweeksData.map(x => {
                return {
                    id: x.id,
                    name: `Gameeek ${x.week_number} ${x.is_active ? '(current)' : ''}`,
                    selected: x.is_active ? true : false
                }
            });
            const activeGameweek = gameweekLkp.value.find(x => x.selected);
            await setCurrentGameweek(activeGameweek);
        }
    } catch(err) {
        console.error(err);
        error.value = err.message || 'An error occurred while loading season data';
    } finally {
        loading.value = false;
    }
}

async function setCurrentGameweek(gameweek: LookupOption) {
    try {
        currentGameweek.value = gameweek;
        const { 
            data: predictionsData, 
            error: predictionsError 
        } = await predictionsService.getUserGameweekPredictionsUsingView(userId.value, gameweek.id)
        
        if (predictionsError) {
            throw new Error(`Predictions error: ${predictionsError}`)
        }
    
        if (predictionsData) {
            userGameweekPredictions.value = predictionsData.predictions;
            gameweekTotalPoints.value = predictionsData.totalPoints;
        }
        
        const { data: scoresData, error: scoresError } = await leaderboardService.getGameweekScores(groupId.value, gameweek.id);
        if (scoresError) throw new Error('Failed to load gameweek leaderboard');
        scores.value = scoresData || [];
    } catch (err) {
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

function copyProfileLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast("Profile link copied!", {
        "type": "info",
        "position": "top-center"
    });
}

</script>