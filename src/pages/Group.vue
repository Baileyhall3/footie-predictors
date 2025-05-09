<template>
  <DoesNotExist v-if="!groupExists && !loading" />
  <!-- Loading State -->
  <LoadingScreen v-if="loading" />
  <div class="container mx-auto py-8" v-else>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
      <p class="font-medium">Error loading group data</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="fetchAllData" class="mt-2 text-sm text-red-700 underline">Try again</button>
    </div>

    <!-- Content (only shown when not loading and no error) -->
    <div v-if="!error && !loading && groupExists">
      <!-- Group Info Section -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex">
          <img 
          :src="group.icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
          <div class="self-end">
            <h2 class="text-2xl font-bold">{{ group.name }}</h2>
          </div>
        </div>
        <p class="text-gray-500 mb-4 mt-4">{{ group.description || 'No description available' }}</p>
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
          <button @click="copyGroupLink" class="px-3 py-1 bg-blue-500 text-white rounded-md" v-if="!notInGroup">
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

      <template v-if="activeGameweek && activeGameweek?.is_finished && Object.keys(gameweekWinner).length > 0">
          <GameweekWinnerCard 
            :username="gameweekWinner.username"
            :totalPoints="gameweekWinner.total_points"
            :isCurrentUser="gameweekWinner.userIsGameweekWinner"
            :weekNumber="activeGameweek?.week_number"
          />
      </template>
    
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
      <div v-if="Object.keys(matches).length > 0">
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup">
            <ScoreCard 
              :matches="matches"
              allowCollapse
              header="Matches"
              :matchesClickable="activeGameweek?.is_locked"
            />
        </div>
      </div>

      <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup && activeGameweek">
        <div v-if="Object.keys(predictions).length > 0">
          <ScoreCard
              :matches="matches"
              :predictions="predictions"
              :locked="activeGameweek?.is_locked"
              :gameweekId="activeGameweek?.id"
              header="Your Predictions"
              showLockedIcon
              allowCollapse
              :matchesClickable="activeGameweek?.is_locked"
              :totalPoints="currentGameweekUserScore"
              @update-prediction="handlePredictionUpdate"
              @predictions-submitted="submitPredictions"
          />
        </div>

        <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
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
            headerText="All-Time"
            previewOnly
            :gameweekId="activeGameweek?.id"
            includeUserPredictionLink
          />
        </div>
        <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
      </div>
    </div>  

    <!-- Stats Section -->
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Your Stats</h3>
          <router-link 
            :to="`/group/${groupId}/stats`" 
            class="text-sm text-blue-600 hover:underline"
            v-if="Object.keys(groupStats).length > 0"
          >
            View All →
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" v-if="Object.keys(groupStats).length > 0">
          <StatRow icon="🔥" label="Avg. Points / Gameweek" :value="groupStats.avg_points_per_gameweek" />
          <StatRow icon="🎯" label="Correct Scores" :value="groupStats.total_correct_scores" />
          <StatRow icon="✅" label="Correct Results" :value="groupStats.total_correct_results" />
          <StatRow icon="📈" label="Score Accuracy" :value="groupStats.correct_score_ratio_percent + '%'" />
        </div>
        <p v-else class="text-gray-500 py-2">No stats data available. 
          <router-link :to="`/group/${group.id}/create-gameweek`" class="text-blue-600 hover:underline">
            Create a gameweek
          </router-link> 
          and start playing to see stats!
        </p>
    </div> 

    <!-- Members Section -->
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="!notInGroup || (notInGroup && group.is_public)">
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
        <MembersCard 
          :members="members"
          :groupOwner="groupOwner"
          :gameweek="activeGameweek"
          @update-admin-status="updateMemberAdminStatus"
          @member-removed="confirmRemoveMember"
        />
      </div>
      <p v-else class="text-gray-500 py-2">No members yet.</p>
    </div>
  </div>

  <PinDialog ref="pinDialog" :groupPin="String(group.group_pin)" @submit-pin="updateMemberStatus(true)" />
  <DeleteConfirm ref="removeMemberConfirm" :title="deleteConfirmTitle" :message="deleteConfirmMsg" :confirmText="deleteConfirmText" />
  <CreateGroupMember ref="createMemberDialog" :groupId="groupId" @user-created="getGroupMembers(); getLeaderboard();" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { groupsStore } from "../store/groupsStore";
import { leaderboardStore } from "../store/leaderboardStore";
import { userStore } from "../store/userStore";
import { gameweeksService } from "../api/gameweeksService";
import { userIsAdmin, userInGroup, userIsGroupOwner } from "../utils/checkPermissions";
import LoadingScreen from "../components/LoadingScreen.vue";
import DateUtils from "../utils/dateUtils";
import { LockClosedIcon, ShareIcon } from "@heroicons/vue/24/solid";
import ScoreCard from "../components/ScoreCard.vue";
import { predictionsService } from '../api/predictionsService';
import PinDialog from "../components/PinDialog.vue";
import DeleteConfirm from "../components/DeleteConfirm.vue";
import CreateGroupMember from "../components/CreateGroupMember.vue";
import LeaderboardCard from "../components/LeaderboardCard.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { footballApiService } from "../api/footballApiService";
import { groupsService } from "../api/groupsService";
import MembersCard from "../components/MembersCard.vue";
import DoesNotExist from "../components/DoesNotExist.vue";
import StatRow from "../components/StatRow.vue";
import GameweekWinnerCard from '../components/GameweekWinnerCard.vue';

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
const notInGroup = ref(true);
const deleteConfirmMsg = ref('');
const deleteConfirmTitle = ref('');
const deleteConfirmText = ref('Confirm');
const leaderboardLastUpdated = ref();
const isAdmin = ref(false);
const isGroupOwner = ref(false);
const groupOwner = ref({});
const activeGameweek = ref({});
const groupExists = ref(true);
const groupStats = ref([]);
const currentGameweekUserScore = ref();
const gameweekWinner = ref({});

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
    console.log(groupError)
    if (groupError && groupError.code === "PGRST116") {
      groupExists.value = false;
      loading.value = false;
      return;
    }
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
    } else {
      notInGroup.value = false;
    }

    isAdmin.value = userIsAdmin(members.value);
    isGroupOwner.value = userIsGroupOwner(group.value);

    const { data: adminData, error: adminError } = await groupsService.getGroupAdmin(groupId.value);
    groupOwner.value = adminData;
    
    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getGameweeks(groupId.value);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    gameweeks.value = gameweeksData || [];

    // Fetch leaderboard
    await getLeaderboard();

    activeGameweek.value = gameweeksData.filter(x => x.is_active)[0];
    if (activeGameweek.value && Object.keys(activeGameweek.value).length > 0) {
      mapPredictions();
    }

    if (activeGameweek.value && activeGameweek.value.is_finished) {
      const { data: winnerData, error: winnerError } = await gameweeksService.getGameweekWinner(activeGameweek.value.id);
      if (winnerError) throw new Error('Failed to load gameweek winner');
      if (Object.keys(winnerData).length > 0) {
        const userIsGameweekWinner = winnerData.user_id === userStore.user?.id;
        gameweekWinner.value = { ...winnerData, userIsGameweekWinner: userIsGameweekWinner }
      }
    }

    if (gameweeks.value.length > 0) {
      const { data: statsData, error: statsError } = await groupsService.getGroupStats(groupId.value, userStore.user?.id);
      if (statsError) throw new Error('Failed to load user stats');
      groupStats.value = statsData[0] || [];
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
    gameweeksService.getMatches(activeGameweek.value.id),
    predictionsService.getUserGameweekPredictions(userStore.user?.id, activeGameweek.value.id)
  ]);

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
      prediction.predicted_home_score ? prediction.predicted_home_score : 0,
      prediction.predicted_away_score ? prediction.predicted_away_score : 0
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
    leaderboardLastUpdated.value = leaderboard.value[0].leaderboard_last_updated ? new Date(leaderboard.value[0].leaderboard_last_updated) : null;
  }

  currentGameweekUserScore.value = leaderboard.value.filter(x => x.user_id === userStore.user?.id)[0].active_gameweek_user_points;
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

