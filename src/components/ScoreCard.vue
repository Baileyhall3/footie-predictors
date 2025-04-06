<template>
    <div class="items-center flex mb-4" v-if="props.header">
        <h3 class="text-xl font-semibold">{{ props.header }}</h3>
        <LockClosedIcon class="size-5 ms-2" v-if="props.locked && props.showLockedIcon" />
        <button type="button" @click="toggleMatchesCollapse" v-if="props.allowCollapse">
            <ChevronDownIcon v-if="!matchesCollapsed" class="size-5 ms-2 transition-transform duration-300"  />
            <ChevronUpIcon v-else class="size-5 ms-2 transition-transform duration-300" />
        </button>
    </div>
    <TransitionGroup name="scores" tag="div">
        <template v-if="(!matchesCollapsed && props.allowCollapse) || !props.allowCollapse">
            <div v-for="(matchGroup, day) in groupedMatches" :key="day" :class="'mt-' + props.topMargin">
                <h3 class="text-lg mb-2">{{ day }}</h3>
        
                <div :class="{ 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : !props.oneMatchPerRow }">
                    <div v-for="match in matchGroup" :key="match.id" class="flex flex-col items-center justify-center py-2 bg-gray-100 mt-2 rounded-md">
                        <div class="flex items-center justify-center w-full max-w-lg">
                            <!-- Home Team and Score -->
                            <div class="flex items-center space-x-2 justify-end" style="width: 100%;">
                                <span class="font-medium text-sm">
                                    {{ match.home_team }}
                                    <img :src="match.home_team_crest ?? '/images/default_club_badge.png'" alt="Home Team" class="w-6 h-6 inline-block ms-2">
                                </span>
                                
                                <template v-if="predictions && Object.keys(predictions).length > 0">
                                    <span 
                                        class="text-md font-bold" 
                                        :class="getPredictionColor(predictions[match.id], match)">
                                        {{ predictions[match.id]?.predicted_home_score ? predictions[match.id]?.predicted_home_score : 0 }}
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
                                    <span class="text-md font-bold" 
                                        :class="getPredictionColor(predictions[match.id], match)">
                                        {{ predictions[match.id]?.predicted_away_score ? predictions[match.id]?.predicted_away_score : 0 }}
                                    </span>
                                </template>
        
                                <template v-else>
                                    <span class="text-md font-bold">
                                        {{ match.final_away_score === null && !match.api_match_id && props.isAdmin ? 0 : match.final_away_score }}
                                    </span>
                                </template>
        
                                <span class="font-medium text-sm">
                                    <img :src="match.away_team_crest ?? '/images/default_club_badge.png'" alt="Away Team" class="w-6 h-6 inline-block mr-2">
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
            </div>
        
            <h3 class="text-lg mt-2" v-if="props.totalPoints"><span class="font-medium">Total Points:</span> {{ props.totalPoints }}</h3>
        
            <template v-if="props.includeSubmitBtn && !props.locked && props.predictions && Object.keys(props.predictions).length > 0">
                <button v-if="allPredictionsSubmitted && !predictionsChanged" class="w-full bg-white ring-2 ring-green-400 py-2 rounded-md mt-5 flex items-center justify-center" disabled>
                    Predictions Saved ✅
                </button>
                <button v-else @click="submitPredictions" class="w-full bg-green-600 text-white py-2 rounded-md mt-5 disabled:opacity-50" :disabled="isSubmitting">
                    Submit Predictions
                </button>
            </template>
        </template>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";

export interface IProps {
    matches: [];
    predictions?: object;
    locked?: boolean;
    isAdmin?: boolean;
    canRemove?: boolean;
    totalPoints?: number
    topMargin?: number;
    includeSubmitBtn?: boolean;
    header?: string;
    allowCollapse?: boolean;
    showLockedIcon?: boolean;
    oneMatchPerRow?: boolean;
}

const props = withDefaults(defineProps<IProps>(), { 
    locked: false, 
    isAdmin: false,
    canRemove: false,
    topMargin: 6,
    includeSubmitBtn: true,
});
const emit = defineEmits(["update-prediction", "update-score", "match-removed", "predictions-submitted"]);

const groupedMatches = computed(() => {
    return props.matches.reduce((acc, match) => {
        const matchDay = DateUtils.toShortDayMonth(match.match_time, true);
        if (!acc[matchDay]) acc[matchDay] = [];
        acc[matchDay].push(match);
        return acc;
    }, {});
});

const allPredictionsSubmitted = computed(() => {
    return props.matches.length > 0 && props.matches.every(match => {
        const prediction = props.predictions[match.id];
        return prediction?.predicted_home_score !== '' && prediction?.predicted_away_score !== '';
    });
});

const predictionsChanged = ref(false);
const matchesCollapsed = ref(false);
const isSubmitting = ref(false);

const toggleMatchesCollapse = () => {
  matchesCollapsed.value = !matchesCollapsed.value;
}

// Emit event when prediction changes (User Mode)
const updatePrediction = (match: any, field: string, increment: number) => {
    const currentScore = Number(match[field]) || 0; // Ensure it's a number
    const newScore = Math.max(0, currentScore + increment); // Prevent negative values
    match[field] = newScore;
    predictionsChanged.value = true;
    emit("update-prediction", { matchId: match.id, field, value: newScore });
};

// Emit event when final score changes (Admin Mode)
const updateScore = (match: any, field: string, increment: number) => {
    const currentScore = Number(match[field]) || 0; // Ensure it's a number
    const newScore = Math.max(0, currentScore + increment); // Prevent negative values
    match[field] = newScore;
    emit("update-score", { matchId: match.id, field, value: newScore });
};

const submitPredictions = () => {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    predictionsChanged.value = false;
    emit("predictions-submitted");

    setTimeout(() => {
        isSubmitting.value = false;
    }, 1500);
}

// Emit event when final score changes (Admin Mode)
const removeMatch = (matchId: string) => {
    emit("match-removed", matchId);
};

// Function to determine color based on prediction accuracy
const getPredictionColor = (prediction, match) => {
    if (!prediction || match.final_home_score === null || match.final_away_score === null) {
        return "test-gray-600"; // No color if match is not finished
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

<style scoped>

.scores-enter-active,
.scores-leave-active {
  transition: all 0.2s ease;
}
.scores-enter-from,
.scores-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

</style>