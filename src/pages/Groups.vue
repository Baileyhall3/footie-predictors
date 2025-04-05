<template>
    <div class="container mx-auto px-6 py-8">
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Your Groups</h2>
                <router-link to="/create-group">
                    <button class="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                        + Create Group
                    </button>
                </router-link>
            </div>
            <div v-if="userGroups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GroupCard v-for="group in userGroups" :key="group.id" :group="group" />
            </div>
            <div v-else class="bg-white rounded-lg shadow p-6 text-center">
              <p class="text-gray-500">You are not a member of any groups.</p>
            </div>
        </div>

        <div class="mb-6" v-if="publicGroups.length > 0">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Public Groups</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GroupCard v-for="group in publicGroups" :key="group.id" :group="group" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import GroupCard from "../components/GroupCard.vue";
import { userStore } from "../store/userStore";
import { groupsStore } from "../store/groupsStore";

// State
const isLoading = ref(true);
const error = ref(null);
const userGroups = ref([]);
const publicGroups = ref([]);

// Fetch all user data
const fetchUserData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Only fetch data if user is authenticated
    if (userStore.isAuthenticated) {
      // Fetch user's groups
      const { data: groups, error: groupsError } = await groupsStore.fetchUserGroups();
      if (groupsError) throw new Error('Failed to load your groups');
      userGroups.value = groups || [];

      const { data: fetchedPublicGroups, error: publicGroupsError } = await groupsStore.fetchPublicGroups();
      if (publicGroupsError) throw new Error('Failed to load public groups');
      publicGroups.value = fetchedPublicGroups || [];
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = err.message || 'An error occurred while loading your data';
  }
  isLoading.value = false;
};

// Fetch data when component is mounted
onMounted(async () => {
  if (userStore.isAuthenticated) {
    await fetchUserData();
  } else {
    isLoading.value = false;
  }
});
</script>