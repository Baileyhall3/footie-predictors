<template>
  <div class="container mx-auto px-6 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
      <p class="font-medium">Error loading group data</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="fetchAllData" class="mt-2 text-sm text-red-700 underline">Try again</button>
    </div>

    <!-- Content (only shown when not loading and no error) -->
    <div v-else>
      <!-- Group Info Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 class="text-2xl font-bold mb-2">{{ group.name }}</h2>
        <p class="text-gray-500 mb-4">{{ group.description || 'No description available' }}</p>
        <p class="text-sm text-gray-600">Admin: {{ adminName }}</p>
        <p class="text-sm text-gray-600">Established: {{ formattedDate(group.created_at) }}</p>
    
        <!-- Admin Controls (only visible to the admin) -->
        <div v-if="isAdmin" class="mt-4 flex flex-wrap gap-2">
          <button @click="editGroup" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Edit Group
          </button>
          <button @click="showAddMemberModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Add Member
          </button>
          <router-link :to="`/group/${group.id}/create-gameweek`">
            <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              Add Gameweek
            </button>
          </router-link>
          <button @click="confirmDeleteGroup" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Delete Group
          </button>
        </div>
      </div>
    
      <!-- Gameweeks Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Gameweeks</h3>
          <button 
            v-if="isAdmin" 
            @click="showAddGameweekModal = true"
            class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
          >
            + Add Gameweek
          </button>
        </div>
        
        <div v-if="gameweeks.length">
          <div v-for="gameweek in gameweeks" :key="gameweek.id" class="flex justify-between items-center border-b py-3">
            <div>
              <router-link :to="`/gameweek/${gameweek.id}`" class="text-blue-600 hover:underline font-medium">
                Gameweek {{ gameweek.week_number }}
              </router-link>
              <div class="text-sm text-gray-500">
                Deadline: {{ formattedDate(gameweek.deadline) }}
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <router-link 
                :to="`/predictions?gameweek=${gameweek.id}`" 
                class="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition"
              >
                Predictions
              </router-link>
              
              <router-link 
                :to="`/leaderboards?gameweek=${gameweek.id}`" 
                class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition"
              >
                Results
              </router-link>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 py-2">No gameweeks yet.</p>
      </div>
    
      <!-- Members Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Members ({{ members.length }})</h3>
          <button 
            v-if="isAdmin" 
            @click="showAddMemberModal = true"
            class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
          >
            + Add Member
          </button>
        </div>
        
        <div v-if="members.length">
          <div v-for="member in members" :key="member.id" class="flex justify-between items-center border-b py-3">
            <div class="flex items-center space-x-2">
              <UserIcon class="text-gray-500 size-4" />
              <span class="text-lg">{{ member.username }}</span>
              <span v-if="member.is_admin" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Admin</span>
            </div>
            
            <div v-if="isAdmin && userStore.user.id !== member.id" class="flex items-center gap-2">
              <button 
                @click="toggleAdminRole(member)" 
                class="text-xs px-2 py-1 rounded"
                :class="member.is_admin ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
              >
                {{ member.is_admin ? 'Remove Admin' : 'Make Admin' }}
              </button>
              
              <button 
                @click="confirmRemoveMember(member)" 
                class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 py-2">No members yet.</p>
      </div>
    
      <!-- Leaderboard Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Leaderboard</h3>
          <router-link 
            :to="`/leaderboards?group=${groupId}`" 
            class="text-sm text-blue-600 hover:underline"
          >
            View Full Leaderboard →
          </router-link>
        </div>
        
        <div v-if="leaderboard.length">
          <div v-for="player in leaderboard" :key="player.id" class="flex justify-between items-center border-b py-3">
            <div class="flex items-center gap-2">
              <span class="font-medium w-6 text-center">{{ player.position }}.</span>
              <span>{{ player.username }}</span>
              <span v-if="player.user_id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
            </div>
            
            <div class="text-right">
              <span class="font-semibold text-green-600">{{ player.total_points }} pts</span>
              <div class="text-xs text-gray-500">
                {{ player.total_correct_scores }} exact scores
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
      </div>
    </div>

    <!-- Add Member Modal (hidden by default) -->
    <!-- You can implement this modal later -->

    <!-- Add Gameweek Modal (hidden by default) -->
    <!-- You can implement this modal later -->

    <!-- Delete Confirmation Modal (hidden by default) -->
    <!-- You can implement this modal later -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { UserIcon } from "@heroicons/vue/24/outline";
import { groupsStore } from "../store/groupsStore";
import { leaderboardStore } from "../store/leaderboardStore";
import { userStore } from "../store/userStore";
import { gameweeksService } from "../api/gameweeksService";

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const groupId = ref(null);
const group = ref({});
const members = ref([]);
const gameweeks = ref([]);
const leaderboard = ref([]);
const showAddMemberModal = ref(false);
const showAddGameweekModal = ref(false);
const showDeleteConfirmation = ref(false);

// Computed properties
const isAdmin = computed(() => {
  return members.value.some(member => 
    member.id === userStore.user?.id && member.is_admin
  );
});

const adminName = computed(() => {
  const admin = members.value.find(member => member.is_admin);
  return admin ? admin.username : 'Unknown';
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
    
    // Fetch group members
    const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(groupId.value);
    if (membersError) throw new Error('Failed to load group members');
    members.value = membersData || [];
    
    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    gameweeks.value = gameweeksData || [];
    
    // Fetch leaderboard
    const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(groupId.value);
    if (leaderboardError) throw new Error('Failed to load leaderboard');
    leaderboard.value = leaderboardData || [];
    
  } catch (err) {
    console.error('Error fetching group data:', err);
    error.value = err.message || 'An error occurred while loading group data';
  } finally {
    loading.value = false;
  }
};

// Format the creation date
const formattedDate = (date) => {
  if (!date) return 'Unknown';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Add date utils class

// Admin functions
const editGroup = () => {
  router.push(`/edit-group/${groupId.value}`);
};

const confirmDeleteGroup = () => {
  showDeleteConfirmation.value = true;
};

const deleteGroup = async () => {
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
};

const toggleAdminRole = async (member) => {
  try {
    loading.value = true;
    
    const { data, error: updateError } = await groupsStore.updateMemberRole(
      member.membership_id, 
      !member.is_admin, 
      groupId.value
    );
    
    if (updateError) throw new Error('Failed to update member role');
    
    // Refresh members list
    await groupsStore.fetchGroupMembers(groupId.value);
    members.value = groupsStore.groupMembers;
  } catch (err) {
    error.value = err.message || 'An error occurred while updating member role';
  } finally {
    loading.value = false;
  }
};

const confirmRemoveMember = (member) => {
  if (confirm(`Are you sure you want to remove ${member.username} from the group?`)) {
    removeMember(member);
  }
};

const removeMember = async (member) => {
  try {
    loading.value = true;
    
    const { success, error: removeError } = await groupsStore.removeMember(
      member.membership_id, 
      groupId.value
    );
    
    if (removeError) throw new Error('Failed to remove member');
    
    // Refresh members list
    await groupsStore.fetchGroupMembers(groupId.value);
    members.value = groupsStore.groupMembers;
  } catch (err) {
    error.value = err.message || 'An error occurred while removing member';
  } finally {
    loading.value = false;
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
/* Custom styles */
</style>
