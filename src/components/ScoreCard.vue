<template>
    <div class="flex justify-between items-center mb-4" v-if="props.header">
        <div class="items-center flex">
            <h3 class="text-xl font-semibold">{{ props.header }}</h3>
            <LockClosedIcon class="size-5 ms-2" v-if="props.locked && props.showLockedIcon" />
            <button type="button" @click="toggleMatchesCollapse" v-if="props.allowCollapse">
                <ChevronDownIcon v-if="!matchesCollapsed" class="size-5 ms-2 transition-transform duration-300"  />
                <ChevronUpIcon v-else class="size-5 ms-2 transition-transform duration-300" />
            </button>
        </div>
        <slot name="headerActionItems"></slot>
        <router-link 
            :to="`/gameweek-predictions/${props.gameweekId}`" 
            v-if="props.locked && props.gameweekId && !slots.headerActionItems"
            class="text-sm text-blue-600 hover:underline"
          >
            View All →
        </router-link>
    </div>
    <TransitionGroup name="scores" tag="div">
        <template v-if="(!matchesCollapsed && props.allowCollapse) || !props.allowCollapse">
            <div v-for="(matchGroup, day) in groupedMatches" :key="day" :class="'mt-' + props.topMargin">
                <h3 class="text-lg mb-2" v-if="!props.disableTimeHeader">{{ day }}</h3>
        
                <div :class="{ 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : !props.oneMatchPerRow }">
                    <component
                        :is="props.matchesClickable ? 'router-link' : 'div'"
                        :to="props.matchesClickable ? `/match/${match.id}` : undefined"
                        :key="match.id"
                        class="flex flex-col items-center py-2 bg-gray-100 mt-2 rounded-md px-2"
                        v-for="match in matchGroup"
                    >
                        <div class="flex justify-center" style="width: 100%;">
                            <div class="flex items-center space-x-2 justify-end" style="width: 45%;">
                                <div class="flex items-center gap-2 min-w-0">
                                    <div class="truncate text-sm font-medium min-w-0">
                                        {{ match.home_team }}
                                    </div>
                                    <img
                                        :src="match.home_team_crest ?? '/images/default_club_badge.png'"
                                        alt="Home Team"
                                        class="w-6 h-6 flex-shrink-0"
                                    />
                                </div>

                                <template v-if="predictions && Object.keys(predictions).length > 0">
                                    <span 
                                        class="text-md font-bold" 
                                        :class="getPredictionColor(predictions[match.id], match)">
                                        {{ predictions[match.id]?.predicted_home_score !== undefined ? predictions[match.id]?.predicted_home_score : '-' }}
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
                            <div class="flex items-center space-x-2 justify-start" style="width: 45%;">
                                <template v-if="predictions && Object.keys(predictions).length > 0">
                                    <span class="text-md font-bold" 
                                        :class="getPredictionColor(predictions[match.id], match)">
                                        {{ predictions[match.id]?.predicted_away_score !== undefined ? predictions[match.id]?.predicted_away_score : '-' }}
                                    </span>
                                </template>
        
                                <template v-else>
                                    <span class="text-md font-bold">
                                        {{ match.final_away_score === null && !match.api_match_id && props.isAdmin ? 0 : match.final_away_score }}
                                    </span>
                                </template>

                                <div class="flex items-center gap-2 min-w-0">
                                    <img
                                        :src="match.away_team_crest ?? '/images/default_club_badge.png'"
                                        alt="Home Team"
                                        class="w-6 h-6 flex-shrink-0"
                                    />
                                    <div class="truncate text-sm font-medium min-w-0">
                                        {{ match.away_team }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 w-full items-center mt-1">
                            <div></div>

                            <div class="text-gray-500 text-sm text-center" v-if="!props.disableMatchTime">
                                {{ DateUtils.toTime(match.match_time) }}
                            </div>

                            <div class="text-right text-sm font-semibold" v-if="props.groupScoring" :class="getPredictionColor(predictions[match.id], match)">
                                {{ getMatchPoints(predictions[match.id], match) }}
                            </div>
                        </div>
                        
                        <div 
                            class="justify-between flex gap-8 h-5" 
                            v-if="!props.locked && props.predictions && Object.keys(props.predictions).length > 0 && !matchIsLocked(match.final_home_score, match.final_away_score)">
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
                    </component>
                </div>
            </div>
        
            <h3 class="text-lg mt-4" v-if="props.totalPoints !== null && props.totalPoints !== undefined">
                <span class="font-medium">Total Points:</span> {{ props.totalPoints }}
            </h3>
        
            <template v-if="props.includeSubmitBtn && !props.locked && props.predictions && Object.keys(props.predictions).length > 0">
                <button v-if="allPredictionsSubmitted && !predictionsChanged" class="w-full bg-white ring-2 ring-green-400 py-2 rounded-md mt-5 flex items-center justify-center" disabled>
                    Predictions Saved ✅
                </button>
                <button v-else @click="submitPredictions" class="w-full bg-green-600 text-white py-2 rounded-md mt-5 disabled:opacity-50" 
                    :disabled="isSubmitting || (allPredictionsSubmitted && !predictionsChanged)">
                    Submit Predictions
                </button>
            </template>
        </template>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { GroupScoring } from '../types';

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
    gameweekId?: string
    matchesClickable?: boolean
    disableTimeHeader?: boolean
    disableMatchTime?: boolean
    groupScoring?: GroupScoring
}

const props = withDefaults(defineProps<IProps>(), { 
    locked: false, 
    isAdmin: false,
    canRemove: false,
    topMargin: 6,
    includeSubmitBtn: true,
});
const emit = defineEmits(["update-prediction", "update-score", "match-removed", "predictions-submitted"]);
const slots = useSlots();

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

function matchIsLocked(
    finalHomeScore: number | null | undefined,
    finalAwayScore: number | null | undefined
): boolean {
    // A match is locked once both final scores are recorded
    return finalHomeScore != null && finalAwayScore != null;
}

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
    if (prediction.predicted_home_score === undefined || 
        prediction.predicted_away_score === undefined || 
        match.final_home_score === null || 
        match.final_away_score === null
    ) {
        return "text-gray-600"; // No color if match is not finished
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

function getMatchPoints(prediction, match) {
    if (!props.groupScoring) { return }

    if (prediction.predicted_home_score === undefined || 
        prediction.predicted_away_score === undefined || 
        match.final_home_score === null || 
        match.final_away_score === null
    ) {
        return;
    }

    const predictedHome = prediction.predicted_home_score;
    const predictedAway = prediction.predicted_away_score;
    const actualHome = match.final_home_score;
    const actualAway = match.final_away_score;

    if (predictedHome === actualHome && predictedAway === actualAway) {
        return `+${props.groupScoring.exact_score_points}`;
    }

    const predictedWinner = predictedHome > predictedAway ? "home" : predictedAway > predictedHome ? "away" : "draw";
    const actualWinner = actualHome > actualAway ? "home" : actualAway > actualHome ? "away" : "draw";

    if (predictedWinner === actualWinner) {
        return `+${props.groupScoring.correct_result_points}`;
    }

    return props.groupScoring.incorrect_points ? `-${props.groupScoring.incorrect_points}` : null;
}
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