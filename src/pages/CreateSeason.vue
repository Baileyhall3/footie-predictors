<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        <NoAccess v-else-if="!userIsAdmin" message="Only the group owner can create a new season." />
        <div v-else class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h1 class="text-2xl font-bold mb-4 text-center">Create a New Season</h1>

            <form @submit.prevent="createSeason" class="space-y-4" novalidate>
                <div class="space-y-2 border-b pb-4">
                    <p>You are creating a new season for {{ groupData?.name }}. If the current season has not ended yet, creating this season will end it.</p>
                    <p>The newly created season will be set as the group's active season. All group members' leaderboard scores and stats will be reset in the new 
                        season.
                    </p>
                </div>

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
            
                <!-- Start Date -->
                <div class="mt-4">
                    <label class="block font-medium">Start Date</label>
                    <p class="text-gray-600 text-sm">Leave this blank if you want the season to start when the first gameweek starts.</p>
                    <div class="p-2 border w-full rounded-md">
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
                        />
                    </div>
                </div>

                <!-- End Date -->
                <div class="mt-4">
                    <label class="block font-medium">End Date</label>
                    <p class="text-gray-600 text-sm">Leave this blank if you want to manually end the season.</p>
                    <div class="p-2 border w-full rounded-md">
                        <DatePicker 
                            v-model="seasonData.end_date" 
                            showIcon 
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                            class="w-full"
                            :minDate="minSeasonEndDate"
                            fluid
                            :disabled="!seasonData.start_date"
                            hideOnDateTimeSelect
                        />
                    </div>
                </div>

                <!-- Error Message -->
                <p v-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</p>

                <!-- Submit Button -->
                <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md font-bold hover:bg-green-700">
                    {{ isSubmitting ? 'Creating...' : 'Create Season' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { groupsService } from '../api/groupsService';
import { supabase } from '../api/supabase';
import { seasonsService } from '../api/seasonsService';
import { Group } from '../types';
import LoadingScreen from '../components/LoadingScreen.vue';
import NoAccess from '../components/NoAccess.vue';
import { userStore } from '../store/userStore';

const router = useRouter();
const route = useRoute();

const errorMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);
const groupData = ref<Group>();
const loading = ref<boolean>(false);
const userIsAdmin = ref<boolean>(false);

const seasonData = ref({
    name: '',
    start_date: null,
    end_date: null,
    group_id: null
});

const minSeasonEndDate = computed(() => {
    if (!seasonData.value.start_date) return null;
    
    const start = new Date(seasonData.value.start_date);
    const minEnd = new Date(start);
    minEnd.setDate(minEnd.getDate() + 1); // start_date + 1 day

    return minEnd;
});

onMounted(() => {
    fetchGroupData();
});

async function fetchGroupData() {
    try {
        loading.value = true;

        const groupId = route.params.id || route.query.id;
        
        if (!groupId) {
            throw new Error('Group ID is missing');
        }

        const { data, error } = await groupsService.getGroupById(groupId);
        if (error) {
            throw new Error('Failed to fetch group data'); 
        }

        groupData.value = data;
        seasonData.value.group_id = data.id;
        userIsAdmin.value = userStore.user?.id === data.admin_id;
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

const createSeason = async () => {
  errorMessage.value = '';

  if (seasonData.value.name == '') {
    errorMessage.value = 'Please enter a name for the season.';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Get the authenticated user
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      throw new Error('You must be logged in to create a group.');
    }

    const { data: newGroup, error } = await seasonsService.createSeason(seasonData.value);

    if (error) {
      throw error;
    }

    // Redirect to the newly created group's page
    router.push(`/group/${groupData.value?.id}`);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create season.';
  } finally {
    isSubmitting.value = false;
  }
};

</script>
