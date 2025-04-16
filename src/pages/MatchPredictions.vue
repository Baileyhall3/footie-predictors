<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        <template v-else>
          <!-- <div class="mb-1 ms-1">
            <router-link :to="`/group/${groupId}`" class="text-blue-600 hover:underline font-medium">
              ← Back to group
            </router-link>
          </div> -->
          <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
              <ScoreCard 
                  :matches="match"
                  header="Match Predictions"
                  oneMatchPerRow
              />
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
                      <!-- <button type="button" @click="toggleCorrectResults()" class="ms-2">
                        <EyeIconSolid class="size-6" v-if="correctResultsOnly" />
                        <EyeIcon class="size-6" v-else />
                      </button> -->
                    </div>
                  </template>
                  <p v-if="mostCommonPrediction" class="text-md mt-4 font-medium">
                  💡 <span class="font-bold">{{ mostCommonPrediction }}</span> {{ matchIsFinished ? ' was ' : ' is ' }} the most popular prediction.
                  </p>
              </div>
          </div>

          <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div class="flex flex-wrap gap-4">
              <div class="justify-start flex">
                <SearchBar searchBasis="user predictions" @search-entered="handleSearchQuery" />
              </div>
              <p class="mt-2" v-if="searchString">
                Showing predictions for "<span class="font-semibold">{{ searchString }}</span>"
              </p>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="userPred in predictions" :key="userPred.id">
                  <div class="bg-white shadow-lg rounded-xl p-6 mb-4">
                      <h3 class="text-xl font-semibold justify-center">
                        {{ userPred.username }}
                        <span v-if="userPred.username === userStore.userProfile?.username" class="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
                      </h3>
                      <ScoreCard 
                          :matches="match"
                          :predictions="userPred.predictions"
                          locked
                          oneMatchPerRow
                          disableTimeHeader
                          disableMatchTime
                      />
                  </div>
              </div>
          </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import ScoreCard from '../components/ScoreCard.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsStore } from '../store/predictionsStore';
import { userStore } from '../store/userStore';
import LoadingScreen from '../components/LoadingScreen.vue';
import SearchBar from '../components/UI/SearchBar.vue';
import { EyeIcon } from "@heroicons/vue/24/outline";
import { EyeIcon as EyeIconSolid } from "@heroicons/vue/24/solid";

const route = useRoute();

const loading = ref(true);
const matchId = ref(null);
const gameweekId = ref(null);
const matches = ref([]);
const predictions = ref({});
const match = ref([]);
const error = ref(null);
const groupMembersLength = ref(0);
const matchIsFinished = ref(false);
const searchString = ref('');
const correctScoresOnly = ref(false);
const correctResultsOnly = ref(false);
// const groupId = ref(null);

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
    match.value = matchData;
    gameweekId.value = matchData[0].gameweek_id;
    
    matchIsFinished.value = matchData[0].final_home_score !== null && matchData[0].final_away_score !== null ? true : false;
    
    matches.value = matchData.map(p => ({
        id: p.match_id,
        final_home_score: p.final_home_score,
        final_away_score: p.final_away_score,
        home_team_crest: p.home_team_crest,
        away_team_crest: p.away_team_crest,
        api_match_id: p.api_match_id
    }));
    
    await fetchUserPredictions();

  } catch (err) {
    console.error('Error fetching match data:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchUserPredictions(searchQuery = null, skipCalculations = false) {
  try {
    const { data: predictionsData, error: predictionsError } = await predictionsStore.fetchMatchPredictions(matchId.value);
    if (predictionsError) throw new Error('Failed to load match predictions');

    if (!skipCalculations) {
      calculatePredictionsStats(predictionsData);
    }

    let actualMatchScore = { homeScore: null, awayScore: null }
    if (matchIsFinished) {
      actualMatchScore.homeScore = predictionsData[0].final_home_score;
      actualMatchScore.awayScore = predictionsData[0].final_away_score;
    }
  
    groupMembersLength.value = predictionsData?.length;
  
    const groupedByUser = {};
    predictionsData.forEach(pred => {
      if (!groupedByUser[pred.user_id]) {
        groupedByUser[pred.user_id] = {
          id: pred.user_id,
          username: pred.username,
          predictions: {}
        };
      }
      groupedByUser[pred.user_id].predictions[pred.match_id] = {
        predicted_home_score: pred.predicted_home_score,
        predicted_away_score: pred.predicted_away_score
      };
    });
  
    const groupedPredictions = Object.values(groupedByUser);
    if (searchQuery) {
      predictions.value = groupedPredictions.filter(x => x.username.toLowerCase().includes(searchQuery));
    } 
    if (correctScoresOnly.value) {
      predictions.value = groupedPredictions.filter(x => 
        x.predictions[matchId.value].predicted_home_score === actualMatchScore.homeScore && 
        x.predictions[matchId.value].predicted_away_score === actualMatchScore.awayScore
      );
    }
    if (correctResultsOnly.value) {

    }
    if (!searchQuery && !correctScoresOnly.value) {
      predictions.value = groupedPredictions;
    }
  } catch(err) {
    console.error('Error fetching prediction data:', err);
  }
}

function calculatePredictionsStats(predictions: any[]) {
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
</script>