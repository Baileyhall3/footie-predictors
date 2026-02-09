<template>
    <div v-if="userStore.userProfile" class="flex flex-col h-full">
        <PageHeader>
            <template #header>
                <img 
                    v-if="userStore.userProfile?.profile_picture_url"
                    :src="userStore.userProfile?.profile_picture_url" 
                    class="w-10 h-10 flex-shrink-0 rounded-full" 
                    alt="Person Picture"
                />

                <div
                    class="relative flex items-center justify-center overflow-hidden rounded-full bg-muted shadow-xs shadow-black/10 group"
                >
                    <img 
                        v-if="userStore.userProfile?.profile_picture_url"
                        :src="userStore.userProfile?.profile_picture_url" 
                        class="w-10 h-10 flex-shrink-0 rounded-full" 
                        alt="Person Picture"
                    />
                    <div v-else
                        class="flex items-center justify-center rounded-full w-10 h-10 text-white text-sm font-medium"
                        :style="{ backgroundColor: userStore.userProfile.bg_colour || '#ccc' }"
                    >
                        {{ userStore.userProfile.username.charAt(0).toUpperCase() }}
                    </div>

                    <!-- Image Plus button -->
                    <button
                        type="button"
                        class="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
                        @click="openDisplayPictureDialog()"
                        aria-label="Change profile picture"
                    >
                        <LucideImagePlus class="size-6" aria-hidden="true" />
                    </button>
                </div>
                
                <h2 class="text-2xl font-bold truncate">{{ userStore.userProfile?.username }}</h2>
            </template>
            <template #actionItems>
                <Dropdown>
                    <template #trigger>
                        <EllipsisVerticalIcon class="size-6 text-gray-500" />
                    </template>
                    <template #items>
                        <button @click="handleLogout()" 
                            class="dropdown-item text-red-700 item-separator"
                        >
                            Sign Out
                        </button>
                        <button @click="handleDeleteAccount()" 
                            class="dropdown-item text-red-700"
                        >
                            Delete Account
                        </button>
                    </template>
                </Dropdown>
            </template>
            <!-- <template #details>
                <p class="text-gray-500">{{ userStore.userProfile?.username }}</p>
            </template> -->
        </PageHeader>
        <Tabs>
            <Tab header="Details">
                <RoundedContainer headerText="Account Information">
                    <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                        <div>
                            <label class="block font-medium">Username</label>
                            <input v-model="userData.username" class="w-full border p-2 rounded-md" />
                        </div>
                        <div>
                            <label class="block font-medium">Email</label>
                            <input v-model="userStore.userProfile.email" class="w-full border p-2 rounded-md" disabled />
                        </div>
                        <div>
                            <label class="block font-medium">Account ID</label>
                            <input v-model="userStore.user.id" class="w-full border p-2 rounded-md" disabled />
                        </div>
                        <div>
                            <label class="block font-medium">Member Since</label>
                            <input :value="DateUtils.toShortDate(userStore.user.created_at)" class="w-full border p-2 rounded-md" disabled />
                        </div>
                    </div>
                    <div class="flex justify-end mt-4 text-sm">
                        <button @click="cancelChanges" :disabled="!hasChanges" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed mr-2">
                            Cancel
                        </button>
                        <button @click="saveChanges" :disabled="!hasChanges" class="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Save
                        </button>
                    </div>
                </RoundedContainer>
            </Tab>
            <Tab header="Preferences">
                <!-- Notification preferences and favourite group -->
                <RoundedContainer headerText="Favourite Group">
                    <span class="text-gray-500 text-sm">This can be set using the ⭐️ icon at the top of a group's page.</span>
                    <div>
                        <input :value="userStore.userProfile?.favourite_group" class="w-full border p-2 rounded-md" disabled />
                    </div>
                </RoundedContainer>

                <RoundedContainer headerText="Notification Preferences" class="mt-4">
                    <p class="text-gray-500 text-sm">
                        These are global preferences, meaning if you disable them here, the global preference will be used instead of your group preference.
                    </p>
                    <div class="mt-4">
                        <NotificationPreferences :preferences="preferences" />
                    </div>
                </RoundedContainer>
            </Tab>
            <Tab header="Achievements">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <AchievementCard v-for="a in achievements" :key="a.achievement_id" :achievement="a" />
                </div>
            </Tab>
            <Tab header="Stats">
                <div class="pb-4">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <SearchBar2 v-if="groupStats.length > 0" v-model="searchQuery" @update:model-value="handleSearchQuery" placeholder="Search for group..." />
                    </div>
    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="groupStats.length > 0">
                        <GroupCard 
                            :group="group" 
                            groupNameField="group_name" 
                            groupIdField="group_id"
                            :hideMemberCount="true" 
                            v-for="group in groupStats" 
                            :key="group.group_id"
                        >
                            <template #additionalGroupInfo>
                                <div class="space-y-3 mt-4">
                                    <StatRow icon="🔥" label="Avg. Points / Gameweek" :value="group.avg_points_per_gameweek" />
                                    <StatRow icon="🎯" label="Correct Scores" :value="group.total_correct_scores" />
                                    <StatRow icon="✅" label="Correct Results" :value="group.total_correct_results" />
                                    <StatRow icon="📈" label="Score Accuracy" :value="group.correct_score_ratio_percent + '%'" />
                                </div>
                            </template>
                        </GroupCard>
                    </div>
                    <NoGroupsJoined v-else />
                </div>
            </Tab>
        </Tabs>
    </div>

    <NewDisplayPicture ref="displayPictureDialog" />
    <DeleteConfirm 
        ref="deleteConfirm" 
        title="Delete Account" 
        message="Are you sure you want to delete your Footie Predictors account? All of your data will be erased. This action cannot be undone." 
    />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { RoundedContainer, Tab, Tabs, Dialog, Dropdown } from '../components/UI';
import PageHeader from '../components/PageHeader.vue';
import { userStore } from '../store/userStore';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid';
import { useRouter } from 'vue-router'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import DateUtils from '../utils/dateUtils';
import NewDisplayPicture from '../components/dialogs/NewDisplayPicture.vue';
import { PaintBrushIcon } from "@heroicons/vue/24/solid";
import { SaveBtn, CancelBtn, EditBtn } from '../components/UI/buttons';
import { notificationsService } from '../api/notificationsService';
import type { NotificationPreference, Achievement } from '../types';
import NotificationPreferences from '../components/NotificationPreferences.vue';
import LoadingScreen from '../components/LoadingScreen.vue';
import { userService } from '../api/userService';
import AchievementCard from '../components/UI/AchievementCard.vue';
import DeleteConfirm from "../components/DeleteConfirm.vue";
import MainContent from '../components/layout/MainContent.vue';
import { groupsService } from '../api/groupsService';
import StatRow from '../components/StatRow.vue';
import GroupCard from '../components/GroupCard.vue';
import { UserStats } from '../types';
import { SearchBar2 } from '../components/UI/input';
import NoGroupsJoined from '../components/UI/NoGroupsJoined.vue';
import { LucideImagePlus } from 'lucide-vue-next';

const router = useRouter();
const errorMessage = ref('');
const displayPictureDialog = ref(null);
const userData = ref({ username: userStore.userProfile.username });
const preferences = ref<Array<NotificationPreference>>([]);
const achievements = ref<Array<Achievement>>([]);
const loading = ref<boolean>();
const deleteConfirm = ref<InstanceType<typeof DeleteConfirm> | null>(null);
const groupStats = ref<Array<UserStats>>([]);
const searchQuery = ref<string>('');
const allGroupStats = ref([]);
const hasChanges = ref(false);

onMounted(() => {
    getAllData();
});

async function getAllData() {
  try {
    loading.value = true;

    const { data: achievementData, error: achievementError } = await userService.getUserAchievements();
    if (achievementError) throw new Error('Failed to load achievments');
    achievements.value = achievementData;

    const { data, error } = await notificationsService.getUserGeneralPreferences(userStore.user?.id);
    if (error) throw new Error('Failed to load preferences');

    preferences.value = data || [];

    const { data: statsData, error: statsError } = await groupsService.getGroupStats(null, userStore.user?.id);
    if (statsError) throw new Error('Failed to load user stats');
    
    groupStats.value = statsData || [];
    allGroupStats.value = statsData || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch(() => userData.value.username, (newUsername) => {
    hasChanges.value = newUsername !== userStore.userProfile.username;
});

const cancelChanges = () => {
    hasChanges.value = false;   
    userData.value.username = userStore.userProfile.username;
}

const saveChanges = async () => {
    if (userData.value.username == '') {
        errorMessage.value = 'You need to enter a username.';
        return;
    } else {
        try {
        const { data: profileData, error: profileError } = await userStore.updateProfile({username: userData.value.username});

        if (profileError) {
            errorMessage.value = profileError;
        } else {
            toast("Profile updated successfully!", {
                "type": "success",
                "position": "top-center"
            });
            errorMessage.value = '';
            hasChanges.value = false;
        }
        } catch (err) {
            console.error(err);
            errorMessage.value = err;
        }
    }
}

const handleLogout = async () => {
    const { error } = await userStore.signOut()
    if (!error) {
        router.push('/login')
    }
}

const handleDeleteAccount = async () => {
    const confirmed = await deleteConfirm.value?.show();
    if (confirmed) {
        const { error } = await userStore.deleteAccount();
        if (!error) {
            router.push('/login');
        }
    } else {
        console.log("Deletion cancelled!");
    }
};

const openDisplayPictureDialog = () => {
    displayPictureDialog.value.show();
}

function handleSearchQuery() {
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        groupStats.value = allGroupStats.value.filter(group =>
            group.group_name.toLowerCase().includes(query)
        );
    } else {
        groupStats.value = allGroupStats.value;
    }
}
</script>