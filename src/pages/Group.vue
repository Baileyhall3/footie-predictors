<template>
    <div class="container mx-auto px-6 py-8">
      <!-- Group Info Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 class="text-2xl font-bold mb-2">{{ group.name }}</h2>
        <p class="text-gray-500 mb-4">{{ group.description }}</p>
        <p class="text-sm text-gray-600">Admin: {{ groupAdmin }}</p>
        <p class="text-sm text-gray-600">Established: {{ formattedDate(group.created_at) }}</p>
  
        <!-- Admin Controls (only visible to the admin) -->
        <div v-if="isAdmin" class="mt-4">
          <button @click="editGroup" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Edit Group
          </button>
          <button @click="deleteGroup" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ml-4">
            Delete Group
          </button>
        </div>
      </div>
  
      <!-- Gameweeks Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4">Gameweeks</h3>
        <div v-if="gameweeks.length">
          <div v-for="gameweek in gameweeks" :key="gameweek.id" class="flex justify-between items-center border-b py-2">
            <router-link :to="'/gameweek/' + gameweek.id" class="text-blue-600 hover:underline">
              Gameweek {{ gameweek.number }} - {{ gameweek.winner }} - {{ gameweek.date }}
            </router-link>
          </div>
        </div>
        <p v-else class="text-gray-500">No gameweeks yet.</p>
      </div>
  
      <!-- Members Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4">Members ({{ group.members?.length }})</h3>
        <div v-if="group.members?.length">
          <div v-for="member in group.members" :key="member.id" class="flex items-center space-x-2 py-2">
            <UserIcon class="text-gray-500 size-4" />
            <span class="text-lg">{{ member.username }}</span>
          </div>
        </div>
        <p v-else class="text-gray-500">No members yet.</p>
      </div>
  
      <!-- Leaderboard Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4">Leaderboard</h3>
        <div v-if="leaderboard.length">
          <div v-for="(player, index) in leaderboard" :key="player.id" class="flex justify-between items-center border-b py-2">
            
            <span>{{ index + 1 + '. ' + player.username }}</span>
            <span>{{ player.points }} Points</span>
          </div>
        </div>
        <p v-else class="text-gray-500">No leaderboard data available.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { UserIcon } from "@heroicons/vue/24/outline";
  
  const route = useRoute();
  const router = useRouter();
  
  const group = ref({});
  const gameweeks = ref([]);
  const leaderboard = ref([]);
  const isAdmin = ref(false);
  const groupAdmin = ref('');
  
  // Fetch the group, gameweeks, leaderboard data
  onMounted(() => {
    // fetchGroupData(route.query.id);
    // fetchGameweeks(route.query.id);
    // fetchLeaderboard(route.query.id);
    fetchGroupData(1);
    fetchGameweeks(1);
    fetchLeaderboard(1);
  });
  
  // Fetch the group data based on ID
  const fetchGroupData = (groupId) => {
    group.value = {
      id: groupId,
      name: "Craig's Footie Predictors",
      description: "A group for gambling addicts to get their weekly fix.",
      created_at: "2024-01-15",
      members: [
        { id: 1, username: "Craig Nicholson", admin: true },
        { id: 2, username: "Bailey Hall" },
      ],
    };    

    const memberAdmin = group.value.members.filter(x => x.admin == true);
    groupAdmin.value = memberAdmin[0].username;  
  };
  
  const fetchGameweeks = (groupId) => {
    // Simulate fetching gameweeks (replace with actual API call)
    gameweeks.value = [
      { id: 1, number: 1, winner: "Bailey Hall", date: "2024-01-20" },
      { id: 2, number: 2, winner: "Bailey Hall", date: "2024-01-27" },
    ];
  };
  
  const fetchLeaderboard = (groupId) => {
    // Simulate fetching leaderboard data (replace with actual API call)
    leaderboard.value = [
      { id: 1, username: "Bailey Hall", points: 10 },
      { id: 2, username: "Craig Nicholson", points: 8 },
    ];
  };
  
  // Format the creation date
  const formattedDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };
  
  // Handle edit group
  const editGroup = () => {
    console.log("Editing group...");
    // Redirect to edit group page (implement the actual route)
    router.push(`/edit-group/${group.value.id}`);
  };
  
  // Handle delete group
  const deleteGroup = () => {
    console.log("Deleting group...");
    // Implement delete logic here
  };
  </script>
  
  <style scoped>
  /* Custom styles */
  </style>
  