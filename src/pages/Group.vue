<template>
  <div class="container mx-auto py-8">
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
        <p class="text-sm text-gray-600"><span class="font-semibold">Owner:</span> {{ adminName }}</p>
        <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Established:</span> {{ DateUtils.toLongDate(group.created_at) }}</p>
        <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Scoring System:</span> {{ getScoringSystem(group) }}</p>

        <!-- Admin Controls (only visible to the admin) -->
        <div class="mt-4 flex flex-wrap gap-2">
          <router-link :to="`/group/${group.id}/update-group`" v-if="isGroupOwner">
            <button class="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition">
              Edit
            </button>
          </router-link>
          <button @click="copyGroupLink" class="px-3 py-1 bg-blue-500 text-white rounded-md">
            <div class="justify-between items-center flex">
              Share
              <ShareIcon class="text-white size-4 ms-2" />
            </div>
          </button>
          <template v-if="!isGroupOwner">
            <button v-if="notInGroup" @click="tryJoinGroup()" class="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition">
                Join
            </button>
            <button v-else @click="updateMemberStatus(false)" class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition">
                Leave
            </button>
          </template>
        </div>
      </div>
    
      <!-- Gameweeks Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup">
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
              <div class="items-center flex">
                <router-link :to="`/gameweek/${gameweek.id}`" class="text-blue-600 hover:underline font-medium">
                  Gameweek {{ gameweek.week_number }}
                </router-link>
                <LockClosedIcon class="size-4 ms-2" v-if="gameweek.is_locked" />
              </div>
              <div class="text-sm text-gray-500">
                Deadline: {{ DateUtils.toFullDateTime(gameweek.deadline) }}
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <div v-if="gameweek.is_active" class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full transition">
                Active
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 py-2">No gameweeks yet.</p>
      </div>

      <!-- Matches List -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup">
          <ScoreCard 
              :matches="matches"
              allowCollapse
              header="Match Results"
          />
      </div>

      <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup">
        <div class="flex justify-between items-center mb-4">
          <div class="items-center flex">
            <h3 class="text-xl font-semibold">Your Predictions</h3>
            <LockClosedIcon class="size-5 ms-2" v-if="gameweekIsLocked" />
          </div>
          <router-link 
            :to="`/gameweek-predictions/${currentGameweekId}`" 
            v-if="gameweekIsLocked"
            class="text-sm text-blue-600 hover:underline"
          >
            View All →
          </router-link>
        </div>

        <div v-if="Object.keys(predictions).length > 0">
          <ScoreCard
              :matches="matches"
              :predictions="predictions"
              :locked="gameweekIsLocked"
              @update-prediction="handlePredictionUpdate"
              @predictions-submitted="submitPredictions"
          />
        </div>

        <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
      </div>
    
      <!-- Members Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Members ({{ members.length }})</h3>
          <template v-if="isAdmin">
            <button 
              v-if="members.length != group.max_members" 
              @click="openCreateMemberDialog()"
              class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              + Add Member
            </button>
            <button 
              v-else
              class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded transition cursor-default"
            >
              Max Members Reached
            </button>
          </template>
        </div>
        
        <div v-if="members.length">
          <div v-for="member in members" :key="member.id" class="flex justify-between items-center border-b py-3">
            <div class="flex items-center space-x-2">
              <UserIcon class="text-gray-500 size-4" />
              <span >{{ member.username }}</span>
              <span v-if="member.id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
              <span v-if="member.is_admin" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Admin</span>
            </div>
            
            <div v-if="isAdmin && userStore.user.id !== member.id" class="relative flex items-center gap-2">
              <!-- Ellipsis Dropdown -->
              <div class="relative">
                <button @click="toggleDropdown(member.id)" class="p-1 rounded-md hover:bg-gray-200" :class="{'bg-gray-200': openMembersDropdown === member.id}">
                  <EllipsisHorizontalIcon class="size-6 text-gray-500" />
                </button>

                <!-- Dropdown Menu -->
                <Transition name="fade-slide">
                  <div v-if="openMembersDropdown === member.id" 
                    class="absolute right-0 w-32 bg-white shadow-lg rounded-md border z-50"
                  >
                    <button 
                      @click="updateMemberAdminStatus(member)" 
                      class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-200"
                    >
                      {{ member.is_admin ? 'Remove Admin' : 'Make Admin' }}
                    </button>

                    <router-link 
                      v-if="member.is_fake && !gameweekIsLocked" 
                      :to="`/admin-gameweek-predictions/${currentGameweekId}/${member.id}`"
                      class="block px-4 py-2 text-sm  hover:bg-gray-200"
                    >
                      Predict
                    </router-link>

                    <button 
                      @click="confirmRemoveMember(member)" 
                      class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-200"
                    >
                      Remove
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 py-2">No members yet.</p>
      </div>
    
      <!-- Leaderboard Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Leaderboard</h3>
          <router-link 
            :to="`/group/${groupId}/leaderboards`" 
            class="text-sm text-blue-600 hover:underline"
          >
            View Full Leaderboard →
          </router-link>
        </div>

        <p v-if="leaderboardLastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(leaderboardLastUpdated) }}</p>

        <div v-if="leaderboard.length">
          <LeaderboardCard 
            :leaderboard="leaderboard"
          />
        </div>
        <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
      </div>
    </div>  
  </div>

  <PinDialog ref="pinDialog" :groupPin="String(group.group_pin)" @submit-pin="updateMemberStatus(true)" />
  <DeleteConfirm ref="removeMemberConfirm" :title="deleteConfirmTitle" :message="deleteConfirmMsg" :confirmText="deleteConfirmText" />
  <CreateGroupMember ref="createMemberDialog" :groupId="groupId" @user-created="getGroupMembers(); getLeaderboard();" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { UserIcon } from "@heroicons/vue/24/outline";
import { groupsStore } from "../store/groupsStore";
import { leaderboardStore } from "../store/leaderboardStore";
import { userStore } from "../store/userStore";
import { gameweeksService } from "../api/gameweeksService";
import { userIsAdmin, userInGroup, userIsGroupOwner } from "../utils/checkPermissions";
import LoadingScreen from "../components/LoadingScreen.vue";
import DateUtils from "../utils/dateUtils";
import { LockClosedIcon, ShareIcon, EllipsisHorizontalIcon } from "@heroicons/vue/24/solid";
import ScoreCard from "../components/ScoreCard.vue";
import { predictionsService } from '../api/predictionsService';
import PinDialog from "../components/PinDialog.vue";
import DeleteConfirm from "../components/DeleteConfirm.vue";
import CreateGroupMember from "../components/CreateGroupMember.vue";
import LeaderboardCard from "../components/LeaderboardCard.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { footballApiService } from "../api/footballApiService";

const route = useRoute();
const router = useRouter();

const pinDialog = ref(null);
const removeMemberConfirm = ref(null);
const createMemberDialog = ref(null);

// State
const loading = ref(true);
const error = ref(null);
const groupId = ref(null);
const group = ref({});
const members = ref([]);
const gameweeks = ref([]);
const leaderboard = ref([]);
const predictions = ref({});
const matches = ref([]);
const gameweekIsLocked = ref(false);
const currentGameweekId = ref();
const notInGroup = ref(false);
const deleteConfirmMsg = ref('');
const deleteConfirmTitle = ref('');
const deleteConfirmText = ref('Confirm');
const leaderboardLastUpdated = ref();
const openMembersDropdown = ref(null);
const isAdmin = ref(false);
const isGroupOwner = ref(false);

const adminName = computed(() => {
  const admin = members.value.find(member => member.is_admin);
  return admin ? admin.username : 'Unknown';
});

const toggleDropdown = (memberId) => {
  openMembersDropdown.value = openMembersDropdown.value === memberId ? null : memberId;
};

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".relative")) {
    openMembersDropdown.value = null;
  }
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
    await getGroupMembers();

    // Check if user is in the group
    const isMember = userInGroup(members.value)
    if (!isMember) {
      loading.value = false;
      notInGroup.value = true;
      return;
    }

    isAdmin.value = userIsAdmin(members.value);
    isGroupOwner.value = userIsGroupOwner(group.value);
    
    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    gameweeks.value = gameweeksData || [];

    // Fetch leaderboard
    await getLeaderboard();

    const activeGameweek = gameweeksData.filter(x => x.is_active);
    if (activeGameweek.length > 0) {
      currentGameweekId.value = activeGameweek[0].id;
      gameweekIsLocked.value = activeGameweek[0].is_locked;
      mapPredictions();
      // await footballApiService.updateMatchScores(currentGameweekId.value);
    }

  } catch (err) {
    console.error('Error fetching group data:', err);
    error.value = err.message || 'An error occurred while loading group data';
  } finally {
    loading.value = false;
  }
};

async function mapPredictions() {
  // Fetch both matches and predictions
  const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
    gameweeksService.getMatches(currentGameweekId.value),
    predictionsService.getUserGameweekPredictions(userStore.user?.id, currentGameweekId.value)
  ]);

  // if (predictionsData.length === 0) { return; }

  // Map predictions by match_id for quick lookup
  const predictionsMap = predictionsData.reduce((acc, prediction) => {
    acc[prediction.match_id] = prediction;
    return acc;
  }, {});

  // Merge predictions into matches
  matches.value = matchData.map(match => ({
    ...match,
    api_match_id: match.api_match_id,
    previous_home_score: match.final_home_score, // Store initial score
    previous_away_score: match.final_away_score,
    predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? '',
    predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? '',
    prediction_id: predictionsMap[match.id]?.id || null,
    home_team_crest: match.homeClub?.crest_url,
    away_team_crest: match.awayClub?.crest_url
  }));

  // Initialize predictions object for v-model binding
  predictions.value = matches.value.reduce((acc, match) => {
    acc[match.id] = {
      predicted_home_score: match.predicted_home_score,
      predicted_away_score: match.predicted_away_score
    };
    return acc;
  }, {});

  loading.value = false;

}

const handlePredictionUpdate = ({ matchId, field, value }) => {
    if (!predictions.value[matchId]) {
        predictions.value[matchId] = { predicted_home_score: 0, predicted_away_score: 0 };
    }
    predictions.value[matchId][field] = value;
};

async function submitPredictions() {
  loading.value = true;

  for (const [matchId, prediction] of Object.entries(predictions.value)) {
    await predictionsService.savePrediction(
      userStore.user?.id, 
      matchId, 
      prediction.predicted_home_score,
      prediction.predicted_away_score 
    );
  }

  toast("Your predictions have been saved!", {
    "type": "success",
    "position": "top-center"
  });

  loading.value = false;
}

const updateMemberAdminStatus = async (member) => {
  await groupsStore.updateMemberRole(member.membership_id, !member.is_admin, groupId.value);

  toast("User admin status updated!", { // TODO: Make toast more intuitative
    "type": "success",
    "position": "top-center"
  });

  // Refresh members list
  getGroupMembers();
}

const confirmRemoveMember = async (member) => {
  deleteConfirmMsg.value = `Are you sure you want to remove ${member.username} from the group? ${member.is_fake ? ' This will also delete this user.' : ''}`;
  deleteConfirmTitle.value = 'Remove Member';
  deleteConfirmText.value = 'Confirm';
  const confirmed = await removeMemberConfirm.value?.show();
  if (confirmed) {
    try {
      removeMember(member);
    } catch (err) {
      console.error(err);
    }
  }
};

async function tryJoinGroup() {
  if (group.value.max_members === members.value.length) {
    toast("Unable to join group as it has reached maximum members.", {
      "type": "error",
      "position": "top-center"
    })
    return;
  }
  if (group.value.is_public) {
      updateMemberStatus(true);
  } else {
    await pinDialog.value?.show();
  }
}

async function updateMemberStatus(isJoining) {
  if (isJoining) {
    try {
      const { success, error: joinError } = await groupsStore.addMember(
        groupId.value,
        userStore.user.id
      );
  
      if (joinError) throw new Error('Failed to join group');
      else {
        toast("Successfully joined group!", {
          "type": "success",
          "position": "top-center"
        });
        window.location.reload();
      }
    } catch(err) {
      error.value = err.message || 'An error occurred while joining group';
    }

  } else {
    const userMembership = members.value.filter(x => x.id === userStore.user.id);
    deleteConfirmMsg.value = `Are you sure you want to leave ${group.value.name}? All of your leaderboard data will be erased.`;
    deleteConfirmTitle.value = 'Leave Group';
    deleteConfirmText.value = 'Leave';
    const confirmed = await removeMemberConfirm.value?.show();
    if (confirmed) {
      try {
        const { success, error: leaveError } = await groupsStore.removeMember(
          userMembership[0].membership_id, 
          groupId.value
        );
    
        if (leaveError) throw new Error('Failed to leave group');
        else {
          toast("Successfully left group.", {
            "type": "success",
            "position": "top-center"
          });
          router.push(`/groups`);
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while leaving group';
      }
    }
  }
}

const removeMember = async (member) => {
  let memberUserId = member.is_fake ? member.id : null;
  try {
    loading.value = true;
    
    const { success, error: removeError } = await groupsStore.removeMember(
      member.membership_id, 
      groupId.value,
      memberUserId
    );
    
    if (removeError) throw new Error('Failed to remove member');

    // Refresh members list
    getGroupMembers();
    
    // Refresh leaderboard
    getLeaderboard();
    members.value = groupsStore.groupMembers;
  } catch (err) {
    error.value = err.message || 'An error occurred while removing member';
  } finally {
    loading.value = false;
  }
};

async function getGroupMembers() {
  const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(groupId.value);
  if (membersError) throw new Error('Failed to load group members');
  members.value = membersData || [];
}

async function getLeaderboard() {
  const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(groupId.value);
  if (leaderboardError) throw new Error('Failed to load leaderboard');
  leaderboard.value = leaderboardData || [];

  if (leaderboard.value.length > 0) {
    leaderboardLastUpdated.value = new Date(leaderboard.value[0].last_updated);
  }
}

const openCreateMemberDialog = async() => {
  await createMemberDialog.value.show();
}

function copyGroupLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  toast("Group link copied!", {
    "type": "info",
    "position": "top-center"
  });
}

function getScoringSystem(group) {
  if (group.exact_score_points == 3 && group.correct_result_points == 1 && group.incorrect_points == 0) {
    return `Classic (3 points for correct score, 1 point for correct result)`;
  } else {
    return `Custom (${group.exact_score_points} points for correct score, ${group.correct_result_points} for correct result and ${group.incorrect_points} for incorrect result)`;
  }
}

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
/* Fade and slide-down effect */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

