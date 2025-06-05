<template>
    <LoadingScreen v-if="loading" />
    <div class="container mx-auto py-8" v-else>
        <DoesNotExist v-if="!seasonExists" entity="season" />
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p class="font-medium">Error loading season data</p>
            <p class="text-sm">{{ error }}</p>
            <button @click="fetchAllData" class="mt-2 text-sm text-red-700 underline">Try again</button>
        </div>
        <template v-else>
            <PageHeader>
                <template #header>
                    <h2 class="text-2xl font-semibold">{{ season?.name }}</h2>
                    <div class="flex items-center gap-2">
                        <div v-if="season?.is_active" class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full transition">
                            Active
                        </div>
                    </div>
                </template>

                <template #actionItems>
                    <button @click="copySeasonLink()" class="p-1 rounded-md hover:bg-gray-200" title="Copy season link">
                        <LinkIcon class="size-6 text-blue-500" />
                    </button>
                    <Dropdown>
                        <template #trigger>
                            <EllipsisVerticalIcon class="size-6 text-gray-500" />
                        </template>
                        <template #items>
                            <router-link :to="`/group/${season?.group_id}`" class="text-blue-600 dropdown-item">
                                Go to Group
                            </router-link>
                            <router-link :to="`/gameweek/${activeGameweek?.id}`" class="text-blue-600 dropdown-item" v-if="activeGameweek">
                                Gameweek {{ activeGameweek?.week_number }}
                            </router-link>
                            <router-link :to="`/group/${season?.group_id}/create-gameweek`" v-if="isAdmin && !season?.is_finished">
                                <button class="dropdown-item">
                                    Create Gameweek
                                </button>
                            </router-link>
                            <template v-if="isAdmin && !season?.end_date">
                                <button class="dropdown-item" @click="endSeason">
                                    End Season
                                </button>
                            </template>
                        </template>
                    </Dropdown>
                </template>

                <template #details>
                    <div class="gap-8 flex">
                        <div class="flex flex-col">
                            <span class="opacity-75">Start&nbsp;Date</span>
                            <span class="font-medium">
                            {{ season?.start_date ? DateUtils.toShortDate(season.start_date) : 'TBD' }}
                            </span>
                        </div>
        
                        <div class="flex flex-col">
                            <span class="opacity-75">End&nbsp;Date</span>
                            <span class="font-medium">
                            {{ season?.end_date ? DateUtils.toShortDate(season.end_date) : '—' }}
                            </span>
                        </div>
                    </div>
                </template>
            </PageHeader>

            <!-- 🛠️ -->
            <RoundedContainer v-if="!season?.start_date" class="mx-auto text-center">
                <h1 class="text-7xl font-semibold mb-2">🛠️</h1>
                <h2 class="text-xl font-semibold mb-2">Season does not have a start date yet</h2>
                <template v-if="isAdmin">
                    <p class="text-gray-600 mb-6">Set up the season's first gameweek now to begin predicting!</p>
                    <router-link :to="`/group/${season?.group_id}/create-gameweek`">
                        <button class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition">
                            Create Gameweek
                        </button>
                    </router-link>
                </template>
                <p v-else class="text-gray-600 mb-6">Group owner must set a season start date before predictions can be made.</p>
            </RoundedContainer>
            <Tabs v-model="activeTabIndex" v-else>
                <Tab header="Overview">
                    <template v-if="season?.is_finished && leaderboard && leaderboard.length > 0">
                        <GameweekWinnerCard 
                            :username="leaderboard[0].username"
                            :totalPoints="leaderboard[0].total_points"
                            :isCurrentUser="leaderboard[0].user_id === userStore.user?.id"
                            :seasonName="season.name"
                        />
                    </template>
                    <RoundedContainer headerText="End of Season" v-if="season?.is_finished && leaderboard && leaderboard.length > 0">
                        After {{ gameweeks.length }} gameweeks of trials and tribulations, our season has come to an end.
                        <br /><br />
                        👑 <strong>{{ leaderboard[0].username }}</strong> emerges as this season’s champion, racking up 
                        <strong>{{ leaderboard[0].total_points }}</strong> points and claiming victory in 
                        <strong>{{ leaderboard[0].gameweek_wins || 0 }}</strong> gameweeks!
                        <br /><br />
                        <template v-if="leaderboard[1]">
                            🥈 The runner-up, <strong>{{ leaderboard[1].username }}</strong>, fought valiantly, finishing just 
                            <strong>{{ leaderboard[0].total_points - leaderboard[1].total_points }}</strong> points behind.
                            <br /><br />
                        </template>
                        📈 To view your own stats and the end of season awards, go to the 
                        <span class="text-blue-600 hover:underline hover:cursor-pointer" @click="activeTabIndex = 3">Stats tab</span>.
                        <br /><br />
                        Thank you all for playing, predicting, and participating. Until next time — rest up, strategize, and get ready for the next season!
                    </RoundedContainer>

                    <template v-if="userGameweekPredictions && userGameweekPredictions.length > 0">
                        <ScoreCard2
                            :matches="userGameweekPredictions"
                            header="Your Predictions"
                            :totalPoints="totalPoints"
                            matchesClickable
                        >
                            <template #headerActionItems>
                                <router-link 
                                    :to="`/gameweek/${activeGameweek?.id}`" 
                                    class="text-sm text-blue-600 hover:underline"
                                >
                                    Gameweek {{ activeGameweek?.week_number }}
                                </router-link>
                            </template>
                        </ScoreCard2>
                    </template>
                    <template v-else>
                        <RoundedContainer>
                            <p class="text-gray-500 py-2">No predictions made for the current gameweek yet.</p>
                        </RoundedContainer>
                    </template>
                </Tab>
                <Tab header="Gameweeks">
                    <GroupGameweeks 
                        :gameweeks="gameweeks" 
                        :groupId="season?.group_id" 
                        :isAdmin="isAdmin && season?.is_active" 
                        :hideCreateGameweeks="season?.is_finished"
                    />
                </Tab>
                <Tab header="Leaderboard">
                    <GroupLeaderboard 
                        :groupId="season?.group_id" 
                        :activeGameweekId="activeGameweek ? activeGameweek.id : null" 
                        :seasonId="season?.id" 
                        :winnerId="season?.winner_id"
                    />
                </Tab>
                <Tab header="Stats">
                    <CombinedGroupStats :groupId="season?.group_id" :seasonId="season?.id" />
                </Tab>
            </Tabs>
        </template>
    </div>

    <DeleteConfirm ref="endSeasonConfirm" title="Please Confirm" message="Are you sure you want to end this season? This cannot be undone." confirmText="End Season" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { seasonsService } from '../api/seasonsService';
import Tabs from "../components/UI/Tabs.vue";
import Tab from "../components/UI/Tab.vue";
import LoadingScreen from '../components/LoadingScreen.vue';
import DoesNotExist from "../components/DoesNotExist.vue";
import { Season, Gameweek, Prediction, LeaderboardEntry, UserStats } from '../types';
import PageHeader from '../components/PageHeader.vue';
import GroupGameweeks from '../components/GroupGameweeks.vue';
import DateUtils from '../utils/dateUtils';
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import Dropdown from "../components/UI/Dropdown.vue";
import { EllipsisVerticalIcon, LinkIcon } from '@heroicons/vue/24/solid';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ScoreCard2 from '../components/ScoreCard2.vue';
import { predictionsService } from '../api/predictionsService';
import { userStore } from "../store/userStore";
import CombinedGroupStats from './CombinedGroupStats.vue';
import StatRow from '../components/StatRow.vue';
import GroupLeaderboard from './GroupLeaderboard.vue';
import DeleteConfirm from '../components/DeleteConfirm.vue';
import GameweekWinnerCard from '../components/GameweekWinnerCard.vue';

const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(false);
const seasonExists = ref<boolean>(true);
const seasonId = ref<string | null>();
const season = ref<Season>();
const gameweeks = ref<Array<Gameweek>>([]);
const activeGameweek = ref<Gameweek>();
const isAdmin = ref<boolean>(false);
const error = ref<string | null>(null);
const userGameweekPredictions = ref<Array<Prediction>>();
const totalPoints = ref<number>(0);
const leaderboard = ref<LeaderboardEntry>();
const seasonStats = ref<Array<UserStats>>();
const activeTabIndex = ref<number>(0);
const endSeasonConfirm = ref();

onMounted(() => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;

        seasonId.value = route.params.id || route.query.id;
        
        if (!seasonId.value) {
            throw new Error('Season ID is missing');
        }

        const { data: seasonData, error: seasonError } = await seasonsService.getSeasonByIdUsingView(seasonId.value)

        if (seasonError) {
            if (seasonError.code === "PGRST116") {
                seasonExists.value = false;
                loading.value = false;
                // throw new Error('Failed to load season details');
            } else {
                error.value = seasonError;
            }
        }
        season.value = seasonData;

        isAdmin.value = season.value?.admin_id === userStore.user?.id;

        const { data: gameweeksData, error: gameweeksError } = await seasonsService.getSeasonGameweeks(seasonId.value)
        if (gameweeksError) throw new Error('Failed to load gameweeks');
        gameweeks.value = gameweeksData ? gameweeksData.sort((a, b) => b.week_number - a.week_number) : []

        if (gameweeks.value.length > 0) {
            activeGameweek.value = gameweeksData.find(x => x.is_active);
            
            if (activeGameweek.value) {
                const { 
                    data: predictionsData, 
                    error: predictionsError 
                } = await predictionsService.getUserGameweekPredictionsUsingView(userStore.user?.id, activeGameweek.value.id)
                
                if (predictionsError) {
                    throw new Error(`Predictions error: ${predictionsError}`)
                }
        
                if (predictionsData) {
                    userGameweekPredictions.value = predictionsData.predictions;
                    totalPoints.value = predictionsData.totalPoints;
                }
            }

            const { data: leaderboardData, error: leaderboardError } = await seasonsService.getSeasonLeaderboard(seasonId.value);
            if (leaderboardError) {
                throw new Error('Error fetching season leaderboard');
            }

            if (leaderboardData) {
                leaderboard.value = leaderboardData;
            }

            const { data: seasonStatsData, error: seasonStatsError } = await seasonsService.getSeasonStats(seasonId.value);
            if (seasonStatsError) {
                throw new Error('Error fetching season stats');
            }

            if (seasonStatsData) {
                seasonStats.value = seasonStatsData;
            }
        }
    } catch(err) {
        console.error(err);
        error.value = err.message || 'An error occurred while loading season data';
    } finally {
        loading.value = false;
    }
}

async function endSeason() {
    const confirmed = await endSeasonConfirm.value?.show();
    if (confirmed) {
        try {
            await seasonsService.updateSeason(seasonId.value, { 
                is_finished: true, 
                end_date: new Date(), 
                winner_id: leaderboard.value ? leaderboard.value[0].user_id : null 
            });

            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    }
}

function copySeasonLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast("Season link copied!", {
        "type": "info",
        "position": "top-center"
    });
}
</script>