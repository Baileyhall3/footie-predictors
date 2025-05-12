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
      <template v-if="!notInGroup">
        <!-- Group header Section -->
        <div class="px-2 mb-4">
          <!-- Header Row -->
          <div class="flex items-center justify-between gap-4 mb-4 flex-nowrap">
            <!-- Group Icon + Name -->
            <div class="flex items-center gap-3 min-w-0 max-w-full flex-1">
              <img 
                :src="group.icon_url ?? '/images/green-football-md.png'" 
                class="w-10 h-10 flex-shrink-0" 
                alt="Group Logo"
                />
              <h2 class="text-2xl font-bold truncate">{{ group.name }}</h2>
            </div>
  
            <div class="flex flex-wrap gap-2 justify-end flex-shrink-0" v-if="!notInGroup">
              <button @click="copyGroupLink()" class="p-1 rounded-md hover:bg-gray-200">
                <LinkIcon class="size-6 text-blue-500" />
              </button>
              <Dropdown>
                <template #trigger>
                  <EllipsisVerticalIcon class="size-6 text-gray-500" />
                </template>
                <template #items>
                  <router-link :to="`/group/${group.id}/update-group`" v-if="isGroupOwner">
                    <button class="dropdown-item">
                      Edit
                    </button>
                  </router-link>
                  <template v-if="!isGroupOwner">
                    <button @click="updateMemberStatus(false)" 
                      class="dropdown-item text-red-700"
                    >
                      Leave group
                    </button>
                  </template>
  
                </template>
              </Dropdown>
            </div>
          </div>
  
          <!-- Group Description -->
          <p class="text-gray-500">{{ group.description || 'No description available' }}</p>
        </div>
  
        <Tabs>
          <Tab header="Overview" borderColour="black">
            <RoundedContainer headerText="Group Info">
              <p class="text-sm text-gray-600"><span class="font-semibold">Owner:</span> {{ adminName }}</p>
              <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Established:</span> {{ DateUtils.toLongDate(group.created_at) }}</p>
              <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Scoring System:</span> {{ getScoringSystem(group) }}</p>
            </RoundedContainer>
  
            <template v-if="activeGameweek && activeGameweek?.is_finished && Object.keys(gameweekWinner).length > 0">
              <GameweekWinnerCard 
                :username="gameweekWinner.username"
                :totalPoints="gameweekWinner.total_points"
                :isCurrentUser="gameweekWinner.userIsGameweekWinner"
                :weekNumber="activeGameweek?.week_number"
              />
            </template>
  
            <!-- Gameweeks Section -->
            <GroupGameweeks :gameweeks="gameweeks" :groupId="group.id" :isAdmin="isAdmin" />
  
            <!-- Predictions section -->
            <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="activeGameweek">
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
                    :totalPoints="currentUserGameweekData.total_points"
                    @update-prediction="handlePredictionUpdate"
                    @predictions-submitted="submitPredictions"
                />
              </div>
              <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
            </div>
          </Tab>
          <Tab :header="`Gameweek ${activeGameweek.week_number}`" v-if="activeGameweek">
            <RoundedContainer headerText="Gameweek Stats">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatRow icon="🔥" label="Total Points" :value="currentUserGameweekData.total_points" />
                  <StatRow icon="📈" label="Position" :value="currentUserGameweekData.position" />
                  <StatRow icon="🥇" label="Current Leader" :value="currentLeader.username" />
                  <StatRow icon="🎯" label="Most Correct Scores" :value="`${userMostCorrectScores.total_correct_scores} (${userMostCorrectScores.username}) `" />
              </div>
          </RoundedContainer>
            <!-- Matches List -->
            <RoundedContainer v-if="Object.keys(matches).length > 0">
                <ScoreCard 
                  :matches="matches"
                  allowCollapse
                  header="Matches"
                  :matchesClickable="activeGameweek?.is_locked"
                />
            </RoundedContainer>
            <!-- Predictions -->
            <RoundedContainer v-if="activeGameweek">
              <ScoreCard
                  v-if="Object.keys(predictions).length > 0"
                  :matches="matches"
                  :predictions="predictions"
                  :locked="activeGameweek?.is_locked"
                  :gameweekId="activeGameweek?.id"
                  header="Your Predictions"
                  showLockedIcon
                  allowCollapse
                  :matchesClickable="activeGameweek?.is_locked"
                  :totalPoints="currentUserGameweekData.total_points"
                  @update-prediction="handlePredictionUpdate"
                  @predictions-submitted="submitPredictions"
              />
              <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
            </RoundedContainer>
  
            <RoundedContainer headerText="Current Standings">
              <p v-if="gwLeaderboardLastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(gwLeaderboardLastUpdated) }}</p>
              <div v-if="gwLeaderboard.length">
                <LeaderboardCard 
                  :leaderboard="gwLeaderboard"
                  :gameweekId="activeGameweek?.id"
                  :includeUserPredictionLink="activeGameweek?.is_locked"
                />
              </div>
              <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
            </RoundedContainer>
          </Tab>
          <Tab header="Leaderboard">
            <GroupLeaderboard :groupId="group.id" :activeGameweekId="activeGameweek ? activeGameweek.id : null" />
          </Tab>
          <Tab header="Stats" v-if="activeGameweek">
            <CombinedGroupStats :groupId="group.id" />
          </Tab>
          <Tab header="Members">
            <RoundedContainer :headerText="`Members (${members.length})`" v-if="!notInGroup || (notInGroup && group.is_public)">
              <template #headerContent v-if="isAdmin">
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
            </RoundedContainer>
          </Tab>
        </Tabs>
      </template>
      <RoundedContainer v-else class="max-w-xl mx-auto mt-10 text-center">
        <div class="flex justify-center items-center gap-3 min-w-0 max-w-full flex-1 mb-4">
          <img 
            :src="group.icon_url ?? '/images/green-football-md.png'" 
            class="w-10 h-10 flex-shrink-0" 
            alt="Group Logo"
            />
          <h2 class="text-2xl font-bold truncate">{{ group.name }}</h2>
        </div>
        <h2 class="text-xl font-semibold mb-2">You're not part of this group yet</h2>
        <p class="text-gray-600 mb-6">Join now to start predicting, competing on the leaderboard, and more!</p>

        <button @click="tryJoinGroup" 
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
        >
          Join Group
        </button>
      </RoundedContainer>
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
import { ShareIcon, LinkIcon, EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
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
import Tabs from "../components/UI/Tabs.vue";
import Tab from "../components/UI/Tab.vue";
import GroupGameweeks from "../components/GroupGameweeks.vue";
import RoundedContainer from "../components/UI/RoundedContainer.vue";
import CombinedGroupStats from "./CombinedGroupStats.vue";
import GroupLeaderboard from "./GroupLeaderboard.vue";
import Dropdown from "../components/UI/Dropdown.vue";

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
const predictions = ref({});
const matches = ref([]);
const notInGroup = ref(true);
const deleteConfirmMsg = ref('');
const deleteConfirmTitle = ref('');
const deleteConfirmText = ref('Confirm');
const isAdmin = ref(false);
const isGroupOwner = ref(false);
const groupOwner = ref({});
const activeGameweek = ref({});
const groupExists = ref(true);
const gameweekWinner = ref({});
const gwLeaderboard = ref([]);
const gwLeaderboardLastUpdated = ref();
const currentLeader = ref({});
const currentUserGameweekData = ref({});
const userMostCorrectScores = ref({});

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

    
    activeGameweek.value = gameweeksData.filter(x => x.is_active)[0];
    if (activeGameweek.value && Object.keys(activeGameweek.value).length > 0) {
      mapPredictions();
    }
    
    // Fetch leaderboard
    await getLeaderboard();

    if (activeGameweek.value && activeGameweek.value.is_finished) {
      const { data: winnerData, error: winnerError } = await gameweeksService.getGameweekWinner(activeGameweek.value.id);
      if (winnerError) throw new Error('Failed to load gameweek winner');
      if (Object.keys(winnerData).length > 0) {
        const userIsGameweekWinner = winnerData.user_id === userStore.user?.id;
        gameweekWinner.value = { ...winnerData, userIsGameweekWinner: userIsGameweekWinner }
      }
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
  if (activeGameweek.value) {
    // Fetch current gameweek leaderboard
    const { data: scoresData, error: scoresError } = await leaderboardStore.fetchGameweekScores(groupId.value, activeGameweek.value.id);
    if (scoresError) throw new Error('Failed to load gameweek leaderboard');
    gwLeaderboard.value = scoresData || [];

    userMostCorrectScores.value = gwLeaderboard.value.reduce((max, user) => {
      return user.total_correct_scores > max.total_correct_scores ? user : max;
    }, gwLeaderboard.value[0]);

    currentUserGameweekData.value = gwLeaderboard.value.find(x => x.user_id == userStore.user?.id);
    currentLeader.value = gwLeaderboard.value.find(x => x.position == 1);
    
    if (gwLeaderboard.value.length > 0) {
      gwLeaderboardLastUpdated.value = gwLeaderboard.value[0].updated_at ? new Date(gwLeaderboard.value[0].updated_at) : null;
    }
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

