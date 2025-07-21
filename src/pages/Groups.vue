<template>
  <LoadingScreen v-if="isLoading" />
    <div v-else class="container mx-auto px-6 py-8">
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
            <!-- <div v-else class="bg-white rounded-lg shadow p-6 text-center">
              <p class="text-gray-500">You are not a member of any groups.</p>
            </div> -->
            <div v-else class="bg-white rounded-xl shadow p-10 text-center text-gray-500 mt-4 border border-dashed border-gray-300">
                <div class="text-4xl mb-4">🤷‍♂️</div>
                <p class="text-lg font-medium mb-2">You're not part of any groups yet!</p>
                <p class="text-sm text-gray-400">Join or 
                    <router-link to="/create-group" class="text-blue-600 hover:underline">
                        create a group
                    </router-link> 
                    to start tracking your stats.
                </p>
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

        <div class="mb-6" v-if="privateGroups.length > 0">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Private Groups</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GroupCard v-for="group in privateGroups" :key="group.id" :group="group" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import GroupCard from "../components/GroupCard.vue";
import { userStore } from "../store/userStore";
import LoadingScreen from "../components/LoadingScreen.vue";
import { groupsService } from "../api/groupsService";
import type { Group } from "../types";

const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const userGroups = ref<Array<Group>>([]);
const publicGroups = ref<Array<Group>>([]);
const privateGroups = ref<Array<Group>>([]);

const fetchUserData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const { data: groups, error: groupsError } = await groupsService.getAllGroupsUsingView();
    if (groupsError) throw new Error('Failed to load groups');

    if (groups.length > 0) {
      userGroups.value = groups.filter(x => x.iAmMember && !x.joinRequestSent);
      publicGroups.value = groups.filter(x => x.is_public && !x.iAmMember);
      privateGroups.value = groups.filter(x => !x.is_public && (!x.iAmMember || x.joinRequestSent))
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = err.message || 'An error occurred while loading your data';
  }
  isLoading.value = false;
};

onMounted(async () => {
  if (userStore.isAuthenticated) {
    await fetchUserData();
  } else {
    isLoading.value = false;
  }
});
</script>