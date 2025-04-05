<template>
    <div class="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-6 mb-6">
        <LoadingScreen v-if="loading" />
        <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Gameweek {{ gameweek?.week_number }} - Add Matches</h2>
            <!-- <p class="text-lg">Deadline: {{ DateUtils.toFullDateTime(gameweek?.deadline) }}</p> -->
            <div class="mb-8 mt-4" v-if="gameweek">
                <label class="block text-sm font-medium text-gray-700">Deadline</label>
                <div class="p-2 border border-gray-300 rounded-md">
                    <DatePicker 
                        v-model="gameweek.deadline" 
                        showIcon 
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        class="w-full"
                        fluid
                        type="datetime-local"
                    />
                </div>
            </div>
        </div>

        <AddMatches 
            :deadline="gameweek?.deadline"
            :selectedMatches="matches"
            @error-message="handleErrorMessage"
            @match-added="handleMatchAdded"
            @match-removed="handleApiMatchRemoved"
        />
    
        <div class="mt-4 mb-4" v-if="matches.length > 0">
            <p class="text-lg font-semibold">Matches</p>
            <ScoreCard 
                :matches="matches"
                canRemove
                oneMatchPerRow
                @match-removed="handleMatchRemoved"
            />
        </div>
    
        <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>

        <div class="justify-between items-center flex gap-4">
            <button @click="cancelChanges" :disabled="!hasChanges" class="w-full bg-gray-300 text-gray-800 hover:bg-gray-400 py-2 rounded-md mt-4 disabled:opacity-50">
                Cancel Changes
            </button>
            <button @click="doUpdates" :disabled="!hasChanges" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-4 disabled:opacity-50">
                Update Gameweek
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import LoadingScreen from '../components/LoadingScreen.vue';
import AddMatches from '../components/AddMatches.vue';
import ScoreCard from '../components/ScoreCard.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const gameweekId = ref(null);
const gameweek = ref(null);
const matches = ref([]);
const errorMessage = ref('');
const hasChanges = ref(false);
const removedMatchesIds = ref([]);
const originalDeadline = ref();

watch(() => gameweek.value?.deadline, (newVal) => {
    if (newVal != originalDeadline.value) {
        hasChanges.value = true;
    }
});

const minDateTime = computed(() => {
    return new Date(gameweek.value.deadline);
});

onMounted(async () => {
    await fetchGameweek();
});
  
async function fetchGameweek() {
    loading.value = true;
    gameweekId.value = route.params.id || route.query.id;

    const { data, error } = await gameweeksService.getGameweekById(gameweekId.value);
    if (error) return console.error(error);
    gameweek.value = data;

    originalDeadline.value = gameweek.value.deadline;

    const { data: matchData } = await gameweeksService.getMatches(gameweekId.value);
    matches.value = matchData;

    loading.value = false;
}

async function doUpdates() {
    loading.value = true;

    const deadline = new Date(gameweek.value.deadline);  

    const hasInvalidMatchTime = matches.value.some(match => new Date(match.match_time) < deadline);

    if (hasInvalidMatchTime) {
        errorMessage.value = 'One or more matches have a match time before the gameweek deadline.';
        loading.value = false; 
        return;
    } else {
        const { data, error } = await gameweeksService.updateGameweek(gameweek.value.id, {
            deadline: deadline
        });
        if (error) {
            errorMessage.value = `${error}`;
        }
    }
    
    const newMatches = matches.value.filter(x => x.isNew);
    if (newMatches.length > 0) {
        for (const match of newMatches) {
            try {
                await gameweeksService.createMatch({
                    gameweek_id: gameweekId.value,
                    api_match_id: match.api_match_id,
                    home_team: match.home_team,
                    away_team: match.away_team,
                    match_time: match.match_time,
                    home_team_api_id: match.home_team_api_id,
                    away_team_api_id: match.away_team_api_id,
                    home_team_crest: match.home_team_crest,
                    away_team_crest: match.away_team_crest
                });
            } catch (err) {
                errorMessage.value = err;
            }
        }
    }

    if (removedMatchesIds.value.length > 0) {
        removedMatchesIds.value.forEach(matchId => {
            removeMatch(matchId);
        });
    }
    
    errorMessage.value = '';
    hasChanges.value = false;
    loading.value = false;

    // redirect
    router.push(`/group/${gameweek.value?.group_id}`);

}

const removeMatch = async(matchId: string) => {
    try {
        const { data, error } = await gameweeksService.deleteMatch(matchId);
        
        if (error) {
            errorMessage.value = error;
        }
    } catch (err) {
        console.error(err);
        errorMessage.value = err;
    }
}

const cancelChanges = async() => {
    removedMatchesIds.value = [];
    hasChanges.value = false;
    fetchGameweek();
}

const handleMatchAdded = (match: any) => {
    hasChanges.value = true;
}

const handleApiMatchRemoved = (apiMatchId: string) => {
    const match = matches.value.find(m => m.api_match_id === apiMatchId);
    if (match) {
        handleMatchRemoved(match.id, true);
    }
}

const handleMatchRemoved = async(matchId: string, skipSplice: boolean = false) => {
    hasChanges.value = true;
    const match = matches.value.find(m => m.id === matchId);
    const matchIndex = matches.value.findIndex(m => m.id === matchId);

    if (matchIndex !== -1) { 
        if (!match.isNew) {
            removedMatchesIds.value.push(match.id);
        }
        if (!skipSplice) {
            matches.value.splice(matchIndex, 1);
        }
    }
}

const handleErrorMessage = (errorMsg: string) => {
    errorMessage.value = errorMsg;
}
</script>