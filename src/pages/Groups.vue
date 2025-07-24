<template>
  <LoadingScreen v-if="isLoading" />
    <div v-else class="container mx-auto px-6 py-8">
        <div class="mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div class="flex gap-2 flex-wrap">
              <div class="flex justify-between items-center">
                  <h2 class="text-2xl font-bold">Your Groups</h2>
                  <div class="ms-2">
                    <router-link to="/create-group">
                        <AddBtn title="Create a new group" />
                    </router-link>
                  </div>
              </div>
            </div>
            <!-- Search bar -->
            <div class="relative w-full md:w-64">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search for group..."
                @keydown.enter="handleSearchQuery"
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
                stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
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
import { AddBtn } from "../components/UI/buttons";

const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const userGroups = ref<Array<Group>>([]);
const publicGroups = ref<Array<Group>>([]);
const privateGroups = ref<Array<Group>>([]);
const searchQuery = ref<string>('');
const allGroups = ref<Array<Group>>([]);

const fetchUserData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const { data: groups, error: groupsError } = await groupsService.getAllGroupsUsingView();
    if (groupsError) throw new Error('Failed to load groups');

    if (groups.length > 0) {
      allGroups.value = groups;
      userGroups.value = groups.filter(x => x.iAmMember && !x.joinRequestSent);
      publicGroups.value = groups.filter(x => x.is_public && !x.iAmMember);
      privateGroups.value = groups.filter(x => !x.is_public && (!x.iAmMember || x.joinRequestSent));
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = err.message || 'An error occurred while loading your data';
  }
  isLoading.value = false;
};

function handleSearchQuery() {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    userGroups.value = allGroups.value.filter(
      x => x.iAmMember && !x.joinRequestSent && x.name.toLowerCase().includes(query)
    );
    publicGroups.value = allGroups.value.filter(
      x => x.is_public && !x.iAmMember && x.name.toLowerCase().includes(query)
    );
    privateGroups.value = allGroups.value.filter(
      x => !x.is_public && (!x.iAmMember || x.joinRequestSent) && x.name.toLowerCase().includes(query)
    );
  } else {
    // Reset to original filtered lists
    userGroups.value = allGroups.value.filter(x => x.iAmMember && !x.joinRequestSent);
    publicGroups.value = allGroups.value.filter(x => x.is_public && !x.iAmMember);
    privateGroups.value = allGroups.value.filter(x => !x.is_public && (!x.iAmMember || x.joinRequestSent));
  }
}


onMounted(async () => {
  if (userStore.isAuthenticated) {
    await fetchUserData();
  } else {
    isLoading.value = false;
  }
});
</script>