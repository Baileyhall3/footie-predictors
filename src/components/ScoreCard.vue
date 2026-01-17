<template>
    <div class="flex justify-between items-center" v-if="props.header || $slots.header" :class="{ 'mb-4' : !matchesCollapsed }">
        <div class="items-center flex">
            <slot name="header"></slot>
            <h3 class="text-xl font-semibold" v-if="!$slots.header">{{ props.header }}</h3>
            <LockClosedIcon class="size-5 ms-2" v-if="props.locked && props.showLockedIcon" title="Gameweek is locked" />
            <button
                v-if="props.showActualAndPredictedScores && hasPredictions && props.locked"
                @click="toggleShowPredictions"
                :title="showPredictions ? 'Show match times' : 'Show predictions'"
                class="ms-2 text-muted hover:text-primary transition"
            >
                <Transition name="icon-fade" mode="out-in">
                    <ClockIcon v-if="showPredictions" key="target" class="size-5" />
                    <TargetIcon v-else class="size-5" />
                </Transition>
            </button>
            <button type="button" @click="toggleMatchesCollapse" v-if="props.allowCollapse">
                <ChevronDownIcon v-if="!matchesCollapsed" class="size-5 ms-2 transition-transform duration-300"  />
                <ChevronUpIcon v-else class="size-5 ms-2 transition-transform duration-300" />
            </button>
        </div>

        <h3 class="text-lg" v-if="props.totalPoints !== null && props.totalPoints !== undefined && props.locked">
            <!-- <span class="font-medium">Total Points: </span> -->
            <span class="font-semibold text-green-500">{{ props.totalPoints }}pts</span>
        </h3>
    </div>
    <TransitionGroup name="scores" tag="div">
        <template v-if="(!matchesCollapsed && props.allowCollapse) || !props.allowCollapse">
            <div v-for="(group, day) in groupedMatches" :key="day" :class="'mt-' + props.topMargin">
                <div class="flex justify-between">
                    <h3 class="text-lg" v-if="!props.disableTimeHeader">
                        {{ day }} 
                    </h3>
                    <span :class="getPointsColor(group.totalPoints)" class="font-semibold" v-if="group.totalPoints">
                        +{{ group.totalPoints }}pts
                    </span>
                </div>
        
                <div :class="{ 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : !props.oneMatchPerRow }">
                    <component
                        :is="props.matchesClickable ? 'router-link' : 'div'"
                        :to="props.matchesClickable ? `/match/${match.id}` : undefined"
                        :key="match.id"
                        class="flex flex-col items-center py-2 bg-gray-100 border border-gray-150 mt-2 rounded-md px-2"
                        v-for="match in group.matches"
                    >
                        <div class="grid grid-cols-[43%_14%_43%] w-full items-center justify-center">
                            <div class="flex items-center space-x-2 justify-end">
                                <div class="flex items-center gap-2 min-w-0">
                                    <div class="truncate text-m  min-w-0" >
                                        {{ match.home_team }}
                                    </div>
                                    <img
                                        :src="match.home_team_crest ?? '/images/default_club_badge.png'"
                                        alt="Home Team"
                                        class="w-6 h-6 flex-shrink-0"
                                    />
                                </div>
                            </div>
                            
                            <HomeAndAwayScore 
                                :homeScore="resolveHomeScore(match)"
                                :awayScore="resolveAwayScore(match)"
                                :class="hasPredictions && !showPredictions ? getPredictionColor(predictions[match.id], match) : ''"
                            />
                            
                            <div class="flex items-center space-x-2 justify-start">
                                <div class="flex items-center gap-2 min-w-0">
                                    <img
                                        :src="match.away_team_crest ?? '/images/default_club_badge.png'"
                                        alt="Home Team"
                                        class="w-6 h-6 flex-shrink-0"
                                    />
                                    <div class="truncate text-m min-w-0">
                                        {{ match.away_team }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Match Time / Prediction scores -->
                        <div class="grid grid-cols-[43%_14%_43%] w-full items-center mt-1" style="min-height: 1.5rem;">
                            <div></div>
                            <Transition name="fade-slide" mode="out-in">
                                <div
                                    :key="showPredictions && matchIsFinished(match)"
                                    class="flex justify-center"
                                >
                                    <HomeAndAwayScore 
                                        v-if="matchIsFinished(match) && props.showActualAndPredictedScores && showPredictions"
                                        :homeScore="predictions[match.id]?.predicted_home_score"
                                        :awayScore="predictions[match.id]?.predicted_away_score"
                                        :class="getPredictionColor(predictions[match.id], match)"
                                    />
                                    <div v-else-if="!props.disableMatchTime" class="text-gray-500 text-sm text-center">
                                        {{ DateUtils.toTime(match.match_time) }}
                                    </div>
                                </div>
                            </Transition>
                            <div 
                                v-if="props.groupScoring" 
                                class="text-right text-sm font-semibold" 
                                :class="getPredictionColor(predictions[match.id], match)"
                            >
                                {{ match.matchPoints > 0 ? `+${match.matchPoints}` : match.matchPoints }}
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
        
            <template v-if="props.includeSubmitBtn && !props.locked && props.predictions && Object.keys(props.predictions).length > 0">
                <button
                    @click="!predictionsSaved && submitPredictions()"
                    class="w-full py-2 rounded-md mt-5 flex items-center justify-center transition-colors"
                    :class="predictionsSaved
                        ? 'bg-white ring-2 ring-green-400 text-black'
                        : 'bg-green-600 text-white'"
                    :disabled="isSubmitting || predictionsSaved"
                >
                    <template v-if="predictionsSaved">
                        Predictions Saved
                        <Check class="ml-2 size-5 text-green-500" />
                    </template>
                    <template v-else>
                        Submit Predictions
                    </template>
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
import { TargetIcon, ClockIcon } from 'lucide-vue-next';
import HomeAndAwayScore from './UI/scoreCard/HomeAndAwayScore.vue';
import { Check } from 'lucide-vue-next';
import { LoadingSpinner } from './UI/LoadingSpinner.vue';

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
    groupScoring?: GroupScoring;
    showActualAndPredictedScores?: boolean;
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

// const groupedMatches = computed(() => {
//     return props.matches.reduce((acc, match) => {
//         const matchDay = DateUtils.toShortDayMonth(match.match_time, true);
//         if (!acc[matchDay]) acc[matchDay] = [];
//         acc[matchDay].push(match);
//         return acc;
//     }, {});
// });

const groupedMatches = computed(() => {
    return props.matches.reduce((acc: any, match: any) => {
        const day = DateUtils.toShortDayMonth(match.match_time, true);

        if (!acc[day]) {
            acc[day] = {
                matches: [],
                totalPoints: 0
            };
        }

        let matchPoints: number | null = null;

        if (
            props.groupScoring &&
            props.predictions &&
            props.predictions[match.id] &&
            match.final_home_score !== null &&
            match.final_away_score !== null
        ) {
            const prediction = props.predictions[match.id];

            const predictedHome = prediction.predicted_home_score;
            const predictedAway = prediction.predicted_away_score;
            const actualHome = match.final_home_score;
            const actualAway = match.final_away_score;

            if (
                predictedHome !== undefined &&
                predictedAway !== undefined
            ) {
                if (predictedHome === actualHome && predictedAway === actualAway) {
                    matchPoints = props.groupScoring.exact_score_points;
                } else {
                    const predictedWinner =
                        predictedHome > predictedAway ? "home" :
                        predictedAway > predictedHome ? "away" : "draw";

                    const actualWinner =
                        actualHome > actualAway ? "home" :
                        actualAway > actualHome ? "away" : "draw";

                    if (predictedWinner === actualWinner) {
                        matchPoints = props.groupScoring.correct_result_points;
                    } else if (props.groupScoring.incorrect_points) {
                        matchPoints = -props.groupScoring.incorrect_points;
                    } else {
                        matchPoints = 0;
                    }
                }
            }
        }

        acc[day].matches.push({
            ...match,
            matchPoints
        });

        if (typeof matchPoints === 'number') {
            acc[day].totalPoints += matchPoints;
        }

        return acc;
    }, {});
});

const allPredictionsSubmitted = computed(() => {
    return props.matches.length > 0 && props.matches.every(match => {
        const prediction = props.predictions[match.id];
        return prediction?.predicted_home_score !== '' && prediction?.predicted_away_score !== '';
    });
});

const predictionsSaved = computed(() => allPredictionsSubmitted.value && !predictionsChanged.value);

const hasPredictions = computed(() =>
    props.predictions && Object.keys(props.predictions).length > 0
);

const showFinalScores = (match) => {
    return props.showActualAndPredictedScores && matchIsFinished(match) && showPredictions.value;
};

const resolveHomeScore = (match) => {
    if (showFinalScores(match)) {
            return match.final_home_score
    }

    if (hasPredictions.value) {
            const score = props.predictions[match.id]?.predicted_home_score;
            return score !== undefined ? score : '-';
    }

    return match.final_home_score === null && !match.api_match_id && props.isAdmin
    ? 0
    : match.final_home_score
}

const resolveAwayScore = (match) => {
    if (showFinalScores(match)) {
        return match.final_away_score
    }

    if (hasPredictions.value) {
        const score = props.predictions[match.id]?.predicted_away_score
        return score !== undefined ? score : '-'
    }

    return match.final_away_score === null && !match.api_match_id && props.isAdmin
    ? 0
    : match.final_away_score
}

const predictionsChanged = ref(false);
const matchesCollapsed = ref(false);
const isSubmitting = ref(false);
const showPredictions = ref(false);

function matchIsLocked(
    finalHomeScore: number | null | undefined,
    finalAwayScore: number | null | undefined
): boolean {
    // A match is locked once both final scores are recorded
    return finalHomeScore != null && finalAwayScore != null;
}

function matchIsFinished(match) {
    return match.final_home_score !== null && match.final_away_score !== null;
}

const toggleMatchesCollapse = () => {
  matchesCollapsed.value = !matchesCollapsed.value;
}

const toggleShowPredictions = () => {
  showPredictions.value = !showPredictions.value;
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

function getPointsColor(points: number) {
    if (points == 0) { return 'text-red-500'; }
    if (points > 0) { return 'text-green-500'; }
}

// Function to determine color based on prediction accuracy
const getPredictionColor = (prediction, match) => {
    if (
        !prediction ||
        prediction.predicted_home_score === undefined || 
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

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 150ms ease, transform 150ms ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-4px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(4px);
}

.icon-fade-enter-active,
.icon-fade-leave-active {
    transition: opacity 120ms ease;
}
.icon-fade-enter-from,
.icon-fade-leave-to {
    opacity: 0;
}
</style>