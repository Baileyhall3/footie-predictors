<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        <template v-else>
          <ScoreCard2 
              :matches="[match]"
              oneMatchPerRow
              notPrediction
              :topMargin="0"
              homeCrestField="home_team_crest"
              awayCrestField="away_team_crest"
          >
          <div class="mt-6 space-y-2 text-center text-gray-700">
              <template v-if="matchIsFinished">
                <div class="items-center flex justify-center">
                  <p class="text-md font-semibold text-green-600">
                    ✅ {{ correctScoreCount }} {{ correctScoreCount === 1 ? 'user' : 'users' }} got the exact score!
                  </p>
                  <button type="button" @click="toggleCorrectScores()" class="ms-2 text-green-600">
                    <EyeIconSolid class="size-6" v-if="correctScoresOnly" />
                    <EyeIcon class="size-6" v-else />
                  </button>
                </div>
                <div class="items-center flex justify-center">
                  <p class="text-md font-medium">
                  🎯 {{ ((correctResultCount / groupMembersLength) * 100).toFixed(0) }}% predicted the correct result.
                  </p>
                </div>
                <div class="items-center flex justify-center" v-if="userMatchPrediction">
                  <p class="text-md font-medium">
                    <span :class="getPredictionColor(userMatchPrediction)">
                    🔮 {{ userMatchPrediction?.predicted_home_score }}-{{ userMatchPrediction?.predicted_away_score }} was your prediction.
                    </span>
                  </p>
                </div>
              </template>
              <p v-if="mostCommonPrediction" class="text-md mt-4 font-medium">
              💡 <span class="font-bold">{{ mostCommonPrediction }}</span> {{ matchIsFinished ? ' was ' : ' is ' }} the most popular prediction.
              </p>
          </div>
        </ScoreCard2>

          <!-- <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex flex-wrap gap-4">
              <div class="justify-start flex">
                <SearchBar searchBasis="user predictions" @search-entered="handleSearchQuery" />
              </div>
              <p class="mt-2" v-if="searchString">
                Showing predictions for "<span class="font-semibold">{{ searchString }}</span>"
              </p>
            </div>
          </div> -->

          <DataGrid 
              ref="matchPredictionsGridRef"
              :data="gridPredictionsData" 
              hideVerticalLines 
              headerBgColor="rgb(243 244 246 / 1)"
              headerTextColor="black"
              :hideFilterRow="hideGridFilterRow"
              class="mb-8"
              disableActiveCell
          >
              <template #cardHeader>
                  <div class="items-center flex py-6 ms-2">
                      <h3 class="text-xl font-semibold">Predictions</h3>
                      <button type="button" @click="hideGridFilterRow = !hideGridFilterRow">
                          <FunnelIcon v-if="!hideGridFilterRow" class="size-5 ms-2" />
                          <FunnelIconOutline v-else class="size-5 ms-2"  />
                      </button>
                      <Lookup
                          class="ms-2" 
                          displayText="Showing: " 
                          :data="optionsLkp" 
                          :displayValue="currentOption?.name"
                          @item-selected="setCurrentOption" 
                      />
                      <!-- TODO: Add 'correct score' -->
                  </div>
              </template>
              <template #columns="{ row }">
                  <GridCol field="username" colName="Username" width="220px">
                      <template #display="{ row }">
                          <UsernameDisplay :user="row" :currentUserId="userStore.user?.id" />
                      </template>
                  </GridCol>
                  <GridCol field="predicted_home_score" colName="H" width="60px" colTitle="Predicted Home Score" type="number" alignContent="center">
                    <template #headercontent>
                      <div class="flex items-center gap-2 min-w-0">
                          <div class="truncate text-sm font-medium min-w-0">
                              H
                          </div>
                          <img
                              :src="match?.home_team_crest ?? '/images/default_club_badge.png'"
                              alt="Home Team"
                              class="w-6 h-6 flex-shrink-0"
                          />
                      </div>
                    </template>
                    <template #display="{ row }">
                      <div class="justify-end flex me-2"> <!-- TODO: Check why styling does not get applied-->
                        <span class="text-md font-bold" 
                            :class="getPredictionColor(row)">
                            {{ row.predicted_home_score }}
                        </span>
                      </div>
                    </template>
                  </GridCol>
                  <GridCol field="predicted_away_score" colName="A" width="60px" colTitle="Predicted Away Score" type="number" alignContent="center">
                    <template #headercontent>
                      <div class="flex items-center gap-2 min-w-0">
                        <img
                            :src="match?.away_team_crest ?? '/images/default_club_badge.png'"
                            alt="Home Team"
                            class="w-6 h-6 flex-shrink-0"
                        />
                        <div class="truncate text-sm font-medium min-w-0">
                            A
                        </div>
                      </div>
                    </template>
                    <template #display="{ row }">
                      <div class="justify-start flex ms-2">
                        <span class="text-md font-bold" 
                            :class="getPredictionColor(row)">
                            {{ row.predicted_away_score }}
                        </span>
                      </div>
                    </template>
                  </GridCol>
              </template>
          </DataGrid>
  
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoreCard2
                v-for="userPred in gridPredictionsData" :key="userPred.id"
                :matches="[userPred]"
                disableTimeHeader
                oneMatchPerRow
            >
              <template #header>
                <h3 class="text-xl font-semibold justify-center">
                  {{ userPred.username }}
                  <span v-if="userPred.username === userStore.userProfile?.username" class="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
                </h3>
              </template>
            </ScoreCard2>
          </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { userStore } from '../store/userStore';
import LoadingScreen from '../components/LoadingScreen.vue';
import SearchBar from '../components/UI/SearchBar.vue';
import { EyeIcon, FunnelIcon as FunnelIconOutline } from "@heroicons/vue/24/outline";
import { EyeIcon as EyeIconSolid, FunnelIcon } from "@heroicons/vue/24/solid";
import DataGrid from '../components/UI/grid/DataGrid.vue';
import GridCol from '../components/UI/grid/GridCol.vue';
import UsernameDisplay from '../components/UI/UsernameDisplay.vue';
import { predictionsService } from '../api/predictionsService';
import { Match, Prediction } from '../types';
import ScoreCard2 from '../components/ScoreCard2.vue';
import { getPredictionColor } from '../utils/sharedFunctions';
import Lookup from '../components/UI/Lookup.vue';
import type { LookupOption } from '../components/UI/Lookup.vue';
import CollapseButton from '../components/UI/CollapseButton.vue';

const route = useRoute();

const loading = ref<boolean>(true);
const matchId = ref<string>();
const gameweekId = ref<string>();
const match = ref<Match>();
const error = ref<string>();
const groupMembersLength = ref<number>(0);
const matchIsFinished = ref<boolean>(false);
const searchString = ref<string>('');
const correctScoresOnly = ref<boolean>(false);
const correctResultsOnly = ref<boolean>(false);
const gridPredictionsData = ref<Array<Prediction>>();
const originalPredictionsData = ref<Array<Prediction>>();
const hideGridFilterRow = ref<boolean>(true);
const currentOption = ref<LookupOption>();
const optionsLkp = ref<Array<LookupOption>>([
  { id: 0, name: "Home Win", selected: false },
  { id: 1, name: "Away Win", selected: false },
  { id: 2, name: "Draw", selected: false },
]);
const userMatchPrediction = ref<Prediction>();
const isCollapsed = ref<boolean>(false);

let correctScoreCount = 0;
let correctResultCount = 0;
let mostCommonPrediction = '';

onMounted(async () => {
    await fetchMatchData();
});

async function fetchMatchData() {
  try {
    loading.value = true;
    matchId.value = route.params.id || route.query.id;

    const { data: matchData, error } = await gameweeksService.getMatchById(matchId.value);
    if (error) throw new Error('Failed to load match');
    match.value = matchData[0];
    gameweekId.value = matchData[0].gameweek_id;
    
    matchIsFinished.value = matchData[0].final_home_score !== null && matchData[0].final_away_score !== null ? true : false;

    const { data: predictionsData, error: predictionsError } = await predictionsService.getMatchPredictionsUsingView(matchId.value);
    if (predictionsError) throw new Error('Failed to load match predictions');
    gridPredictionsData.value = predictionsData || [];
    originalPredictionsData.value = predictionsData || [];
    if (predictionsData.length > 0) {
      const userPredction = predictionsData.find(x => x.user_id === userStore.userProfile?.id);
      if (userPredction) {
        userMatchPrediction.value = userPredction;
      }
    }
    
    groupMembersLength.value = predictionsData?.length;
    
    await fetchUserPredictions(null, false, gridPredictionsData.value);

  } catch (err) {
    console.error('Error fetching match data:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchUserPredictions(
  searchQuery: string | null = null, 
  skipCalculations: boolean = false, 
  predictionsData?: Prediction[]
) {
  try {
    loading.value = true;

    predictionsData = predictionsData ?? originalPredictionsData.value;

    if (!skipCalculations) {
      calculatePredictionsStats(predictionsData);
    }
    
    if (searchQuery) {
      gridPredictionsData.value = predictionsData.filter(x => x.username.toLowerCase().includes(searchQuery));
    } 
    if (correctScoresOnly.value) {
      gridPredictionsData.value = predictionsData.filter(x => 
        x.predicted_home_score === match.value?.final_home_score && 
        x.predicted_away_score === match.value?.final_away_score
      );
    }
    if (correctResultsOnly.value) {

    }
    if (!searchQuery && !correctScoresOnly.value) {
      gridPredictionsData.value = predictionsData
    }
  } catch(err) {
    console.error('Error fetching prediction data:', err);
  } finally {
    loading.value = false;
  }
}

function calculatePredictionsStats(predictions: Prediction[]) {
    const freqMap = {};
    
    predictions.forEach(prediction => {
        const predictedHome = prediction.predicted_home_score;
        const predictedAway = prediction.predicted_away_score;
        const actualHome = prediction.final_home_score;
        const actualAway = prediction.final_away_score;

        // Exact score
        if (predictedHome === actualHome && predictedAway === actualAway) {
            correctScoreCount ++ 
        }

        const predictedWinner = predictedHome > predictedAway ? "home" : predictedAway > predictedHome ? "away" : "draw";
        const actualWinner = actualHome > actualAway ? "home" : actualAway > actualHome ? "away" : "draw";

        // Correct result
        if (predictedWinner === actualWinner) {
            correctResultCount ++
        }

        const key = `${prediction.predicted_home_score}-${prediction.predicted_away_score}`;
        freqMap[key] = (freqMap[key] || 0) + 1;
    });

    const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
    mostCommonPrediction = sorted.length > 0 ? sorted[0][0] : null;
}

function toggleCorrectScores() {
  correctScoresOnly.value = !correctScoresOnly.value;
  fetchUserPredictions(null, true);
}

function toggleCorrectResults() {
  correctResultsOnly.value = !correctResultsOnly.value;
  fetchUserPredictions(null, true);
}

async function handleSearchQuery(searchQuery: string) {
    searchString.value = searchQuery;
    fetchUserPredictions(searchQuery.toLowerCase(), true)
}

async function setCurrentOption(option: LookupOption) {
  currentOption.value = option;
  gridPredictionsData.value = originalPredictionsData.value;

  if (option) {
    switch (option.name) {
      case "Home Win" :
        gridPredictionsData.value = gridPredictionsData.value?.filter(x => x.predicted_home_score > x.predicted_away_score);
        break;
      case "Away Win" :
        gridPredictionsData.value = gridPredictionsData.value?.filter(x => x.predicted_home_score < x.predicted_away_score);
        break;
      case "Draw" :
        gridPredictionsData.value = gridPredictionsData.value?.filter(x => x.predicted_home_score === x.predicted_away_score);
        break;
    }
  }
}
</script>