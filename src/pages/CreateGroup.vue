<template>
  <div class="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
    <h1 class="text-2xl font-bold mb-4 text-center">Create a New Group</h1>

    <form @submit.prevent="createGroup" class="space-y-4" novalidate>
      <!-- Group Name -->
      <div>
        <label class="block font-medium">Group Name</label>
        <input
          v-model="groupData.name"
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
      <div v-if="previewUrl" class="mt-4">
        <p class="text-sm text-gray-600">Preview:</p>
        <img :src="previewUrl" alt="Preview" class="w-24 h-24 object-cover rounded border" />
      </div>

      <!-- Scoring System -->
      <SelectInput selectLabel="Scoring System" v-model="groupData.scoring_system" :options="[
          { value: 'classic', label: 'Classic (1 pt for correct result, 3 pts for exact score)' },
          { value: 'custom', label: 'Custom (set below)' }
        ]" />

      <!-- Custom Scoring -->
      <div v-if="groupData.scoring_system === 'custom'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-medium">Correct Result Points</label>
          <input v-model.number="groupData.correct_result_pts" type="number" min="0" class="w-full border p-2 rounded-md" />
        </div>
        <div>
          <label class="block font-medium">Exact Score Points</label>
          <input v-model.number="groupData.exact_score_pts" type="number" min="0" class="w-full border p-2 rounded-md" />
        </div>
        <div>
          <label class="block font-medium">Incorrect Result Points</label>
          <input v-model.number="groupData.incorrect_points" type="number" max="0" class="w-full border p-2 rounded-md" />
        </div>
      </div>

      <!-- Privacy Setting -->
      <SelectInput selectLabel="Group Privacy" v-model="groupData.is_public" :options="[
          { value: true, label: 'Public (Anyone can join)' },
          { value: false, label: 'Private (Invite only)' }
        ]" />

      <!-- PIN Input (Only Visible When Private) -->
      <div v-if="!groupData.is_public" class="mt-4">
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
        <input v-model.number="groupData.max_members" type="number" min="1" max="500" class="w-full border p-2 rounded-md" />
      </div>

      <!-- Group Description -->
      <div>
        <label class="block font-medium">Group Description</label>
        <textarea v-model="groupData.description" rows="3" placeholder="Describe your group..." class="w-full border p-2 rounded-md"></textarea>
      </div>

      <!-- Error Message -->
      <p v-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</p>

      <!-- Submit Button -->
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md font-bold hover:bg-green-700">
        {{ isSubmitting ? 'Creating...' : 'Create Group' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { groupsService } from '../api/groupsService';
import { supabase } from '../api/supabase';
import SelectInput from '../components/UI/SelectInput.vue';

const router = useRouter();

const pin = ref(["", "", "", ""]);
const pinInputs = ref([]);
const errorMessage = ref('');
const isSubmitting = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);

// Reactive form data
const groupData = ref({
  name: '',
  scoring_system: 'classic',
  correct_result_pts: 1, 
  exact_score_pts: 3, 
  incorrect_points: 0, 
  is_public: true, 
  group_pin: null,
  max_members: 100, 
  description: ''
});

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

// Function to handle group creation with Supabase
const createGroup = async () => {
  errorMessage.value = '';
  
  if (groupData.value.name == '') {
    errorMessage.value = 'Please enter a name for your group.';
    return;
  }
  if (groupData.value.correct_result_pts == null || groupData.value.exact_score_pts == null || groupData.value.incorrect_points == null) {
    errorMessage.value = 'You are missing values for one or more of your scoring system options.';
    return;
  }
  if (!groupData.value.is_public && !groupData.value.group_pin) {
    errorMessage.value = 'Please enter a PIN for your private group.';
    return;
  }
  if (groupData.value.max_members == null) {
    errorMessage.value = 'Please enter a value for your maxmimum members.';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Get the authenticated user
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      throw new Error('You must be logged in to create a group.');
    }

    const adminId = user.user.id;

    // Create the group in Supabase
    const { data: newGroup, error } = await groupsService.createGroup(groupData.value, adminId, selectedFile.value);

    if (error) {
      throw error;
    }

    // Redirect to the newly created group's page
    router.push(`/group/${newGroup.id}`);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create group.';
  } finally {
    isSubmitting.value = false;
  }
};

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
  groupData.value.group_pin = pin.value.join("");
};

// Reset PIN when switching to public
watch(() => groupData.value.is_public, (newVal) => {
  if (newVal) {
    pin.value = ["", "", "", ""];
    groupData.value.group_pin = "";
  }
});

</script>
