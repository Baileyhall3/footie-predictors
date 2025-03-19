<template>
    <div v-for="(matchGroup, day) in groupedMatches" :key="day" :class="'mt-' + props.topMargin">
        <h3 class="text-lg mb-2">{{ day }}</h3>

        <div v-for="match in matchGroup" :key="match.id" class="flex flex-col items-center justify-center py-2 bg-gray-100 mt-2 rounded-md">
            <div class="flex items-center justify-center w-full max-w-lg">
                <!-- Home Team and Score -->
                <div class="flex items-center space-x-2 justify-end" style="width: 100%;">
                    <span class="font-medium text-sm">
                        {{ match.home_team }}
                        <img v-if="match.home_team_crest" :src="match.home_team_crest" alt="Home Team" class="w-6 h-6 inline-block ms-2">
                    </span>
                    
                    <template v-if="predictions && Object.keys(predictions).length > 0">
                        <span 
                            class="text-md font-bold" 
                            :class="getPredictionColor(predictions[match.id], match)">
                            {{ predictions[match.id]?.predicted_home_score }}
                        </span>
                    </template>

                    <template v-else>
                        <span class="text-md font-bold">
                            {{ match.final_home_score === null && !match.api_match_id && props.isAdmin ? 0 : match.final_home_score }}
                        </span>
                    </template>
                </div>

                <div class="border-l border-gray-300 h-5 mx-2"></div>

                <!-- Away Team and Score -->
                <div class="flex items-center space-x-2 justify-start" style="width: 100%;">
                    <template v-if="predictions && Object.keys(predictions).length > 0">
                        <span 
                            class="text-md font-bold" 
                            :class="getPredictionColor(predictions[match.id], match)">
                            {{ predictions[match.id]?.predicted_away_score }}
                        </span>
                    </template>

                    <template v-else>
                        <span class="text-md font-bold">
                            {{ match.final_away_score === null && !match.api_match_id && props.isAdmin ? 0 : match.final_away_score }}
                        </span>
                    </template>

                    <span class="font-medium text-sm">
                        <img v-if="match.away_team_crest" :src="match.away_team_crest" alt="Away Team" class="w-6 h-6 inline-block mr-2">
                        {{ match.away_team }}
                    </span>
                </div>
            </div>
            
            <div class="text-gray-500 text-sm mt-1">
                {{ DateUtils.toTime(match.match_time) }}
            </div>
            
            <div class="justify-between flex gap-8 h-5" v-if="!props.locked && props.predictions && Object.keys(props.predictions).length > 0">
                <div class="flex rounded overflow-hidden items-center flex-start">
                    <button @click="updatePrediction(match, 'predicted_home_score', -1)" class="bg-gray-400 text-white px-2 py-0.5">-</button>
                    <button @click="updatePrediction(match, 'predicted_home_score', 1)" class="bg-blue-500 text-white px-2 py-0.5">+</button>
                </div>
                <div class="flex rounded overflow-hidden items-center">
                    <button @click="updatePrediction(match, 'predicted_away_score', -1)" class="bg-gray-400 text-white px-2 py-1">-</button>
                    <button @click="updatePrediction(match, 'predicted_away_score', 1)" class="bg-blue-500 text-white px-2 py-1">+</button>
                </div>
            </div>

            <div class="justify-between flex gap-8 h-5" v-if="props.isAdmin && !match.api_match_id">
                <div class="flex rounded overflow-hidden items-center flex-start">
                    <button @click="updateScore(match, 'final_home_score', -1)" class="bg-gray-400 text-white px-2 py-0.5">-</button>
                    <button @click="updateScore(match, 'final_home_score', 1)" class="bg-blue-500 text-white px-2 py-0.5">+</button>
                </div>
                <div class="flex rounded overflow-hidden items-center">
                    <button @click="updateScore(match, 'final_away_score', -1)" class="bg-gray-400 text-white px-2 py-1">-</button>
                    <button @click="updateScore(match, 'final_away_score', 1)" class="bg-blue-500 text-white px-2 py-1">+</button>
                </div>
            </div>

            <button v-if="props.canRemove && !props.locked" @click="removeMatch(match.id)" class="text-red-500">Remove</button>
        </div>
    </div>

    <h3 class="text-lg mt-2" v-if="props.totalPoints"><span class="font-medium">Total Points:</span> {{ props.totalPoints }}</h3>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DateUtils from '../utils/dateUtils';

export interface IProps {
    matches: [];
    predictions?: object;
    locked?: boolean;
    isAdmin?: boolean;
    canRemove?: boolean;
    totalPoints?: number
    topMargin?: number;
}

const props = withDefaults(defineProps<IProps>(), { 
    locked: false, 
    isAdmin: false,
    canRemove: false,
    topMargin: 6
});
const emit = defineEmits(["update-prediction", "update-score", "match-removed"]);

const groupedMatches = computed(() => {
    return props.matches.reduce((acc, match) => {
        const matchDay = DateUtils.toShortDayMonth(match.match_time);
        if (!acc[matchDay]) acc[matchDay] = [];
        acc[matchDay].push(match);
        return acc;
    }, {});
});

// Emit event when prediction changes (User Mode)
const updatePrediction = (match: any, field: string, increment: number) => {
    const currentScore = Number(match[field]) || 0; // Ensure it's a number
    const newScore = Math.max(0, currentScore + increment); // Prevent negative values
    match[field] = newScore;
    emit("update-prediction", { matchId: match.id, field, value: newScore });
};

// Emit event when final score changes (Admin Mode)
const updateScore = (match: any, field: string, increment: number) => {
    const currentScore = Number(match[field]) || 0; // Ensure it's a number
    const newScore = Math.max(0, currentScore + increment); // Prevent negative values
    match[field] = newScore;
    emit("update-score", { matchId: match.id, field, value: newScore });
};

// Emit event when final score changes (Admin Mode)
const removeMatch = (matchId: string) => {
    emit("match-removed", matchId);
};

// Function to determine color based on prediction accuracy
const getPredictionColor = (prediction, match) => {
    if (!prediction || match.final_home_score === null || match.final_away_score === null) {
        return ""; // No color if match is not finished
    }

    const predictedHome = prediction.predicted_home_score;
    const predictedAway = prediction.predicted_away_score;
    const actualHome = match.final_home_score;
    const actualAway = match.final_away_score;

    if (predictedHome === actualHome && predictedAway === actualAway) {
        return "text-green-500"; // Exact score
    }

    const predictedWinner = predictedHome > predictedAway ? "home" : predictedAway > predictedHome ? "away" : "draw";
    const actualWinner = actualHome > actualAway ? "home" : actualAway > actualHome ? "away" : "draw";

    if (predictedWinner === actualWinner) {
        return "text-amber-500"; // Correct result but wrong score
    }

    return "text-red-500"; // Incorrect result
};
</script>
