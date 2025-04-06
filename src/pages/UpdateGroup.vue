<template>
    <div class="container mx-auto px-4 py-8">
      <!-- <div v-if="!isAdmin && !loading" class="bg-red-100 p-4 rounded-md text-red-600">
        <p>You must be an admin to update this group.</p>
        <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
          Go to Group
        </button>
      </div> -->
      <NoAccess v-if="!isAdmin && !loading" />
      <div v-else class="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-green-600 to-green-800 px-6 py-8 text-white">
          <h1 class="text-3xl font-bold">{{ group.name }}</h1>
          <p v-if="admin" class="mt-2 text-green-100">
            Owner: {{ admin.username }}
          </p>
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
                <div>
                  <label class="block font-medium">Group Icon</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    @change="handleFileChange"
                    class="mt-4"
                  />
                </div>

                <!-- Image Preview -->
                <div v-if="group.icon_url || previewUrl" class="mt-4">
                  <p class="text-sm text-gray-600">Preview:</p>
                  <img :src="group.icon_url ?? previewUrl" alt="Preview" class="w-24 h-24 object-cover rounded border" />
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

                <!-- PIN Input (Only Visible When Private) -->
                <div v-if="!group.is_public" class="mt-4">
                  <label class="block font-medium">Set Group PIN</label>
                    <div class="flex gap-2 justify-center mt-2">
                      <input
                        v-for="(digit, index) in pin"
                        :key="index"
                        ref="pinInputs"
                        type="text"
                        maxlength="1"
                        class="w-12 h-12 text-center border rounded-md text-xl font-bold"
                        v-model="pin[index]"
                        @input="handleInput(index, $event)"
                        @keydown.backspace="handleBackspace(index, $event)"
                      />
                    </div>
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
  group_pin?: number | String;
  max_members?: number;
  description?: string;
  icon_url?: string;
}>({});

const pin = ref(["", "", "", ""]);
const pinInputs = ref([]);
const members = ref([]);
const showDeleteConfirmation = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);
const admin = ref({});
const numberOfMembers = ref();
const selectedFile = ref(null);
const previewUrl = ref(null);

// Computed properties
const isAdmin = ref(false);

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  } else {
    selectedFile.value = null
    previewUrl.value = null
  }
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

// Update `group_pin` when PIN changes
const updateGroupPin = () => {
  const pinValue = pin.value.join(""); 
  group.value.group_pin = pinValue.length === 4 ? parseInt(pinValue, 10) : null;
};

// Reset PIN when switching to public
watch(() => group.value.is_public, (newVal) => {
  if (newVal) {
    pin.value = ["", "", "", ""];
    group.value.group_pin = "";
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
    const { data: groupData, error: groupError } = await groupsStore.fetchGroupById(groupId.value);
    if (groupError) throw new Error('Failed to load group details');

    group.value = groupData;

    if (groupData.group_pin !== null && groupData.group_pin !== undefined) {
      pin.value = String(groupData.group_pin).padStart(4, "0").split(""); 
    } else {
      pin.value = ["", "", "", ""]; 
    }

    // Fetch admin for group
    const { data: adminData, error: adminError } = await groupsService.getGroupAdmin(groupId.value);
    if (adminError) throw new Error('Failed to retrieve group admin');

    admin.value = adminData;
    isAdmin.value = userStore.user?.id == admin.value.id;

    const { data: membersData, error: membersError } = await groupsService.getGroupMembers(groupId.value);
    if (membersError) throw new Error('Failed to retrieve group members');

    members.value = membersData || [];
    numberOfMembers.value = membersData.length;
    
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
  if (!group.value.is_public && !group.value.group_pin) {
    errorMessage.value = 'Please enter a PIN for your private group.';
    return;
  }
  if (group.value.max_members < numberOfMembers.value) {
    errorMessage.value = `There are currently ${numberOfMembers.value} members in your group. Maximum members cannot be lower than this.`;
    return;
  }

  if (group.value.is_public) {
    group.value.group_pin = null;
  }

  isSubmitting.value = true;

  try {
    // Get the authenticated user
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      throw new Error('You must be logged in to create a group.');
    }

    let iconUrl = group.value.icon_url

    if (selectedFile.value) {
      const { url, error } = await groupsService.uploadGroupIcon(selectedFile.value, group.value.id)
      if (error) {
        console.error('Failed to upload icon:', error)
        // optionally show user feedback
      } else {
        group.value.icon_url = url;
      }
    }

    // Update the group in Supabase
    const { data: updatedGroup, error } = await groupsService.updateGroup(group.value.id, group.value);

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

function redirectToGroup() {
  router.push(`/group/${group.value.id}`);
}

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