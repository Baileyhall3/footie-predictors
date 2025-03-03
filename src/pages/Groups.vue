<template>
    <div class="container mx-auto px-6 py-8">
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Your Groups</h2>
                <router-link to="/create-group">
                    <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        + Create Group
                    </button>
                </router-link>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GroupCard v-for="group in userGroups" :key="group.id" :group="group" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GroupCard from "../components/GroupCard.vue";
import { getUserGroups } from "../api/groups";

const userGroups = ref([]);

onMounted(() => {
  userGroups.value = getUserGroups();
});
</script>