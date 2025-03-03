<template>
    <div class="container mx-auto px-6 py-8">
        <div class="mb-6">
            <h2 class="text-2xl font-bold mb-4">Your Predictions</h2>

            <div v-if="userPredictions.length">
                <PredictionCard 
                    v-for="gameweek in userPredictions"
                    :key="gameweek.gameweek.id"
                    :gameweek="gameweek.gameweek"
                    :predictions="gameweek.predictions"
                />
            </div>
            <p v-else class="text-gray-500">No predictions made yet.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PredictionCard from "../components/PredictionCard.vue";
import { getUserGroups } from "../api/groups";
import { getUserPredictions } from "../api/predictions";

const userGroups = ref([]);
const userPredictions = ref([]);

onMounted(() => {
  userGroups.value = getUserGroups();
  userPredictions.value = getUserPredictions();
});
</script>