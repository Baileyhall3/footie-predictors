<template>
    <div class="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
        <h1 class="text-2xl font-bold mb-4 text-center">Create a New Group</h1>

        <form @submit.prevent="createGroup" class="space-y-4">
            <!-- Group Name -->
            <div>
                <label class="block font-medium">Group Name</label>
                <input v-model="groupData.name" type="text" placeholder="Enter group name"
                    class="w-full border p-2 rounded-md" required />
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
            </div>

            <!-- Privacy Setting -->
            <div>
                <label class="block font-medium">Group Privacy</label>
                <select v-model="groupData.privacy" class="w-full border p-2 rounded-md">
                    <option value="public">Public (Anyone can join)</option>
                    <option value="private">Private (Invite only)</option>
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
                <textarea v-model="groupData.description" rows="3" placeholder="Describe your group..."
                    class="w-full border p-2 rounded-md"></textarea>
            </div>

            <!-- Submit Button -->
            <button type="submit"
                class="w-full bg-green-600 text-white py-2 rounded-md font-bold hover:bg-green-700">
                Create Group
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Reactive form data
const groupData = ref({
    name: '',
    scoring_system: 'classic', // Default scoring system
    correct_result_pts: 1, // Default points
    exact_score_pts: 3, // Default points
    privacy: 'public', // Default privacy
    max_members: 100, // Default max members
    description: ''
});

// Function to handle group creation (Replace this with Supabase logic later)
const createGroup = async () => {
    console.log('Group Data:', groupData.value);
    alert('Group Created! (Dummy function, integrate Supabase here)');
};
</script>
