<template>
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <slot name="header"></slot>
        <div class="flex justify-between items-center mb-4" v-if="props.header && !slots.header">
            <div class="items-center flex">
                <slot name="filter"></slot>
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
                            :to="props.matchesClickable ? `/match/${match.match_id}` : undefined"
                            :key="match.match_id"
                            class="flex flex-col items-center py-2 bg-gray-100 mt-2 rounded-md px-2"
                            v-for="match in matchGroup"
                        >
                            <div class="flex justify-center" style="width: 100%;">
                                <!-- Home Team and Score -->
                                <div class="flex items-center space-x-2 justify-end" style="width: 45%;">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <div class="truncate text-sm font-medium min-w-0">
                                            {{ match.home_team }}
                                        </div>
                                        <img
                                            :src="match[props.homeCrestField] ?? '/images/default_club_badge.png'"
                                            alt="Home Team"
                                            class="w-6 h-6 flex-shrink-0"
                                        />
                                    </div>
                                    <span class="text-md font-bold" 
                                        :class="!props.notPrediction ? getPredictionColor(match) : ''">
                                        {{ props.notPrediction ? match.final_home_score : match.predicted_home_score }}
                                    </span>
                                </div>
            
                                <div class="border-l border-gray-300 h-5 mx-2"></div>
            
                                <!-- Away Team and Score -->
                                <div class="flex items-center space-x-2 justify-start" style="width: 45%;">
                                    <span class="text-md font-bold" 
                                        :class="!props.notPrediction ? getPredictionColor(match) : ''">
                                        {{ props.notPrediction ? match.final_away_score : match.predicted_away_score }}
                                    </span>
                                    <div class="flex items-center gap-2 min-w-0">
                                        <img
                                            :src="match[props.awayCrestField] ?? '/images/default_club_badge.png'"
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

                                <div class="text-right text-sm font-semibold" :class="getPredictionColor(match)">
                                    {{ getMatchPoints(match) }}
                                </div>
                            </div>

                            <!-- <div class="justify-between flex gap-8 h-5" v-if="!props.locked">
                                <div class="flex rounded overflow-hidden items-center flex-start">
                                    <button @click="updatePrediction(match, 'predicted_home_score', -1)" class="bg-gray-400 text-white px-2 py-0.5">-</button>
                                    <button @click="updatePrediction(match, 'predicted_home_score', 1)" class="bg-blue-500 text-white px-2 py-0.5">+</button>
                                </div>
                                <div class="flex rounded overflow-hidden items-center">
                                    <button @click="updatePrediction(match, 'predicted_away_score', -1)" class="bg-gray-400 text-white px-2 py-1">-</button>
                                    <button @click="updatePrediction(match, 'predicted_away_score', 1)" class="bg-blue-500 text-white px-2 py-1">+</button>
                                </div>
                            </div> -->
                        </component>
                    </div>
                </div>
            
                <h3 class="text-lg mt-4" v-if="props.totalPoints">
                    <span class="font-medium">Total Points:</span> {{ props.totalPoints }}
                </h3>

                <!-- <template v-if="props.includeSubmitBtn && !props.locked">
                    <button v-if="!predictionsChanged" class="w-full bg-white ring-2 ring-green-400 py-2 rounded-md mt-5 flex items-center justify-center" disabled>
                        Predictions Saved ✅
                    </button>
                    <button v-else @click="submitPredictions" class="w-full bg-green-600 text-white py-2 rounded-md mt-5 disabled:opacity-50" 
                        :disabled="isSubmitting || (!predictionsChanged)">
                        Submit Predictions
                    </button>
                </template> -->
            </template>
        </TransitionGroup>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { GroupScoring, Prediction } from '../types';
import { getPredictionColor } from '../utils/sharedFunctions';

export interface EditedPrediction {
    matchId: string, 
    field: string, 
    value: number
}

export interface IProps {
    matches: Prediction[];
    locked?: boolean;
    totalPoints?: number
    topMargin?: number;
    header?: string;
    allowCollapse?: boolean;
    showLockedIcon?: boolean;
    oneMatchPerRow?: boolean;
    gameweekId?: string;
    matchesClickable?: boolean
    disableTimeHeader?: boolean
    disableMatchTime?: boolean
    includeSubmitBtn?: boolean
    notPrediction?: boolean
    homeCrestField?: string
    awayCrestField?: string;
    groupScoring?: GroupScoring
}

const props = withDefaults(defineProps<IProps>(), { 
    locked: false, 
    topMargin: 6,
    homeCrestField: 'home_crest_url',
    awayCrestField: 'away_crest_url'
});
const slots = useSlots();
const emit = defineEmits<{
    (e: 'prediction-updated', editedPrediction: EditedPrediction): void,
    (e: 'predictions-submitted'): void,
}>();

const predictionsChanged = ref<boolean>(false);
const matchesCollapsed = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

const groupedMatches = computed(() => {
    const groups: Record<string, Prediction[]> = {}

    for (const match of props.matches) {
        if (!match.match_time) continue

        const date = DateUtils.toShortDayMonth(match.match_time, true);

        if (!groups[date]) {
            groups[date] = []
        }

        groups[date].push(match)
    }

    return groups;
});

// const allPredictionsSubmitted = computed(() => {
//     return props.matches.length > 0 && props.matches.every(match => {
//         const prediction = props.predictions[match.id];
//         return prediction?.predicted_home_score !== '' && prediction?.predicted_away_score !== '';
//     });
// });

const toggleMatchesCollapse = () => {
    matchesCollapsed.value = !matchesCollapsed.value;
}

function getMatchPoints(match: Prediction) {
    if (!props.groupScoring) { return }

    if (match.predicted_home_score === undefined || 
        match.predicted_away_score === undefined || 
        match.final_home_score === null || 
        match.final_away_score === null
    ) {
        return;
    }

    const predictedHome = match.predicted_home_score;
    const predictedAway = match.predicted_away_score;
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

// Emit event when prediction changes
const updatePrediction = (match: any, field: string, increment: number) => {
    const currentScore = Number(match[field]) || 0; // Ensure it's a number
    const newScore = Math.max(0, currentScore + increment); // Prevent negative values
    match[field] = newScore;
    predictionsChanged.value = true;
    emit("prediction-updated", { matchId: match.id, field, value: newScore });
};

// Emit event when user submits predictions
const submitPredictions = () => {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    predictionsChanged.value = false;
    emit("predictions-submitted");

    setTimeout(() => {
        isSubmitting.value = false;
    }, 1500);
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