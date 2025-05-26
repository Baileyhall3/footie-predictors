<template>
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4" v-if="props.header">
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
                                            :src="match.home_crest_url ?? '/images/default_club_badge.png'"
                                            alt="Home Team"
                                            class="w-6 h-6 flex-shrink-0"
                                        />
                                    </div>
                                    <span
                                        class="text-md font-bold" 
                                        :class="getPredictionColor(match)">
                                        {{ match.predicted_home_score }}
                                    </span>
                                </div>
            
                                <div class="border-l border-gray-300 h-5 mx-2"></div>
            
                                <!-- Away Team and Score -->
                                <div class="flex items-center space-x-2 justify-start" style="width: 45%;">
                                    <span class="text-md font-bold" 
                                        :class="getPredictionColor(match)">
                                        {{ match.predicted_away_score }}
                                    </span>
                                    <div class="flex items-center gap-2 min-w-0">
                                        <img
                                            :src="match.away_crest_url ?? '/images/default_club_badge.png'"
                                            alt="Home Team"
                                            class="w-6 h-6 flex-shrink-0"
                                        />
                                        <div class="truncate text-sm font-medium min-w-0">
                                            {{ match.away_team }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="text-gray-500 text-sm mt-1" v-if="!props.disableMatchTime">
                                {{ DateUtils.toTime(match.match_time) }}
                            </div>            
                        </component>
                    </div>
                </div>
            
                <h3 class="text-lg mt-4" v-if="props.totalPoints">
                    <span class="font-medium">Total Points:</span> {{ props.totalPoints }}
                </h3>
            </template>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { Prediction } from '../types';

export interface IProps {
    matches: Prediction[];
    locked?: boolean;
    totalPoints?: number
    topMargin?: number;
    header?: string;
    allowCollapse?: boolean;
    showLockedIcon?: boolean;
    oneMatchPerRow?: boolean;
    gameweekId?: string
    matchesClickable?: boolean
    disableTimeHeader?: boolean
    disableMatchTime?: boolean
}

const props = withDefaults(defineProps<IProps>(), { 
    locked: false, 
    topMargin: 6,
});
const slots = useSlots();

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

    return groups
});

const matchesCollapsed = ref(false);

const toggleMatchesCollapse = () => {
    matchesCollapsed.value = !matchesCollapsed.value;
}

// Function to determine color based on prediction accuracy
const getPredictionColor = (match: Prediction) => {
    if (match.final_home_score === null || match.final_away_score === null) {
        return "test-gray-600"; // No color if match is not finished
    }

    const predictedHome = match.predicted_home_score;
    const predictedAway = match.predicted_away_score;
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