<template>
    <component
        :is="props.matchesClickable ? 'router-link' : 'div'"
        :to="props.matchesClickable ? `/match/${match.id}` : undefined"
        :key="match.id"
        class="flex flex-col items-center py-2 bg-gray-100 mt-2 rounded-md px-2"
    >
        <div class="flex justify-center" style="width: 100%;">
            <!-- Home team and score -->
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

        <div class="text-gray-500 text-sm mt-1" v-if="!props.disableMatchTime">
            {{ DateUtils.toTime(match.match_time) }}
        </div>
        
        <div 
            v-if="!props.locked && props.predictions && Object.keys(props.predictions).length > 0 && !matchIsLocked(match.final_home_score, match.final_away_score)"
            class="justify-between flex gap-8 h-5" 
        >
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
</template>

<script setup lang="ts">
import DateUtils from '../../../utils/dateUtils';

// TODO: Create a view that selects from matches table left joined with predictions

</script>