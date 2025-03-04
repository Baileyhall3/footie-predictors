<template>
  <div class="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
    <h1 class="text-2xl font-bold mb-4 text-center">Create a New Group</h1>

    <form @submit.prevent="createGroup" class="space-y-4">
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

      <!-- Scoring System -->
      <div>
        <label class="block font-medium">Scoring System</label>
        <select v-model="groupData.scoring_system" class="w-full border p-2 rounded-md">
          <option value="classic">Classic (1 pt for correct result, 3 pts for exact score)</option>
          <option value="custom">Custom (set below)</option>
        </select>
      </div>

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
          <input v-model.number="groupData.incorrect_points" type="number" class="w-full border p-2 rounded-md" />
        </div>
      </div>

      <!-- Privacy Setting -->
      <div>
        <label class="block font-medium">Group Privacy</label>
        <select v-model="groupData.is_public" class="w-full border p-2 rounded-md">
          <option :value="true">Public (Anyone can join)</option>
          <option :value="false">Private (Invite only)</option>
        </select>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { groupsService } from '../api/groupsService';
import { supabase } from '../api/supabase';

const router = useRouter();
const errorMessage = ref('');
const isSubmitting = ref(false);

// Reactive form data
const groupData = ref({
  name: '',
  scoring_system: 'classic', // Default scoring system
  correct_result_pts: 1, // Default points
  exact_score_pts: 3, // Default points
  incorrect_points: 0, // Default points
  is_public: true, // Default privacy
  max_members: 100, // Default max members
  description: ''
});

// Function to handle group creation with Supabase
const createGroup = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // Get the authenticated user
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      throw new Error('You must be logged in to create a group.');
    }

    const adminId = user.user.id;

    // Create the group in Supabase
    const { data: newGroup, error } = await groupsService.createGroup(groupData.value, adminId);

    if (error) {
      throw error;
    }

    // Redirect to the newly created group's page
    router.push(`/groups/${newGroup.id}`);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create group.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
