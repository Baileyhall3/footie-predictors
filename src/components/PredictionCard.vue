<template>
    <div class="bg-white shadow-lg rounded-xl p-4 mb-4">
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-bold">Gameweek {{ gameweek.number }}</h2>
            <!-- Status (Pending / Locked) -->
            <span :class="statusClass(gameweek.status)" class="text-sm font-medium px-2 py-1 rounded">
                {{ gameweek.status }}
            </span>
        </div>

        <div v-if="predictions.length">
            <div v-for="prediction in predictions" :key="prediction.match_id" class="flex items-center justify-center border-b py-2">
                <!-- Match Info -->
                <div class="flex items-center justify-center w-full max-w-lg">
                    <!-- Home Team and Score -->
                    <div class="flex items-center space-x-2 w-1/3 justify-end">
                        <span class="font-medium">{{ prediction.home_team }}</span>
                        <span class="text-lg font-bold">{{ prediction.predicted_home_score }}</span>
                    </div>

                    <!-- Vertical Line (centered) -->
                    <div class="border-l border-gray-300 h-8 mx-4"></div>

                    <!-- Away Team and Score -->
                    <div class="flex items-center space-x-2 w-1/3 justify-start">
                        <span class="text-lg font-bold">{{ prediction.predicted_away_score }}</span>
                        <span class="font-medium">{{ prediction.away_team }}</span>
                    </div>
                </div>
            </div>
        </div>

        <p v-else class="text-gray-500 text-sm">No predictions made for this gameweek.</p>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// Define the props structure for gameweek and predictions
const props = defineProps({
    gameweek: Object,  // { number: 1, id: 123, status: 'Pending' or 'Locked' }
    predictions: Array // List of user predictions for this gameweek
});

// Status class styling
const statusClass = (status: string) => {
    return status === 'Locked' ? 'text-red-600 bg-red-100' :  // Locked
           status === 'Pending' ? 'text-gray-600 bg-gray-100' :  // Pending
           'text-green-600 bg-green-100'; // Other status (e.g., Correct or Incorrect)
};
</script>

<style scoped>
/* Custom styling for the cards, such as spacing, borders, etc. */
</style>
