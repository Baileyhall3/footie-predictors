<template>
    <div class="container mx-auto py-8">
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <ScoreCard 
                :matches="match"
                header="Match Predictions"
                oneMatchPerRow
            />
            <div class="mt-6 space-y-2 text-center text-gray-700">
                <p class="text-md font-semibold text-green-600">
                ✅ {{ correctScoreCount }} {{ correctScoreCount === 1 ? 'user' : 'users' }} got the exact score!
                </p>
                <p class="text-md font-medium">
                🎯 {{ ((correctResultCount / groupMembersLength) * 100).toFixed(0) }}% predicted the correct result.
                </p>

                <p v-if="mostCommonPrediction" class="text-md mt-4 text-blue-600 font-medium">
                💡 <span class="font-bold">{{ mostCommonPrediction }}</span> was the most popular prediction.
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="userPred in predictions" :key="userPred.id">
                <div class="bg-white shadow-lg rounded-xl p-6 mb-4">
                    <ScoreCard 
                        :matches="match"
                        :predictions="userPred.predictions"
                        locked
                        oneMatchPerRow
                        :header="userPred.username === userStore.userProfile?.username ? 'You' : userPred.username"
                        disableTimeHeader
                        disableMatchTime
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ScoreCard from '../components/ScoreCard.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { predictionsStore } from '../store/predictionsStore';
import { userStore } from '../store/userStore';

const route = useRoute();

const loading = ref(true);
const matchId = ref(null);
const gameweekId = ref(null);
const matches = ref([]);
const predictions = ref({});
const match = ref([]);
const error = ref(null);
const groupMembersLength = ref(0);

let correctScoreCount = 0;
let correctResultCount = 0;
let mostCommonPrediction = '';

onMounted(async () => {
    await fetchMatchPredictions();
});

async function fetchMatchPredictions() {
  try {
    loading.value = true;
    matchId.value = route.params.id || route.query.id;

    const { data: matchData, error } = await gameweeksService.getMatchById(matchId.value);
    if (error) throw new Error('Failed to load match');
    match.value = matchData;
    gameweekId.value = matchData.gameweek_id;

    const { data: predictionsData, error: predictionsError } = await predictionsStore.fetchMatchPredictions(matchId.value);
    if (predictionsError) throw new Error('Failed to load match predictions');

    groupMembersLength.value = predictionsData?.length;

    matches.value = matchData.map(p => ({
        id: p.match_id,
        final_home_score: p.final_home_score,
        final_away_score: p.final_away_score,
        home_team_crest: p.home_team_crest,
        away_team_crest: p.away_team_crest,
        api_match_id: p.api_match_id
    }));

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

    predictions.value = Object.values(groupedByUser);

    calculatePredictionsStats(predictionsData);

  } catch (err) {
    console.error('Error fetching match data:', err);
  } finally {
    loading.value = false;
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

</script>