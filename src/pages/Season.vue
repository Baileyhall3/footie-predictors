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
                                Go to group
                            </router-link>
                            <router-link :to="`/gameweek/${activeGameweek?.id}`" class="text-blue-600 dropdown-item" v-if="activeGameweek">
                                Gameweek {{ activeGameweek?.week_number }}
                            </router-link>
                            <template v-if="isAdmin">
                                <button class="dropdown-item" v-if="!season?.end_date">
                                    Set end date
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
            <Tabs>
                <Tab header="Overview">
                    <template v-if="userGameweekPredictions && userGameweekPredictions.length > 0">
                        <ScoreCard2
                            :matches="userGameweekPredictions"
                            header="Your Predictions"
                            :totalPoints="totalPoints"
                            matchesClickable
                        >
                        </ScoreCard2>
                    </template>
                </Tab>
                <Tab header="Gameweeks">
                    <GroupGameweeks :gameweeks="gameweeks" :groupId="season?.group_id" :isAdmin="isAdmin && season?.is_active" />
                </Tab>
            </Tabs>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { seasonsService } from '../api/seasonsService';
import Tabs from "../components/UI/Tabs.vue";
import Tab from "../components/UI/Tab.vue";
import LoadingScreen from '../components/LoadingScreen.vue';
import DoesNotExist from "../components/DoesNotExist.vue";
import { Season, Gameweek, Prediction } from '../types';
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
        }


    } catch(err) {
        console.error(err);
        error.value = err.message || 'An error occurred while loading season data';
    } finally {
        loading.value = false;
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