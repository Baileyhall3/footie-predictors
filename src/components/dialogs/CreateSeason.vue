<template>
    <Dialog title="Create New Season" v-model="isVisible" bgBlur @shown="showEvent" @hidden="hideEvent" size="lg">
        <template #body>
            <form @submit.prevent="createSeason" class="space-y-4 p-6 flex flex-col gap-2" novalidate>
                <!-- <div class="space-y-2 border-b pb-4">
                    <p>You are creating a new season for {{ props.group.name }}. If the current season has not ended yet, creating this season will end it.</p>
                    <p>The newly created season will be set as the group's active season. All group members' leaderboard scores and stats will be reset in the new 
                        season.
                    </p>
                </div> -->

                <!-- Season Name -->
                <div>
                    <label class="block font-medium">Season Name</label>
                    <input
                        v-model="seasonData.name"
                        type="text"
                        placeholder="e.g. 2024/25 Season"
                        class="w-full border p-2 rounded-md"
                        required
                    />
                </div>
                
                <div>
                    <label class="block font-medium">Select Competition (optional)</label>
                    <p class="text-gray-600 text-sm">This will enable automatic gameweek creation based on the competition's schedule.</p>
                    <CompetitionLookup 
                        v-model:selectedCompetition="selectedCompetition" 
                        @competition-selected="selectCompetition" 
                        @competition-cleared="clearCompetition"
                    />
                </div>
            
                <!-- Start Date -->
                <div>
                    <label class="block font-medium">Start Date</label>
                    <p class="text-gray-600 text-sm">Leave this blank if you want the season to start when the first gameweek starts.</p>
                    <div class="p-2 border w-full rounded-md" :class="{ 'bg-gray-200' : datesDisabled }">
                        <DatePicker 
                            v-model="seasonData.start_date" 
                            showIcon 
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                            class="w-full"
                            :minDate="new Date()"
                            fluid
                            hideOnDateTimeSelect
                            :disabled="datesDisabled"
                        />
                    </div>
                </div>

                <!-- End Date -->
                <div>
                    <label class="block font-medium">End Date</label>
                    <p class="text-gray-600 text-sm">Leave this blank if you want to manually end the season.</p>
                    <div class="p-2 border w-full rounded-md" :class="{ 'bg-gray-200' : !seasonData.start_date || datesDisabled }">
                        <DatePicker 
                            v-model="seasonData.end_date" 
                            showIcon 
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                            class="w-full"
                            :minDate="minSeasonEndDate"
                            fluid
                            :disabled="!seasonData.start_date || datesDisabled"
                            hideOnDateTimeSelect
                        />
                    </div>
                </div>

                <!-- Error Message -->
                <p v-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</p>

                <!-- Submit Button -->
                <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Creating...' : 'Create Season' }}
                </button>
            </form>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog } from '../UI';
import { ref, computed } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRoute, useRouter } from "vue-router";
import { seasonsService } from '../../api/seasonsService';
import type { Group } from '../../types';
import CompetitionLookup from '../UI/input/CompetitionLookup.vue';

const props = defineProps<{
    group: Group;
}>();

const isVisible = ref(false);

const router = useRouter();
const route = useRoute();

const errorMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);
const datesDisabled = ref<boolean>(false);

const selectedCompetition = ref<any | null>(null);

const seasonData = ref({
    name: '',
    start_date: null,
    end_date: null,
    group_id: null,
    competition_id: null,
    competition_season_id: null
});

function showEvent() {
    seasonData.value.group_id = props.group.id;
}

function selectCompetition(competition: any) {
    selectedCompetition.value = competition;
    seasonData.value.competition_id = competition.id;
    const { id, startDate, endDate } = competition.currentSeason;
    seasonData.value.start_date = startDate;
    seasonData.value.end_date = endDate;
    seasonData.value.competition_season_id = competition.currentSeason.id;
    datesDisabled.value = true; // Disable date pickers since we're using competition dates
}

function clearCompetition() {
    seasonData.value.competition_id = null;
    seasonData.value.competition_season_id = null;
    selectedCompetition.value = null;
    datesDisabled.value = false;
    seasonData.value.start_date = null;
    seasonData.value.end_date = null;
}

const minSeasonEndDate = computed(() => {
    if (!seasonData.value.start_date) return null;
    
    const start = new Date(seasonData.value.start_date);
    const minEnd = new Date(start);
    minEnd.setDate(minEnd.getDate() + 1); // start_date + 1 day

    return minEnd;
});

const createSeason = async () => {
  errorMessage.value = '';

  if (seasonData.value.name == '') {
    errorMessage.value = 'Please enter a name for the season.';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const { data: newSeason, error } = await seasonsService.createSeason(seasonData.value);

    if (error) { throw error; }

    // Redirect to the newly created group's page
    router.push(`/season/${newSeason.id}`);
    hide();
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create season.';
  } finally {
    isSubmitting.value = false;
  }
};

const show = () => {
    isVisible.value = true;
}

const hide = () => {
    errorMessage.value = '';
    seasonData.value = {
        name: '',
        start_date: null,
        end_date: null,
        group_id: null,
        competition_id: null,
        competition_season_id: null
    };
    selectedCompetition.value = null;
    isSubmitting.value = false;
    isVisible.value = false;
    datesDisabled.value = false;
}

defineExpose({ show, hide });
</script>