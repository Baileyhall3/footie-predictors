<template>
    <LoadingScreen v-if="loading" />
    <div v-else class="container mx-auto py-8">
        <NoAccess v-if="notInGroup" message="You are not a member of this group." />
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p class="font-medium">Error loading group data</p>
            <p class="text-sm">{{ error }}</p>
            <button @click="fetchAllData" class="mt-2 text-sm text-red-700 underline">Try again</button>
        </div>
        <template v-else>
            <PageHeader>
                <template #header>
                    <h2 class="text-2xl font-semibold">{{ group?.name }} Leaderboards</h2>
                </template>

                <template #actionItems>
                    <button @click="copyPageLink('Leaderboard')" class="p-1 rounded-md hover:bg-gray-200" title="Copy leaderboards link">
                        <LinkIcon class="size-6 text-blue-500" />
                    </button>
                    <Dropdown>
                        <template #trigger>
                            <EllipsisVerticalIcon class="size-6 text-gray-500" />
                        </template>
                        <template #items>
                            <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item">
                                Go to Group
                            </router-link>
                        </template>
                    </Dropdown>
                </template>

                <template #details>
                    <!-- <p class="text-gray-500">{{ currentLeader }}</p> -->
                    <div class="flex">
                        <Lookup displayText="Season: " :data="seasonLkp" @item-selected="setCurrentSeason" />
                        {{ currentSeason?.name }}
                    </div>
                </template>
            </PageHeader>

            <Tabs>
                <Tab header="Season">
                    <!-- <RoundedContainer v-if="leaderboard">
                        <template #header>
                            <h3 class="text-xl font-semibold">{{ currentSeason?.name }}</h3>
                            <button type="button" @click="hideGridFilterRow = !hideGridFilterRow; console.log(leaderboardGridRef);">
                                <FunnelIcon v-if="!hideGridFilterRow" class="size-5 ms-2" />
                                <FunnelIconOutline v-else class="size-5 ms-2"  />
                            </button>
                        </template> -->
                        <DataGrid 
                            ref="leaderboardGridRef"
                            :data="leaderboard" 
                            hideVerticalLines 
                            headerBgColor="rgb(22 163 74 /1)"
                            :hideFilterRow="hideGridFilterRow"
                        >
                            <template #cardHeader>
                                <div class="items-center flex py-6 ms-2">
                                    <h3 class="text-xl font-semibold">{{ currentSeason?.name }}</h3>
                                    <button type="button" @click="hideGridFilterRow = !hideGridFilterRow; console.log(leaderboardGridRef);">
                                        <FunnelIcon v-if="!hideGridFilterRow" class="size-5 ms-2" />
                                        <FunnelIconOutline v-else class="size-5 ms-2"  />
                                    </button>
                                </div>
                            </template>
                            <template #columns="{ row }">
                                <GridCol field="position" colName="Pos" width="40px" disableFilter>
                                    <template #display="{ row }">
                                        <span class="font-medium w-6 text-center">{{ row.position }}.</span>
                                    </template>
                                </GridCol>
                                <GridCol field="username" colName="Username" width="200px">
                                    <template #display="{ row }">
                                        <UsernameDisplay :user="row" :currentUserId="userStore.user?.id" />
                                    </template>
                                </GridCol>
                                <GridCol field="total_points" colName="Pts"  width="60px" colTitle="Total Points" sortable type="number" />
                                <GridCol field="total_correct_scores" colName="CS"  width="60px" colTitle="Correct Scores" sortable />
                                <GridCol field="total_correct_results" colName="CR"  width="60px" colTitle="Correct Results" sortable />
                                <GridCol field="gameweek_wins" colName="W"  width="60px" colTitle="Gameweek Wins" sortable />
                            </template>
                        </DataGrid>
                    <!-- </RoundedContainer> -->
                </Tab>
                <Tab header="Gameweeks">
                    <RoundedContainer v-if="currentGameweek">
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
                    </RoundedContainer>
                </Tab>
                <Tab header="History">
                    <RoundedContainer>
                        <template #header>
                            <h3 class="text-xl font-semibold">Leaderboard History</h3>
                        </template>
                        <Tabs v-if="leaderboardHistory.length > 0">
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
                        <p v-else class="text-gray-500 py-2">No leaderboard history available.</p>
                    </RoundedContainer>
                </Tab>
            </Tabs>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { groupsStore } from '../store/groupsStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import LoadingScreen from "../components/LoadingScreen.vue";
import { leaderboardStore } from '../store/leaderboardStore';
import LeaderboardCard from '../components/LeaderboardCard.vue';
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
import { LeaderboardEntry, Gameweek, Group, Season } from '../types';
import UsernameDisplay from '../components/UI/UsernameDisplay.vue';
import { FunnelIcon, EllipsisVerticalIcon, LinkIcon } from '@heroicons/vue/24/solid';
import { FunnelIcon as FunnelIconOutline } from '@heroicons/vue/24/outline';
import { copyPageLink } from '../utils/sharedFunctions';
import Dropdown from "../components/UI/Dropdown.vue";
import { seasonsService } from '../api/seasonsService';

const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(true);
const notInGroup = ref<boolean>(false);
const groupId = ref<string | null>(null);
const members = ref([]);
const isAdmin = ref<boolean>(false)
const leaderboard = ref<Array<LeaderboardEntry>>([]);
const currentGameweek = ref<LookupOption>();
const scores = ref([]);
const leaderboardLastUpdated = ref<Date | null>();
const scoresLastUpdated = ref<Date | null>();
const error = ref<string>('');
const leaderboardHistory = ref([]);
const userLeaderboardHistory = ref([]);
const gameweekLkp = ref<Array<LookupOption>>([]);
const positionHistory = ref<LineData>();
const posXLabels = ref<string[]>([]);
const hideGridFilterRow = ref<boolean>(true);
const leaderboardGridRef = ref();
const group = ref<Group>();
const groupExists = ref<boolean>(true);
const seasonLkp = ref<Array<LookupOption>>([]);
const currentSeason = ref<LookupOption>();

onMounted(async () => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;
        groupId.value = route.params.id || route.query.id;

        // Fetch group details
        const { data: groupData, error: groupError } = await groupsStore.fetchGroupById(groupId.value);
        console.log(groupError)
        if (groupError && groupError.code === "PGRST116") {
            groupExists.value = false;
            loading.value = false;
            return;
        }
        if (groupError) throw new Error('Failed to load group details');
        group.value = groupData;
    
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

        const { data: seasonsData, error: seasonsError } = await seasonsService.getGroupSeasons(groupId.value);
        if (seasonsError) throw new Error('Failed to load seasons');

        const sortedSeasons = seasonsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        seasonLkp.value = sortedSeasons.map(x => {
            return {
                id: x.id,
                name: `${x.name} ${x.is_active ? '(current)' : ''}`,
                selected: x.is_active ? true : false
            }
        });
        const activeSeason = seasonLkp.value.find(x => x.selected);
        currentSeason.value = activeSeason;

        await loadLeaderboardData(activeSeason?.id);
    } catch(err) {
        console.error('Error fetching leaderboard data:', err);
        error.value = err.message || 'An error occurred while loading leaderboard data';
    } finally {
        loading.value = false;
    }
}

async function loadLeaderboardData(seasonId: string) {
    try {
        loading.value = true;

        const { data: leaderboardData, error: leaderboardError } = await seasonsService.getSeasonLeaderboard(seasonId)
        if (leaderboardError) throw new Error('Failed to load leaderboard');
        leaderboard.value = leaderboardData || [];
    
        if (leaderboard.value.length > 0) {
            leaderboardLastUpdated.value = new Date(leaderboard.value[0].leaderboard_last_updated);
        }
        
        // Fetch gameweeks
        const { data: gameweeksData, error: gameweeksError } = await seasonsService.getSeasonGameweeks(seasonId);
        if (gameweeksError) throw new Error('Failed to load gameweeks');

        if (gameweeksData.length > 0) {
            gameweekLkp.value = gameweeksData.map(x => {
                return {
                    id: x.id,
                    name: `Gameeek ${x.week_number} ${x.is_active ? '(current)' : ''}`,
                    selected: x.is_active ? true : false
                }
            });
            const activeGameweek = gameweekLkp.value.find(x => x.selected);
            await setCurrentGameweek(activeGameweek ?? gameweekLkp.value[gameweekLkp.value.length - 1]);
        }
        
        // Fetch leaderboard history
        const { data: historyData, error: scoresError } = await seasonsService.getSeasonLeaderboardHistory(seasonId);
        if (scoresError) throw new Error('Failed to load leaderboard history');
        leaderboardHistory.value = (historyData || []);

        if (historyData.length > 0) {
            userLeaderboardHistory.value = historyData.filter(x => x.user_id === userStore.user?.id);
            userLeaderboardHistory.value.sort((a, b) => b.gameweek - a.gameweek);
            mapHistoryCharts(historyData);
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function setCurrentGameweek(gameweek: LookupOption) {
    currentGameweek.value = gameweek;

    const { data: scoresData, error: scoresError } = await leaderboardStore.fetchGameweekScores(groupId.value, gameweek.id);
    if (scoresError) throw new Error('Failed to load gameweek leaderboard');
    scores.value = scoresData || [];
    
    if (scores.value.length > 0) {
        scoresLastUpdated.value = leaderboard.value[0].updated_at ? new Date(leaderboard.value[0].updated_at) : null;
    }
}

async function setCurrentSeason(season: LookupOption) {
    currentSeason.value = season;
    loadLeaderboardData(season.id);
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