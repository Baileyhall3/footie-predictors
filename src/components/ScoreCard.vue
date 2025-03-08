<template>
    <div v-for="(matchGroup, day) in groupedMatches" :key="day" class="mt-6">
        <h3 class="text-lg mb-2">{{ day }}</h3>

        <div v-for="match in matchGroup" :key="match.id" class="flex flex-col items-center justify-center py-2 bg-gray-100 mt-2 rounded-md">
            <div class="flex items-center justify-center w-full max-w-lg">
                <!-- Home Team and Score -->
                <div class="flex items-center space-x-2 w-1/3 justify-end">
                    <span class="font-medium">{{ match.home_team }}</span>
                    
                    <template v-if="isAdmin">
                        <!-- Admin Mode: Editing final scores -->
                        <input type="number" 
                            :value="match.final_home_score"
                            @input="updateScore(match.id, 'final_home_score', $event.target.value)"
                            class="w-10 border rounded-md p-1 text-center" min="0" />
                    </template>

                    <template v-else-if="predictions && Object.keys(predictions).length > 0">
                        <!-- User Mode: Editing Predictions -->
                        <input v-if="!locked" type="number" 
                            :value="predictions[match.id]?.predicted_home_score"
                            @input="updatePrediction(match.id, 'predicted_home_score', $event.target.value)"
                            class="w-10 border rounded-md p-1 text-center" min="0" />
                        <span v-else 
                            class="text-lg font-bold" 
                            :class="getPredictionColor(predictions[match.id], match)">
                            {{ predictions[match.id]?.predicted_home_score }}
                        </span>
                    </template>

                    <template v-else>
                        <span v-if="match.final_home_score !== null" class="text-lg font-bold">
                            {{ match.final_home_score }}
                        </span>
                    </template>
                </div>

                <div class="border-l border-gray-300 h-8 mx-4"></div>

                <!-- Away Team and Score -->
                <div class="flex items-center space-x-2 w-1/3 justify-start">
                    <template v-if="isAdmin">
                        <!-- Admin Mode: Editing final scores -->
                        <input type="number" 
                            :value="match.final_away_score"
                            @input="updateScore(match.id, 'final_away_score', $event.target.value)"
                            class="w-10 border rounded-md p-1 text-center" min="0" />
                    </template>

                    <template v-else-if="predictions && Object.keys(predictions).length > 0">
                        <!-- User Mode: Editing Predictions -->
                        <input v-if="!locked" type="number" 
                            :value="predictions[match.id]?.predicted_away_score"
                            @input="updatePrediction(match.id, 'predicted_away_score', $event.target.value)"
                            class="w-10 border rounded-md p-1 text-center" min="0" />
                        <span v-else 
                            class="text-lg font-bold" 
                            :class="getPredictionColor(predictions[match.id], match)">
                            {{ predictions[match.id]?.predicted_away_score }}
                        </span>
                    </template>

                    <template v-else>
                        <span v-if="match.final_away_score !== null" class="text-lg font-bold">
                            {{ match.final_away_score }}
                        </span>
                    </template>

                    <span class="font-medium">{{ match.away_team }}</span>
                </div>
            </div>

            <div class="text-gray-500 text-sm mt-1">
                {{ DateUtils.toTime(match.match_time) }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DateUtils from '../utils/dateUtils';

export interface IProps {
    matches: [];
    predictions?: object;
    locked: boolean;
    isAdmin?: boolean;
}

const props = withDefaults(defineProps<IProps>(), { 
    locked: false, 
    isAdmin: false 
});
const emit = defineEmits(["update-prediction", "update-score"]);

const groupedMatches = computed(() => {
    return props.matches.reduce((acc, match) => {
        const matchDay = DateUtils.toShortDayMonth(match.match_time);
        if (!acc[matchDay]) acc[matchDay] = [];
        acc[matchDay].push(match);
        return acc;
    }, {});
});

// Emit event when prediction changes (User Mode)
const updatePrediction = (matchId: string, field: string, value: string) => {
    emit("update-prediction", { matchId, field, value: parseInt(value) || 0 });
};

// Emit event when final score changes (Admin Mode)
const updateScore = (matchId: string, field: string, value: string) => {
    emit("update-score", { matchId, field, value: parseInt(value) || 0 });
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
