<template>
  <div class="container mx-auto px-6 py-8">
    <!-- Loading State -->
    <LoadingScreen v-if="loading" />

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
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
        <p class="text-sm text-gray-600">Established: {{ DateUtils.toLongDate(group.created_at) }}</p>
    
        <!-- Admin Controls (only visible to the admin) -->
        <div v-if="isAdmin" class="mt-4 flex flex-wrap gap-2">
          <router-link :to="`/group/${group.id}/update-group`">
            <button @click="editGroup" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Edit Group
            </button>
          </router-link>
          <button @click="showAddMemberModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Add Member
          </button>
          <router-link :to="`/group/${group.id}/create-gameweek`">
            <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              Add Gameweek
            </button>
          </router-link>
        </div>
      </div>
    
      <!-- Gameweeks Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Gameweeks</h3>
          <router-link :to="`/group/${group.id}/create-gameweek`">
            <button 
              v-if="isAdmin" 
              class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              + Add Gameweek
            </button>
          </router-link>
        </div>
        
        <div v-if="gameweeks.length">
          <div v-for="gameweek in gameweeks" :key="gameweek.id" class="flex justify-between items-center border-b py-3">
            <div>
              <router-link :to="`/gameweek/${gameweek.id}`" class="text-blue-600 hover:underline font-medium">
                Gameweek {{ gameweek.week_number }}
              </router-link>
              <div class="text-sm text-gray-500">
                Deadline: {{ DateUtils.toFullDateTime(gameweek.deadline) }}
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <div v-if="gameweek.is_active" class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full transition">
                Active
              </div>
              <div v-if="gameweek.is_locked" class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full transition">
                Locked
              </div>

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

      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <div class="items-center flex">
            <h3 class="text-xl font-semibold">Your Predictions</h3>
            <LockClosedIcon class="size-5 ms-2" v-if="gameweekIsLocked" />
          </div>
          <router-link 
            :to="`/leaderboards?group=${groupId}`" 
            v-if="gameweekIsLocked"
            class="text-sm text-blue-600 hover:underline"
          >
            View All Predictions →
          </router-link>
        </div>

        <div v-if="predictions?.length">
            <div v-for="(matchGroup, day) in groupedMatches" :key="day" class="mt-6">
              <!-- Date Heading -->
              <h3 class="text-lg mb-2">{{ day }}</h3>

              <div v-for="match in matchGroup" :key="match.id" class="flex flex-col items-center justify-center py-2 bg-gray-100 mt-2 rounded-md">
                <!-- Match Info (Score Row) -->
                <div class="flex items-center justify-center w-full max-w-lg">
                    <!-- Home Team and Score -->
                    <div class="flex items-center space-x-2 w-1/3 justify-end">
                        <span class="font-medium">{{ match.home_team }}</span>
                        <span class="text-lg font-bold">{{ match.predicted_home_score }}</span>
                    </div>

                    <!-- Vertical Line (centered) -->
                    <div class="border-l border-gray-300 h-8 mx-4"></div>

                    <!-- Away Team and Score -->
                    <div class="flex items-center space-x-2 w-1/3 justify-start">
                        <span class="text-lg font-bold">{{ match.predicted_away_score }}</span>
                        <span class="font-medium">{{ match.away_team }}</span>
                    </div>
                </div>

                <!-- Match Time (Now Below Score Row) -->
                <div class="text-gray-500 text-sm mt-1">
                  {{ DateUtils.toTime(match.match_time) }}
                </div>
              </div>

            </div>
        </div>

        <p v-else class="text-gray-500 text-sm">No predictions made for this gameweek yet.</p>
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
import { userIsAdmin } from "../utils/checkPermissions";
import LoadingScreen from "../components/LoadingScreen.vue";
import DateUtils from "../utils/dateUtils";
import { predictionsStore } from '../store/predictionsStore';
import { LockClosedIcon } from "@heroicons/vue/24/solid";

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
const predictions = ref([]);
const gameweekIsLocked = ref(false)

// Computed properties
const isAdmin = ref(false);

const adminName = computed(() => {
  const admin = members.value.find(member => member.is_admin);
  return admin ? admin.username : 'Unknown';
});

const groupedMatches = computed(() => {
  return predictions?.value.reduce((acc, match) => {
    const matchDay = DateUtils.toShortDayMonth(match.match_time); // "Mon Dec 30"

    if (!acc[matchDay]) {
      acc[matchDay] = [];
    }
    acc[matchDay].push(match);
    
    return acc;
  }, {});
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

    isAdmin.value = userIsAdmin(members.value);
    
    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    gameweeks.value = gameweeksData || [];

    
    // Ftech user predictions for active gameweek
    const activeGameweek = gameweeksData.filter(x => x.is_active);

    const { data: predictionsData, error: predictionsError } = await predictionsStore.fetchUserPredictions(activeGameweek[0].id);
    if (predictionsError) throw new Error('Failed to load predictions');
    predictions.value = predictionsData || [];

    debugger

    gameweekIsLocked.value = activeGameweek[0].is_locked;
    
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

// Admin functions
const editGroup = () => {
  router.push(`/edit-group/${groupId.value}`);
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
