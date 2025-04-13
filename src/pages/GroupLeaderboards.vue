<template>
    <div class="container mx-auto py-8">
        <LoadingScreen v-if="loading" />
        <!-- Not in group message -->
        <!-- <div v-if="notInGroup" class="bg-red-100 p-4 rounded-md text-red-600">
            <p>You are not a member of this group.</p>
            <button @click="redirectToGroup" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
                Go to Group
            </button>
        </div> -->
        <NoAccess v-if="notInGroup" message="You are not a member of this group." />

        <template v-else>
            <div class="mb-1 ms-1">
                <router-link :to="`/group/${groupId}`" class="text-blue-600 hover:underline font-medium">
                    ← Back to group
                </router-link>
            </div>
        </template>

        <!-- All time leaderboard -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
            <div v-if="leaderboard.length">
                <LeaderboardCard 
                    :leaderboard="leaderboard"
                    :editable="isAdmin"
                    includeHeader
                    :lastUpdated="leaderboardLastUpdated"
                    allowCollapse
                    @update-leaderboard-entry="handleLeaderboardUpdate"
                    @changes-saved="saveChanges"
                    @changes-cancelled="cancelChanges"
                />
            </div>
            <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
        </div>

        <!-- Current gameweek leaderboard -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="Object.keys(currentGameweek).length > 0">
            <div v-if="scores.length">
                <LeaderboardCard 
                    :leaderboard="scores"
                    includeHeader
                    allowCollapse
                    :gameweekId="currentGameweek.id"
                    :lastUpdated="scoresLastUpdated"
                />
            </div>
            <p v-else class="text-gray-500 py-2">No leaderboard data available.</p>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gameweeksService } from '../api/gameweeksService';
import { groupsStore } from '../store/groupsStore';
import { userIsAdmin, userInGroup } from "../utils/checkPermissions";
import LoadingScreen from "../components/LoadingScreen.vue";
import { leaderboardStore } from '../store/leaderboardStore';
import LeaderboardCard from '../components/LeaderboardCard.vue';
import { leaderboardService } from '../api/leaderboardService';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import NoAccess from '../components/NoAccess.vue';

interface LeaderboardRecord {
  id: string;
  user_id: string;
  total_points: number;
}

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const notInGroup = ref(false);
const groupId = ref(null);
const members = ref([]);
const isAdmin = ref(false)
const leaderboard = ref([]);
const currentGameweek = ref({});
const scores = ref([]);
const leaderboardLastUpdated = ref();
const scoresLastUpdated = ref();
const changedRecords = ref(<LeaderboardRecord[]>([])); 

onMounted(async () => {
    fetchAllData();
});

async function fetchAllData() {
    loading.value = true;
    groupId.value = route.params.id || route.query.id;

    const { data: membersData, error: membersError } = await groupsStore.fetchGroupMembers(groupId.value);
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

    // Fetch all-time leaderboard
    const { data: leaderboardData, error: leaderboardError } = await leaderboardStore.fetchGroupLeaderboard(groupId.value);
    if (leaderboardError) throw new Error('Failed to load leaderboard');
    leaderboard.value = leaderboardData || [];

    if (leaderboard.value.length > 0) {
        leaderboardLastUpdated.value = new Date(leaderboard.value[0].last_updated);
    }
    
    // Fetch gameweeks
    const { data: gameweeksData, error: gameweeksError } = await gameweeksService.getActiveGameweek(groupId.value);
    if (gameweeksError) throw new Error('Failed to load gameweeks');
    currentGameweek.value = Object.keys(gameweeksData).length > 0 ? gameweeksData : {};
    
    if (Object.keys(currentGameweek.value).length) {        
        // Fetch gameweek leaderboard
        const { data: scoresData, error: scoresError } = await leaderboardStore.fetchGameweekScores(currentGameweek.value.group_id, currentGameweek.value.id);
        if (scoresError) throw new Error('Failed to load gameweek leaderboard');
        scores.value = scoresData || [];
        
        if (scores.value.length > 0) {
            scoresLastUpdated.value = leaderboard.value[0].updated_at ? new Date(leaderboard.value[0].updated_at) : null;
        }
    }

    debugger

    loading.value = false;
}

const cancelChanges = () => {
    changedRecords.value.splice(0, changedRecords.value.length);
}

const handleLeaderboardUpdate = ({ leaderboardId, userId, value }) => {
    const existingRecordIndex = changedRecords.value.findIndex(
        record => record.id === leaderboardId
    );

    if (existingRecordIndex !== -1) {
        changedRecords.value[existingRecordIndex].total_points = value;
    } else {
        changedRecords.value.push({
            id: leaderboardId,
            user_id: userId,
            total_points: value
        });
    }
};

async function saveChanges() {
    loading.value = true;

    for (const record of changedRecords.value) {
        try {
            await leaderboardService.updateUserTotalPoints(record.id, record.user_id, groupId.value, record.total_points);
        } catch(err) {
            console.error(err);
        }
    }

    toast("Leaderboard records have been updated!", {
        "type": "success",
        "position": "top-center"
    });

    loading.value = false;
    changedRecords.value.splice(0, changedRecords.value.length);
}
</script>