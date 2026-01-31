<template>
    <div class="container mx-auto px-4 py-8">
      <NoAccess v-if="!group?.iAmOwner && !loading" />
      <div v-else class="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-green-600 to-green-800 px-6 py-8 text-white">
          <h1 class="text-3xl font-bold">{{ group.name }}</h1>
          <!-- <p v-if="admin" class="mt-2 text-green-100">
            Owner: {{ admin.username }}
          </p> -->
        </div>
  
        <div class="p-6">
          <LoadingScreen v-if="loading" />
  
          <div v-else class="space-y-6">
            <div class="border-b pb-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Group Information</h2>
              <form @submit.prevent="updateGroup" class="space-y-4" novalidate>
                <!-- Group Name -->
                <div>
                    <label class="block font-medium">Group Name</label>
                    <input
                      v-model="group.name"
                      type="text"
                      placeholder="Enter group name"
                      class="w-full border p-2 rounded-md"
                      required
                    />
                </div>

                <!-- Group Icon -->
                <div class="mt-4">
                  <label class="block font-medium">Group Icon</label>
                  <FileUpload 
                    :fileTypes="['image/png', 'image/jpeg']" 
                    :maxFileSizeMB="8" 
                    v-model="selectedFile" 
                    :currentFileUrl="group.icon_url"
                    @file-removed="handleFileRemoved"
                  />
                </div>

                <!-- Scoring -->
                <div>
                    <label class="block font-medium">Correct Result Points</label>
                    <input v-model.number="group.correct_result_points" type="number" min="0" class="w-full border p-2 rounded-md" disabled />
                </div>
                <div>
                    <label class="block font-medium">Exact Score Points</label>
                    <input v-model.number="group.exact_score_points" type="number" min="0" class="w-full border p-2 rounded-md" disabled />
                </div>
                <div>
                    <label class="block font-medium">Incorrect Result Points</label>
                    <input v-model.number="group.incorrect_points" type="number" class="w-full border p-2 rounded-md" disabled />
                </div>

                <!-- Privacy Setting -->
                <SelectInput selectLabel="Group Privacy" v-model="group.is_public" :options="[
                    { value: true, label: 'Public (Anyone can join)' },
                    { value: false, label: 'Private (Invite only)' }
                  ]" />

                <!-- PIN Section (Only Visible When Private) -->
                <div v-if="!group.is_public" class="mt-4">

                  <label class="block font-medium">
                    Group PIN
                  </label>

                  <!-- Status hint -->
                  <p class="text-sm text-gray-500 mt-1">
                    <span v-if="hasPin">
                      A PIN is currently set. Enter a new PIN below to replace it.
                    </span>
                    <span v-else>
                      No PIN is set. Please create one to make this group private.
                    </span>
                  </p>

                  <!-- PIN inputs -->
                  <div class="flex gap-2 justify-center mt-3">
                    <input
                      v-for="(digit, index) in pin"
                      :key="index"
                      ref="pinInputs"
                      type="number"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      maxlength="1"
                      class="w-12 h-12 text-center border rounded-md text-xl font-bold"
                      v-model="pin[index]"
                      @input="handleInput(index, $event)"
                      @keydown.backspace="handleBackspace(index, $event)"
                    />
                  </div>

                  <!-- Helper text -->
                  <p class="text-xs text-gray-400 mt-2 text-center">
                    Leave blank to keep the existing PIN.
                  </p>

                </div>

                  <!-- Maximum Members -->
                  <div>
                      <label class="block font-medium">Max Members</label>
                      <input v-model.number="group.max_members" type="number" min="1" max="500" class="w-full border p-2 rounded-md" />
                  </div>

                  <!-- Group Description -->
                  <div>
                      <label class="block font-medium">Group Description</label>
                      <textarea v-model="group.description" rows="3" placeholder="Describe your group..." class="w-full border p-2 rounded-md"></textarea>
                  </div>

                  <!-- Error Message -->
                  <p v-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</p>

                  <!-- Submit Button -->
                  <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md font-bold hover:bg-green-700">
                      {{ isSubmitting ? 'Updating...' : 'Update Group' }}
                  </button>
                </form>
            </div>
  
            <!-- Group Actions -->
            <div>
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Group Actions</h2>
              <div class="space-y-3">
                <button 
                  @click="deleteGroup" 
                  class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center"
                >
                  Delete Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DeleteConfirm ref="deleteConfirm" title="Delete Group" message="Are you sure you want to delete this group?" />
  </template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { groupsStore } from "../store/groupsStore";
import { userStore } from "../store/userStore";
import LoadingScreen from "../components/LoadingScreen.vue";
import { groupsService } from '../api/groupsService';
import { supabase } from '../api/supabase';
import DeleteConfirm from "../components/DeleteConfirm.vue";
import SelectInput from "../components/UI/SelectInput.vue";
import NoAccess from "../components/NoAccess.vue";
import FileUpload from "../components/UI/FileUpload.vue";

const route = useRoute();
const router = useRouter();
const deleteConfirm = ref<InstanceType<typeof DeleteConfirm> | null>(null);

// State
const loading = ref(true);
const error = ref(null);
const groupId = ref();
const group = ref<{ 
  id: string;
  name?: string; 
  correct_result_points?: number;
  exact_score_points?: number;
  incorrect_points?: number;
  is_public?: boolean;
  pin_hash?: number | String;
  max_members?: number;
  description?: string;
  icon_url?: string | null;
}>({});

const pin = ref(["", "", "", ""]);
const pinInputs = ref([]);
const members = ref([]);
const showDeleteConfirmation = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);
const numberOfMembers = ref();
const selectedFile = ref(null);
const hadIcon = ref<boolean>();
const hasPin = ref<boolean>(false);

function handleFileRemoved() {
  group.value.icon_url = null;
}

// Handle typing a digit
const handleInput = (index, event) => {
  const value = event.target.value.replace(/\D/g, ""); // Allow only numbers
  pin.value[index] = value.substring(0, 1);

  if (value && index < 3) {
    nextTick(() => pinInputs.value[index + 1].focus());
  }

  updateGroupPin();
};

// Handle backspace key
const handleBackspace = (index, event) => {
  if (!pin.value[index] && index > 0) {
    pinInputs.value[index - 1].focus();
  }
};

// Update `pin_hash` when PIN changes
const updateGroupPin = () => {
  const pinValue = pin.value.join(""); 
  group.value.pin_hash = pinValue.length === 4 ? parseInt(pinValue, 10) : null;
};

// Reset PIN when switching to public
watch(() => group.value.is_public, (newVal) => {
  if (newVal) {
    pin.value = ["", "", "", ""];
    group.value.pin_hash = "";
  }
});

// Fetch all data for the group
const fetchAllData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Get group ID from route
    groupId.value = route.params.id || route.query.id;
    
    if (!groupId.value) {
      throw new Error('Group ID is missing');
    }
    
    // Fetch group details
    const { data: groupData, error: groupError } = await groupsService.getGroupByIdUsingView(groupId.value);
    if (groupError) throw new Error('Failed to load group details');
    
    group.value = groupData;
    hasPin.value = groupData.has_pin;
    hadIcon.value = group.value.icon_url ? true : false;
    pin.value = ["", "", "", ""]; 
  } catch (err) {
    console.error('Error fetching group data:', err);
    error.value = err.message || 'An error occurred while loading group data';
  } finally {
    loading.value = false;
  }
};

// Function to handle group creation with Supabase
const updateGroup = async () => {
  errorMessage.value = '';
  
  if (group.value.name == '') {
    errorMessage.value = 'Please enter a name for your group.';
    return;
  }
  if (group.value.correct_result_points == null || group.value.exact_score_points == null || group.value.incorrect_points == null) {
    errorMessage.value = 'You are missing values for one or more of your scoring system options.';
    return;
  }
  if (!group.value.is_public && !hasPin.value && !group.value.pin_hash) {
    errorMessage.value = 'Please enter a PIN for your private group.';
    return;
  }
  if (group.value.max_members < group.value.member_count) {
    errorMessage.value = `There are currently ${group.value.member_count} members in your group. Maximum members cannot be lower than this.`;
    return;
  }

  if (group.value.is_public) {
    group.value.pin_hash = null;
  }

  isSubmitting.value = true;

  try {

    if ((hadIcon.value && selectedFile.value) || (hadIcon.value && !group.value.icon_url)) {
      const { success, error } = await groupsService.deleteGroupIcon(group.value.id);
      if (error) throw new Error('Error deleting current group icon.');
    }

    if (selectedFile.value) {
      const { url, error } = await groupsService.uploadGroupIcon(selectedFile.value, group.value.id)
      if (error) {
        console.error('Failed to upload icon:', error)
      } else {
        group.value.icon_url = url;
      }
    }

    const payload: any = {
      name: group.value.name,
      description: group.value.description,
      exact_score_points: group.value.exact_score_points,
      correct_result_points: group.value.correct_result_points,
      incorrect_points: group.value.incorrect_points,
      is_public: group.value.is_public,
      max_members: group.value.max_members,
      icon_url: group.value.icon_url,
      pin_hash: group.value.pin_hash,
    }

    // Update the group in Supabase
    const { data: updatedGroup, error } = await groupsService.updateGroup(group.value.id, payload);

    if (error) {
      throw error;
    }

    router.push(`/group/${updatedGroup.id}`);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update group.';
  } finally {
    isSubmitting.value = false;
  }
};

const deleteGroup = async () => {
  const confirmed = await deleteConfirm.value?.show();
  if (confirmed) {
    try {
      loading.value = true;
      const { success, error: deleteError } = await groupsStore.deleteGroup(groupId.value);
      
      if (deleteError) throw new Error('Failed to delete group');
      
      // Redirect to groups page
      router.push('/groups');
    } catch (err) {
      error.value = err.message || 'An error occurred while deleting the group';
    } finally {
      loading.value = false;
      showDeleteConfirmation.value = false;
    }
    // Call API to delete the group
  } else {
    console.log("Deletion cancelled!");
  }
};

// Watch for route changes to reload data
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchAllData();
  }
});

// Fetch data when component is mounted
onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
/* Optional: Make inputs look more interactive */
input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
}
</style>