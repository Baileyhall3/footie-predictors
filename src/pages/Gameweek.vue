<template>
    <div class="container mx-auto py-8">
      <LoadingScreen v-if="loading" />
      <DoesNotExist v-else-if="!gameweekExists" entity="gameweek" />
      <!-- Not in group message -->
      <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
        <p>You are not a member of this group.</p>
        <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
          Go to Group
        </button>
      </div>

      <template v-else>
        <PageHeader>
          <template #header>
            <h2 class="text-2xl font-semibold">Gameweek {{ gameweek?.week_number }}</h2>
            <LockClosedIcon class="size-6 ms-1 me-1" v-if="gameweek?.is_locked" title="This gameweek is locked" />
            <!-- <div v-if="gameweek?.is_active" class="text-sm bg-blue-100 text-purple-800 px-3 py-1 rounded-full transition ms-2">
              Active
            </div> -->
            <div v-if="gameweek?.is_active" class="py-1" title="This gameweek is active">
              <StarIcon class="size-6 text-yellow-300" />
            </div>
          </template>
          <template #actionItems>
            <button @click="copyPageLink('Gameweek')" class="p-1 rounded-md hover:bg-gray-200" title="Copy gameweek link">
              <LinkIcon class="size-6 text-blue-500" />
            </button>
            <Dropdown>
              <template #trigger>
                <EllipsisVerticalIcon class="size-6 text-gray-500" />
              </template>
              <template #items>
                <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 dropdown-item item-separator">
                  Go to Group
                </router-link>
                <router-link :to="`/season/${gameweek?.season_id}`" class="text-blue-600 dropdown-item item-separator">
                  {{ gameweek?.season_name }}
                </router-link>
                <template v-if="isAdmin">
                  <button @click="changeGameWeekLockedStatus" class="dropdown-item item-separator">
                    {{ gameweek?.is_locked ? 'Unlock' : 'Lock' }}
                  </button>
                  <button v-if="!gameweek?.is_active && !gameweek?.is_finished" @click="changeGameWeekActiveStatus" class="dropdown-item item-separator">
                    Set Active
                  </button>
                  <button @click="deleteGameweek" class="dropdown-item text-red-700 item-separator">
                    Delete
                  </button>
                </template>
              </template>
            </Dropdown>
          </template>
          <template #details>
            <p class="text-lg">
              <span class="font-semibold">Deadline: </span>
              <DeadlineCountdown :deadline="new Date(gameweek?.deadline)" v-if="gameweek?.deadline" />
            </p>
          </template>
        </PageHeader>
        <Tabs @tab-selected="handleTabSelected">
          <Tab header="Predictions">
            <template v-if="gameweek?.is_finished">
              <GameweekWinnerCard 
                :username="gameweekWinner.username"
                :totalPoints="gameweekWinner.total_points"
                :isCurrentUser="userIsGameweekWinner"
                :weekNumber="gameweek?.week_number"
              />
            </template>
            <!-- Predictions -->
            <RoundedContainer>
              <div>
                <template v-if="Object.keys(predictions).length > 0">
                  <ScoreCard 
                      :matches="matches"
                      :predictions="predictions"
                      :locked="gameweek?.is_locked || gameweek?.is_finished"
                      :totalPoints="userGameweekScore ?? null"
                      :includeSubmitBtn="!gameweek?.is_locked && !gameweek?.is_finished"
                      allowCollapse
                      header="Your Predictions"
                      :gameweekId="gameweekId"
                      :matchesClickable="gameweek?.is_locked"
                      @update-prediction="handlePredictionUpdate"
                      @predictions-submitted="submitPredictions"
                  />
                </template>
                <p v-else class="text-gray-500">No predictions made for this gameweek yet.</p>
              </div>
            </RoundedContainer>
          </Tab>
          <Tab header="Matches">
            <RoundedContainer headerText="Matches" collapsable>
              <template #headerContent>
                <div class="flex items-center" v-if="isAdmin">
                  <router-link :to="`/gameweek/${gameweekId}/add-matches`">
                    <AddBtn v-if="!gameweek?.is_locked && gameweek?.is_active" title="Add matches to gameweek" />
                  </router-link>
                  <template v-if="!gameweek?.is_finished">
                    <EditBtn v-if="!editMode" @begin-edit="editMode = true" title="Edit this gameweek" />
                    <CancelBtn v-else @cancelled="editMode = false" title="Stop editing" />
                  </template>
                </div>
              </template>
                <ScoreCard 
                    v-if="matches.length > 0"
                    :matches="matches"
                    :isAdmin="editMode && gameweek?.is_active && gameweek?.is_locked"
                    :canRemove="editMode && gameweek?.is_active && !gameweek?.is_locked"
                    :matchesClickable="gameweek?.is_locked && !editMode"
                    @update-score="handleScoreUpdate"
                    @match-removed="handleMatchRemoved" 
                  />
                <button v-if="matchesChanged && editMode" @click="saveScores" class="w-full bg-green-600 text-white py-2 rounded-md mt-4">
                  Save Scores
                </button>
            </RoundedContainer>
          </Tab>
          <Tab header="Leaderboard">
            <DataGrid 
                ref="leaderboardGridRef"
                :data="leaderboard" 
                hideVerticalLines 
                headerBgColor="rgb(22 163 74 /1)"
                :hideFilterRow="!isFiltering"
                :exportOptions="{
                    sheetTitle: 'Gameweek Leaderboard',
                    workBookTitle: `gameweek${gameweek?.week_number}_leaderboard`
                }"
                disableActiveCell
            >
                <template #cardHeader>
                    <div class="items-center flex py-6 ms-2">
                        <h3 class="text-xl font-semibold">Leaderboard</h3>
                        <FilterButton :filterActive="isFiltering" @onFilter="isFiltering = $event" />
                    </div>
                    <p v-if="leaderboardLastUpdated" class="text-gray-500 ms-2 mb-2">Last Updated: {{ DateUtils.toDateTime(leaderboardLastUpdated) }}</p>
                </template>
                <template #columns="{ row }">
                    <GridCol field="position" colName="Pos" width="40px" disableFilter alignContent="center">
                        <template #display="{ row }">
                            <span class="font-medium w-6 text-center">{{ row.position }}.</span>
                        </template>
                    </GridCol>
                    <GridCol field="username" colName="Username" width="200px">
                        <template #display="{ row }">
                            <UsernameDisplay 
                              :user="row" 
                              :currentUserId="userStore.user?.id" 
                              includeUserPredictionLink
                              :gameweekId="gameweekId"
                            />
                        </template>
                    </GridCol>
                    <GridCol field="total_points" colName="Pts"  width="60px" colTitle="Total Points" sortable type="number">
                      <template #display="{ row }">
                            <span class="text-green-600 font-semibold">{{ row.total_points }}</span>
                        </template>
                    </GridCol>
                    <GridCol field="total_correct_scores" colName="CS"  width="60px" colTitle="Correct Scores" sortable>
                      <template #display="{ row }">
                        {{ row.total_correct_scores ?? 0 }}
                      </template>
                    </GridCol>
                </template>
            </DataGrid>
            <!-- <RoundedContainer headerText="Potential Finishes">
              <PotentialFinishGrid 
                :scoringSystem="potentialFinishData.scoringSystem"
                :userPredictions="potentialFinishData.userPredictions"
              />
            </RoundedContainer> -->
          </Tab>
        </Tabs>
      </template>
    </div>

    <DeleteConfirm ref="deleteConfirm" title="Delete Gameweek" message="Are you sure you want to delete this gameweek?" />
</template>
  
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userStore } from '../store/userStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import { LockClosedIcon, LinkIcon, EllipsisVerticalIcon, StarIcon } from "@heroicons/vue/24/solid";
import { predictionsService } from '../api/predictionsService';
import DateUtils from '../utils/dateUtils';
import LoadingScreen from "../components/LoadingScreen.vue";
import ScoreCard from '../components/ScoreCard.vue';
import DeleteConfirm from '../components/DeleteConfirm.vue';
import { predictionsStore } from '../store/predictionsStore';
import { leaderboardStore } from '../store/leaderboardStore';
import LeaderboardCard from '../components/LeaderboardCard.vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import confetti from 'canvas-confetti';
import DeadlineCountdown from '../components/UI/DeadlineCountdown.vue';
import GameweekWinnerCard from '../components/GameweekWinnerCard.vue';
import RoundedContainer from '../components/UI/RoundedContainer.vue';
import Dropdown from '../components/UI/Dropdown.vue';
import Tabs from '../components/UI/Tabs.vue';
import Tab from '../components/UI/Tab.vue';
import PotentialFinishGrid from '../components/PotentialFinishGrid.vue';
import DoesNotExist from '../components/DoesNotExist.vue';
import { Gameweek, Prediction } from '../types';
import { copyPageLink } from '../utils/sharedFunctions';
import FilterButton from '../components/UI/FilterButton.vue';
import DataGrid from '../components/UI/grid/DataGrid.vue';
import GridCol from '../components/UI/grid/GridCol.vue';
import UsernameDisplay from '../components/UI/UsernameDisplay.vue';
import PageHeader from '../components/PageHeader.vue';
import { CancelBtn, EditBtn, AddBtn } from '../components/UI/buttons';

const route = useRoute();
const router = useRouter();

const loading = ref<boolean>(true);
const gameweekId = ref<string | null>(null);
const gameweek = ref<Gameweek>();
const matches = ref([]);
const editMode = ref(false);
const newMatch = ref({ home_team: '', away_team: '', match_time: '' });
const predictions = ref({});
const notInGroup = ref(false);
const members = ref([]);
const deleteConfirm = ref(null);
const leaderboard = ref([]);
const userGameweekScore = ref();
const gameweekWinner = ref();
const leaderboardLastUpdated = ref();
const potentialFinishData = ref({ scoringSystem: {}, userPredictions: [] });
const gameweekExists = ref<boolean>(true);
const isFiltering = ref<boolean>(false);

const isAdmin = ref(false);

const matchesChanged = ref(false);

const canUnlockGameweek = computed(() => {
  return new Date(gameweek.value.deadline) > new Date();
});

const userIsGameweekWinner = computed(() => {
  return gameweek.value?.is_finished && gameweekWinner.value.user_id === userStore.user?.id;
});
  
onMounted(async () => {
  await fetchGameweek();
});
  
async function fetchGameweek() {
  try {
    loading.value = true;
    gameweekId.value = route.params.id || route.query.id;
  
    const { data, error } = await gameweeksService.getGameweekByIdUsingView(gameweekId.value);
    if (error) {
      if (error.code === "PGRST116") {
          gameweekExists.value = false;
          loading.value = false;
          throw new Error('Failed to load gameweek details');
      }
    }
    gameweek.value = data;
  
    const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(data.group_id);
    if (membersError) throw new Error('Failed to load group members');
    members.value = membersData || [];
  
    // Check if user is in the group
    const isMember = userInGroup(members.value);
    if (!isMember) {
      loading.value = false;
      notInGroup.value = true;
      return;
    }
  
    isAdmin.value = userIsAdmin(members.value);
  
    // Fetch leaderboard
    const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGameweekScores(gameweek.value.group_id, gameweek.value.id);
    if (leaderboardError) throw new Error('Failed to load leaderboard');
    leaderboard.value = leaderboardData || [];
    
    if (leaderboard.value.length > 0) {
      leaderboardLastUpdated.value = leaderboard.value[0].updated_at ? new Date(leaderboard.value[0].updated_at) : null;
    }
    
    if (leaderboard.value.length > 0) {
      userGameweekScore.value = leaderboard.value.find(x => x.user_id == userStore.user?.id).total_points;
      gameweekWinner.value = leaderboard.value.find(x => x.position == 1);
    }
  
    // Fetch both matches and predictions
    const [{ data: matchData }, { data: predictionsData }] = await Promise.all([
      gameweeksService.getMatches(gameweekId.value),
      predictionsService.getUserGameweekPredictions(userStore.user?.id, gameweekId.value)
    ]);
  
    const { data: groupData, error: groupError } = await groupsStore.fetchGroupById(gameweek.value.group_id);
    if (groupError) throw new Error('Failed to load group');
  
    const { data: gameweekPredictions, error: gameweekPredictionsError } = await predictionsService.getGameweekPredictions(gameweek.value.id);
    if (gameweekPredictionsError) throw new Error('Failed to load all gameweek predictions')
  
    mapPredictions(predictionsData, matchData);
  
    mapPotentialFinishData(leaderboardData, groupData, matchData, gameweekPredictions);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function mapPredictions(predictionsData, matchData) {
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

  if (gameweekWinner.value.user_id === userStore.user?.id && gameweek.value.is_finished) {
    triggerConfetti();
  }
}

function mapPotentialFinishData(leaderboardData: any[], groupData: any, matchData: any[], predictionsData: any[]) {
  potentialFinishData.value.scoringSystem = { 
    exactScorePoints: groupData.exact_score_points,
    correctResultPoints: groupData.correct_result_points,
    incorrectResultPoints: groupData.incorrect_points
  };

  const users = leaderboardData.map(user => ({
    userId: user.user_id,
    username: user.username,
    currentPoints: user.total_points,
    currentPosition: user.position,
  }));

  const predictions = predictionsData.map(pred => ({
    userId: pred.user_id,
    matchId: String(pred.match_id), // make sure matchId is a string
    homeScore: pred.predicted_home_score,
    awayScore: pred.predicted_away_score
  }));

  // Group predictions by userId
  const predictionsByUser = predictions.reduce((acc, pred) => {
    if (!acc[pred.userId]) acc[pred.userId] = [];
    acc[pred.userId].push({
      matchId: pred.matchId,
      homeScore: pred.homeScore,
      awayScore: pred.awayScore
    });
    return acc;
  }, {} as Record<string, Prediction[]>);

  // Combine into UserPrediction[]
  potentialFinishData.value.userPredictions = users.map(user => ({
    username: user.username,
    userId: user.userId,
    currentPoints: user.currentPoints,
    currentPosition: user.currentPosition,
    predictions: predictionsByUser[user.userId] || []
  }));
}

function toggleEditMode() {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    mapPredictions();
  }
}

function handleTabSelected(index: number) {
  editMode.value = false;
}

async function changeGameWeekActiveStatus() {
  const { data, error } = await gameweeksService.updateGameweek(gameweek.value.id, {
    is_active: !gameweek.value.is_active
  });
  
  if (!error) {
    toast("Gameweek active status changed.", {
      "type": "info",
      "position": "top-center"
    });
    window.location.reload();
  }
}

async function changeGameWeekLockedStatus() {
  const { data, error } = await gameweeksService.updateGameweek(gameweek.value.id, {
    is_locked: !gameweek.value.is_locked
  });
  
  if (!error) {
    toast("Gameweek locked status changed.", {
      "type": "info",
      "position": "top-center"
    });
    window.location.reload();
  }
}

const deleteGameweek = async () => {
  const confirmed = await deleteConfirm.value?.show();
  if (confirmed) {
    try {
      loading.value = true;
      const { success, error: deleteError } = await gameweeksService.deleteGameweek(gameweekId.value)
      
      if (deleteError) throw new Error('Failed to delete gameweek');
      
      // Redirect to groups page
      router.push(`/group/${gameweek.value.group_id}`);
    } catch (err) {
      err.value = err.message || 'An error occurred while deleting the gameweek';
    } finally {
      loading.value = false;
      showDeleteConfirmation.value = false;
    }
  } else {
    console.log("Deletion cancelled!");
  }
};
  
async function submitPredictions() {
  loading.value = true;

  console.log('predictionsss: ', predictions.value)

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

async function saveScores() {
  loading.value = true;
  const customMatches = matches.value.filter(x => !x.api_match_id);
  for (const match of customMatches) {
    try {
      if (
        match.final_home_score !== match.previous_home_score || 
        match.final_away_score !== match.previous_away_score
      ) {
        await predictionsStore.updateMatchScore(match.id, match.final_home_score, match.final_away_score);
        // await predictionsService.calculateMatchScores(match.id);
      }
    } catch(err) {
      console.error(err);      
    }
  }
  
  toast("Final scores have been saved!", {
    "type": "success",
    "position": "top-center"
  });
  
  loading.value = false;
  editMode.value = false;
  matchesChanged.value = false;
  fetchGameweek();
  
}

const handlePredictionUpdate = ({ matchId, field, value }) => {
    if (!predictions.value[matchId]) {
        predictions.value[matchId] = { predicted_home_score: 0, predicted_away_score: 0 };
    }
    predictions.value[matchId][field] = value;
};

const handleScoreUpdate = ({ matchId, field, value }) => {
    const match = matches.value.find(m => m.id === matchId);

    if (match) {
        match[field] = value;
        matchesChanged.value = true;
    } else {
        console.error(`Match with ID ${matchId} not found.`);
    }
};

const handleMatchRemoved = async(matchId) => {
  const match = matches.value.find(m => m.id === matchId);

    if (match) {
        try {
          const { data, error } = await gameweeksService.deleteMatch(matchId);
          
          if (!error) {
            mapPredictions();
          }
        } catch (err) {
          console.error(err);
        }
    } else {
        console.error(`Match with ID ${matchId} not found.`);
    }
}

const triggerConfetti = () => {
  confetti({
    particleCount: 1000,
    spread: 100,
    origin: { y: 0.6 }, // Adjust origin for better effect
  });
};
  
function redirectToGroup() {
  router.push(`/group/${gameweek.value.group_id}`);
}

</script>
  