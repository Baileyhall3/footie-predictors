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
import { predictionsService } from '../api/predictionsService';
import { gameweeksService } from '../api/gameweeksService';
import { userStore } from '../store/userStore';
import { groupsStore } from '../store/groupsStore';
import { predictionsStore } from '../store/predictionsStore';


const userGroups = ref([]);
const userPredictions = ref([]);

const gameweekId = ref(null);
const gameweek = ref(null);
const matches = ref([]);
const editMode = ref(false);
const newMatch = ref({ home_team: '', away_team: '', match_time: '' });
const predictions = ref({});
const notInGroup = ref(false);
const members = ref([]);

// onMounted(async() => {

//     return;

//     const { data, error } = await groupsStore.fetchUserGroups();
//     if (error) return console.error(error);
//     userGroups.value = data;

//     const { data, error } = await predictionsStore.fetchUserPredictions();
//     if (error) return console.error(error);
//     userPredictions.value = data;

    



//     const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(data.group_id);
//     if (membersError) throw new Error('Failed to load group members');
//     members.value = membersData || [];

//     isAdmin.value = userIsAdmin(members.value);

//     const isMember = members.value.some(member => member.id === userStore.user?.id);
//     if (!isMember) {
//     notInGroup.value = true;
//     return;
//     }

//     const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
//     gameweeksService.getMatches(gameweekId.value),
//     predictionsService.getUserGameweekPredictions(userStore.user?.id, gameweekId.value)
//     ]);

//     const predictionsMap = predictionsData.reduce((acc, prediction) => {
//     acc[prediction.match_id] = prediction;
//     return acc;
//     }, {});

//     matches.value = matchData.map(match => ({
//     ...match,
//     predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? '',
//     predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? '',
//     prediction_id: predictionsMap[match.id]?.id || null
//     }));

//     predictions.value = matches.value.reduce((acc, match) => {
//     acc[match.id] = {
//         home_score: match.predicted_home_score,
//         away_score: match.predicted_away_score
//     };
//     return acc;
//     }, {});
// });
</script>