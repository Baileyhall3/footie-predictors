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
      <template v-if="group?.iAmMember && !group?.joinRequestSent">
        <!-- Group header Section -->
         <PageHeader>
          <template #header>
            <img 
              :src="group?.icon_url ?? '/images/green-football-md.png'" 
              class="w-10 h-10 flex-shrink-0" 
              alt="Group Logo"
            />
            <h2 class="text-2xl font-bold truncate">{{ group?.name }}</h2>
          </template>
          <template #actionItems>
              <button @click="copyPageLink('Group')" class="p-1 rounded-md hover:bg-gray-200" title="Copy group link">
                <LinkIcon class="size-6 text-blue-500" />
              </button>
              <Dropdown>
                <template #trigger>
                  <EllipsisVerticalIcon class="size-6 text-gray-500" />
                </template>
                <template #items>
                  <router-link :to="`/gameweek/${activeGameweek?.id}`" class="text-blue-600 dropdown-item item-separator" v-if="activeGameweek">
                    Gameweek {{ activeGameweek?.week_number }}
                  </router-link>
                  <router-link :to="`/season/${activeSeason?.id}`" class="text-blue-600 dropdown-item item-separator" v-if="activeSeason">
                    {{ activeSeason?.name }}
                  </router-link>
                  <router-link :to="`/user-group-profile/${groupId}/${userStore.user?.id}`" class="text-blue-600 dropdown-item item-separator">
                    My Group Profile
                  </router-link>
                  <router-link :to="`/group/${groupId}/notifications`" class="text-blue-600 dropdown-item item-separator">
                    Notifications
                  </router-link>
                  <template v-if="group?.iAmAdmin">
                    <router-link :to="`/group/${group?.id}/admin-view`" >
                      <button class="dropdown-item item-separator text-blue-600 ">
                        Admin View
                      </button>
                    </router-link>
                    <button class="dropdown-item item-separator" @click="createNotificationDialog.show()">
                      Create Notification
                    </button>
                  </template>
                  <template v-if="group?.iAmOwner">
                     <router-link :to="`/group/${group?.id}/update-group`" >
                       <button class="dropdown-item item-separator">
                         Edit
                       </button>
                     </router-link>
                     <router-link :to="`/group/${group?.id}/create-gameweek`" v-if="!activeSeason?.is_finished">
                       <button class="dropdown-item item-separator">
                         Create Gameweek
                       </button>
                     </router-link>
                     <router-link :to="`/group/${group?.id}/create-season`">
                       <button class="dropdown-item">
                         New season
                       </button>
                     </router-link>
                  </template>
                  <template v-else>
                    <button @click="updateMemberStatus(false, false)" 
                      class="dropdown-item text-red-700"
                    >
                      Leave Group
                    </button>
                  </template>
                </template>
              </Dropdown>
          </template>
          <template #details>
            <p class="text-gray-500" v-if="group?.description">{{ group?.description }}</p>
          </template>
        </PageHeader>
        <Tabs>
          <Tab header="Overview">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-8">
              <RoundedContainer headerText="Group Info">
                <p class="text-sm text-gray-600"><span class="font-semibold">Owner:</span> {{ group?.owner }}</p>
                <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Established:</span> {{ DateUtils.toLongDate(group?.created_at) }}</p>
                <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Scoring System:</span> {{ getScoringSystem(group) }}</p>
              </RoundedContainer>
              <RoundedContainer>
                <template #header>
                    <h3 class="text-xl font-semibold">
                        <router-link 
                            :to="`/season/${activeSeason?.id}`" 
                            class="text-blue-600 hover:underline"
                        >
                            {{ activeSeason?.name }}
                        </router-link>
                    </h3>
                </template>
                <div class="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div class="flex flex-col">
                    <span class="opacity-75">Start&nbsp;Date</span>
                    <span class="font-medium">
                      {{ activeSeason?.start_date ? DateUtils.toShortDate(activeSeason.start_date) : 'TBD' }}
                    </span>
                  </div>
  
                  <div class="flex flex-col">
                    <span class="opacity-75">End&nbsp;Date</span>
                    <span class="font-medium">
                      {{ activeSeason?.end_date ? DateUtils.toShortDate(activeSeason.end_date) : '—' }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-gray-500" v-if="group?.iAmOwner && activeSeason?.is_finished">
                  This season has now ended. 
                  <router-link :to="`/group/${group?.id}/create-season`" class="text-blue-600 hover:underline hover:cursor-pointer">
                    Create a new season
                  </router-link> 
                  to begin predicting once more!
                </p>
              </RoundedContainer>
            </div>

            <RoundedContainer v-if="gameweeks.length === 0 && !activeSeason?.is_finished" class="mx-auto text-center">
              <h2 class="text-xl font-semibold mb-2">You haven't created a gameweek yet</h2>
              <p class="text-gray-600 mb-6">Set one up now to start predicting with your group members!</p>
              <router-link :to="`/group/${group?.id}/create-gameweek`">
                <button class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition">
                  Create Gameweek
                </button>
              </router-link>
            </RoundedContainer>
  
            <template v-if="activeGameweek && activeGameweek?.is_finished && Object.keys(gameweekWinner).length > 0">
              <GameweekWinnerCard 
                :username="gameweekWinner.username"
                :totalPoints="gameweekWinner.total_points"
                :isCurrentUser="gameweekWinner.userIsGameweekWinner"
                :weekNumber="activeGameweek?.week_number"
              />
            </template>
  
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
                    :totalPoints="activeGameweek?.is_locked ? currentUserGameweekData.total_points : null"
                    :group-scoring="groupScoring"
                    @update-prediction="handlePredictionUpdate"
                    @predictions-submitted="submitPredictions"
                  >
                  <template #headerActionItems>
                    <router-link 
                      :to="`/gameweek/${activeGameweek.id}`" 
                      class="text-sm text-blue-600 hover:underline"
                    >
                      Gameweek {{ activeGameweek?.week_number }}
                    </router-link>
                  </template>
                </ScoreCard>
              </div>
              <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
            </div>
          </Tab>
          <Tab :header="`Gameweek ${activeGameweek.week_number}`" v-if="activeGameweek">
            <RoundedContainer headerText="Gameweek Stats" v-if="activeGameweek.is_locked">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatRow icon="🔥" label="Total Points" :value="currentUserGameweekData.total_points" />
                  <StatRow icon="📈" label="Position" :value="currentUserGameweekData.position" />
                  <StatRow icon="🥇" label="Current Leader" :value="currentLeader.username" />
                  <StatRow icon="🎯" label="Most Correct Scores" :value="`${userMostCorrectScores.total_correct_scores} (${userMostCorrectScores.username}) `" />
              </div>
            </RoundedContainer>
            <RoundedContainer>
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
                  :totalPoints="activeGameweek?.is_locked ? currentUserGameweekData.total_points : null"
                  :group-scoring="groupScoring"
                  @update-prediction="handlePredictionUpdate"
                  @predictions-submitted="submitPredictions"
                >
                  <template #headerActionItems>
                    <router-link 
                      :to="`/gameweek/${activeGameweek.id}`" 
                      class="text-sm text-blue-600 hover:underline"
                    >
                      Gameweek {{ activeGameweek?.week_number }}
                    </router-link>
                  </template>
                </ScoreCard>
              <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
            </RoundedContainer>
  
            <RoundedContainer headerText="Current Standings" v-if="activeGameweek?.is_locked">
              <p v-if="gwLeaderboardLastUpdated" class="text-gray-500">Last Updated: {{ DateUtils.toDateTime(gwLeaderboardLastUpdated) }}</p>
              <div v-if="gwLeaderboard.length">
                <LeaderboardCard 
                  :leaderboard="gwLeaderboard"
                  :gameweekId="activeGameweek?.id"
                  :includeUserPredictionLink="activeGameweek?.is_locked"
                  :winnerId="activeGameweek?.winner_id"
                />
              </div>
              <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
            </RoundedContainer>
          </Tab>
          <Tab header="Seasons">
            <RoundedContainer v-if="seasons?.length">
              <div v-for="season in seasons" :key="season.id" class="flex justify-between items-center border-b py-3">
                  <div>
                      <div class="items-center flex">
                          <router-link :to="`/season/${season.id}`" class="text-blue-600 hover:underline font-medium">
                              {{ season.name }}
                          </router-link>
                      </div>
                      <div class="text-sm text-gray-500">
                          {{ season.start_date ? DateUtils.toShortDate(season.start_date) : 'TBD' }} - 
                          {{ season.end_date ? DateUtils.toShortDate(season.end_date) : 'TBD' }}
                      </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                      <div v-if="season.id === activeSeason?.id" class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full transition">
                          Active
                      </div>
                  </div>
              </div>
            </RoundedContainer>
          </Tab>
          <Tab header="Leaderboard">
            <GroupLeaderboard :groupId="group.id" :activeGameweekId="activeGameweek ? activeGameweek.id : null" :seasonId="group?.active_season_id" />
          </Tab>
          <Tab header="Stats">
            <CombinedGroupStats :groupId="group.id" :seasonId="group?.active_season_id" />
          </Tab>
          <Tab header="Members" v-if="group?.iAmMember || (group?.iAmMember && group.is_public)">
            <RoundedContainer :headerText="`Join Requests (${requestMembers.length})`" v-if="group?.iAmAdmin && requestMembers.length > 0">
              <!-- <template #headerContent>
                <div class="flex">
                  <button 
                    @click="approveAllRequests()"
                    class="text-sm bg-green-600 text-white px-3 py-1 me-2 rounded hover:bg-green-700 transition"
                  >
                    Approve All
                  </button>
                  <button 
                    @click="rejectAllRequests()"
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded transition"
                  >
                    Reject All
                  </button>
                </div>
              </template>             -->
              <div v-if="members.length">
                <MembersCard :members="requestMembers">
                  <template #additionalContent="{ member }">
                    <Dropdown>
                      <template #items>
                          <button
                              @click="approveMember(member)"
                              class="dropdown-item item-separator"
                          >
                              Approve
                          </button>
                          <button
                              @click="removeMember(member)"
                              class="dropdown-item text-red-600"
                          >
                              Reject
                          </button>
                        </template>
                    </Dropdown>
                  </template>
                </MembersCard>
              </div>
            </RoundedContainer>
            <RoundedContainer :headerText="`Members (${members.length})`" v-if="group?.iAmMember || (group?.iAmMember && group.is_public)">
              <template #headerContent v-if="group?.iAmAdmin">
                <!-- <button 
                  v-if="members.length != group.max_members" 
                  @click="openCreateMemberDialog()"
                  class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  + Add Member
                </button> -->
                <button 
                  v-if="members.length === group.max_members"
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
                  includeProfileLink
                  :groupId="group?.id"
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
            :src="group?.icon_url ?? '/images/green-football-md.png'" 
            class="w-10 h-10 flex-shrink-0" 
            alt="Group Logo"
            />
          <h2 class="text-2xl font-bold truncate">{{ group?.name }}</h2>
        </div>
        <h2 class="text-xl font-semibold mb-2">You're not part of this group yet</h2>
        <p class="text-gray-600 mb-6">Join now to start predicting, competing on the leaderboard, and more!</p>
        <button @click="tryJoinGroup" 
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition mb-6"
        >
          {{ group?.is_public ? 'Join Group' : 'Enter PIN' }}
        </button>
        <p class="text-gray-600 mb-6" v-if="!group?.is_public && !group?.joinRequestSent">
          Don't know the PIN? 
          <span class="text-blue-600 hover:underline cursor-pointer" @click="updateMemberStatus(true, true)">Send a join request</span>
           and the group admin can approve your membership.
        </p>
        <p class="text-gray-600 mb-6" v-else-if="!group?.is_public && group?.joinRequestSent">
          Join request sent. 
          <span class="text-red-600 hover:underline cursor-pointer" @click="updateMemberStatus(false, true)">Cancel</span> 
        </p>
      </RoundedContainer>
    </div>  
  </div>

  <PinDialog ref="pinDialog" :groupPin="String(group?.group_pin)" @submit-pin="updateMemberStatus(true, false)" />
  <DeleteConfirm ref="removeMemberConfirm" :title="deleteConfirmTitle" :message="deleteConfirmMsg" :confirmText="deleteConfirmText" />
  <CreateGroupMember ref="createMemberDialog" :groupId="groupId" :seasonId="activeSeason?.id" @user-created="getGroupMembers(); getLeaderboard();" />
  <CreateNotification :groupId="groupId" ref="createNotificationDialog" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { groupsStore } from "../store/groupsStore";
import { leaderboardStore } from "../store/leaderboardStore";
import { userStore } from "../store/userStore";
import { gameweeksService } from "../api/gameweeksService";
import LoadingScreen from "../components/LoadingScreen.vue";
import DateUtils from "../utils/dateUtils";
import { LinkIcon, EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
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
import RoundedContainer from "../components/UI/RoundedContainer.vue";
import CombinedGroupStats from "./CombinedGroupStats.vue";
import GroupLeaderboard from "./GroupLeaderboard.vue";
import Dropdown from "../components/UI/Dropdown.vue";
import { seasonsService } from "../api/seasonsService";
import PageHeader from "../components/PageHeader.vue";
import { Season, Gameweek, Group, GroupMember, Prediction, LeaderboardEntry, GwLeaderboardEntry } from '../types';
import { copyPageLink, mapPredictions } from "../utils/sharedFunctions";
import CreateNotification from "../components/dialogs/CreateNotification.vue";
import { GroupScoring } from "../types";

const route = useRoute();
const router = useRouter();

const pinDialog = ref(null);
const removeMemberConfirm = ref(null);
const createMemberDialog = ref(null);
const createNotificationDialog = ref(null);

// State
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const groupId = ref<string | null>(null);
const group = ref<Group>();
const members = ref<Array<GroupMember>>([]);
const gameweeks = ref<Array<Gameweek>>([]);
const predictions = ref<Array<Prediction>>();
const matches = ref<Array<any>>([]);
const deleteConfirmMsg = ref<string>('');
const deleteConfirmTitle = ref<string>('');
const deleteConfirmText = ref<string>('Confirm');
const groupOwner = ref<{ email: string, id: string, username: string }>();
const activeGameweek = ref<Gameweek>();
const groupExists = ref<boolean>(true);
const gameweekWinner = ref({});
const gwLeaderboard = ref<Array<LeaderboardEntry>>([]);
const gwLeaderboardLastUpdated = ref<Date | null>();
const currentLeader = ref<GwLeaderboardEntry>();
const currentUserGameweekData = ref<GwLeaderboardEntry>();
const userMostCorrectScores = ref<GwLeaderboardEntry>();
const activeSeason = ref<Season>();
const seasons = ref<Array<Season>>();
const requestMembers = ref<Array<GroupMember>>([]);
const groupScoring = ref<GroupScoring>();

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
    const { data: groupData, error: groupError } = await groupsService.getGroupByIdUsingView(groupId.value);
    console.log(groupError)
    if (groupError && groupError.code === "PGRST116") {
      groupExists.value = false;
      loading.value = false;
      return;
    }
    if (groupError) throw new Error('Failed to load group details');
    group.value = groupData;

    groupScoring.value = { 
      exact_score_points: groupData.exact_score_points,
      correct_result_points: groupData.correct_result_points,
      incorrect_points: groupData.incorrect_points
    }
    
    // Fetch group members
    await getGroupMembers();

    const { data: adminData, error: adminError } = await groupsService.getGroupAdmin(groupId.value); // could be optimised by making group view with this data
    if (adminError) throw new Error('Failed to load group admin');
    groupOwner.value = adminData;

    const { data: seasonData, error: seasonError } = await seasonsService.getSeasonById(group.value.active_season_id);
    if (seasonError) throw new Error('Failed to load active season');
    activeSeason.value = seasonData;

    const { data: seasonsData, error: seasonsError } = await seasonsService.getGroupSeasons(group.value.id);
    if (seasonsError) throw new Error('Failed to load seasons');
    seasons.value = seasonsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await seasonsService.getSeasonGameweeks(activeSeason.value.id);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    gameweeks.value = gameweeksData ? gameweeksData.sort((a, b) => b.week_number - a.week_number) : []

    
    activeGameweek.value = gameweeksData.filter(x => x.is_active)[0];
    if (activeGameweek.value && Object.keys(activeGameweek.value).length > 0) {
      // Fetch both matches and predictions
      const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
        gameweeksService.getMatches(activeGameweek.value.id),
        predictionsService.getUserGameweekPredictions(userStore.user?.id, activeGameweek.value.id)
      ]);

      const formattedMatches = mapPredictions(predictionsData, matchData);
      predictions.value = formattedMatches.predictions;
      matches.value = formattedMatches.matches;
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

const handlePredictionUpdate = ({ matchId, field, value }) => {
    if (!predictions.value[matchId]) {
        predictions.value[matchId] = { predicted_home_score: 0, predicted_away_score: 0 };
    }
    predictions.value[matchId][field] = value;
};

async function submitPredictions() {
  try {
    loading.value = true;
    
    console.log('predictionsss: ', predictions.value);
  
    const predictionsToSubmit = Object.entries(predictions.value).map(
      ([matchId, prediction]) => ({
        match_id: matchId,
        predicted_home_score: prediction.predicted_home_score ?? 0,
        predicted_away_score: prediction.predicted_away_score ?? 0
      })
    );
  
    const { success, error} = await predictionsService.submitPredictions(userStore.user.id, predictionsToSubmit);
    if (error) {
      toast("An error occurred while submitting your predictions.", {
        "type": "error",
        "position": "top-center"
      });
      throw new Error("An error occurred while submitting your predictions.")
    } else if (success) {
      toast("Your predictions have been saved!", {
        "type": "success",
        "position": "top-center"
      });
    }
  } catch(err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const updateMemberAdminStatus = async (member: GroupMember) => {
  await groupsStore.updateMemberRole(member.membership_id, !member.is_admin, groupId.value);
  
  toast(`${member.username}'s admin status updated!`, {
    "type": "success",
    "position": "top-center"
  });

  // Refresh members list
  getGroupMembers();
}

const confirmRemoveMember = async (member: GroupMember) => {
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
      updateMemberStatus(true, false);
  } else {
    await pinDialog.value?.show();
  }
}

async function updateMemberStatus(isJoining: boolean, isRequesting: boolean) {
  if (isJoining) {
    try {
      const { success, error: joinError } = await groupsStore.addMember(
        groupId.value,
        userStore.user.id,
        false,
        isRequesting,
        group.value?.active_season_id
      );
  
      if (joinError) throw new Error('Failed to join group');
      else {
        toast(isRequesting ? "Join request sent!" : "Successfully joined group!", {
          "type": "success",
          "position": "top-center"
        }); 
        fetchAllData();
      }
    } catch(err) {
      error.value = err.message || 'An error occurred while joining group';
    }
  } else {
    const userMembership = members.value.filter(x => x.id === userStore.user.id);
    deleteConfirmMsg.value = isRequesting ? 'Please confirm' : `Are you sure you want to leave ${group.value.name}? All of your leaderboard data will be erased.`;
    deleteConfirmTitle.value = isRequesting ? 'Cancel Join Request' : 'Leave Group';
    deleteConfirmText.value = isRequesting ? 'Confirm' : 'Leave';
    const confirmed = await removeMemberConfirm.value?.show();
    if (confirmed) {
      try {
        const { success, error: leaveError } = await groupsStore.removeMember(
          userMembership[0].membership_id, 
          groupId.value
        );
    
        if (leaveError) throw new Error('Failed to leave group');
        else {
          toast(isRequesting ? 'Join Request Cancelled' : 'Successfully left group.', {
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

const removeMember = async (member: GroupMember) => {
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
  if (membersData && membersData.length > 0) {
    members.value = membersData.filter(x => !x.has_requested);
    requestMembers.value = membersData.filter(x => x.has_requested);
  }
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

function getScoringSystem(group) {
  if (group.exact_score_points == 3 && group.correct_result_points == 1 && group.incorrect_points == 0) {
    return `Classic (3 points for correct score, 1 point for correct result)`;
  } else {
    return `Custom (${group.exact_score_points} points for correct score, ${group.correct_result_points} for correct result and ${group.incorrect_points} for incorrect result)`;
  }
}

async function approveMember(member: GroupMember) {
  try {
    loading.value = true;
    const { data, error } = await groupsService.approveMemberRequest(groupId.value, member.id, member.membership_id);
    if (error) throw new Error('Failed to approve member');
    
    toast('Member Request Approved!', {
      "type": "success",
      "position": "top-center"
    });
  } catch(err) {
    console.error(err);
  } finally {
    loading.value = false;
    getGroupMembers();
  }
}

async function rejectAllRequests() {
  if (requestMembers.value.length === 0) { return; }
  try {
    loading.value = true;
    requestMembers.value.forEach(async(x) => {
      const { success, error: removeError } = await groupsStore.removeMember(
        x.membership_id, 
        groupId.value
      );
      
      if (removeError) throw new Error('Failed to remove member');
    });
  } catch(err) {
    error.value = err.message || 'An error occurred while removing member';
    console.error(err);
  } finally {
    loading.value = false;
    getGroupMembers();
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

