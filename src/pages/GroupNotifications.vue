<template>
    <LoadingScreen v-if="loading" />
    <div class="container mx-auto py-8" v-else>
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
                <Dropdown>
                    <template #trigger>
                        <EllipsisVerticalIcon class="size-6 text-gray-500" />
                    </template>
                    <template #items>
                        <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item">
                            Go to Group
                        </router-link>
                    </template>
                </Dropdown>
            </template>
        </PageHeader>
        <Tabs>
            <Tab header="Notifications">
                <RoundedContainer v-if="notifications.length === 0">
                    <p class="text-gray-600">
                        No notifications for this group yet.
                    </p>
                </RoundedContainer>
                <RoundedContainer v-else>
                    Notifications!
                </RoundedContainer>
            </Tab>  
            <Tab header="Preferences">
                <RoundedContainer>
                    <div v-for="preference in preferences" :key="preference.type" class="mb-4">
                        <SwitchInput 
                            :disabled="isSavingId === preference.id"
                            v-model="preference.allow_push"
                            @update:modelValue="(val) => handleToggle(preference.id, val)"    
                        >
                            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {{ formatType(preference.type) }}
                            </span>
                        </SwitchInput>
                    </div>
                </RoundedContainer>
            </Tab>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import { Tab, Tabs, RoundedContainer } from '../components/UI';
import PageHeader from '../components/PageHeader.vue';
import { ref, onMounted } from 'vue';
import { Group, Notification, NotificationPreference } from '../types';
import { useRoute, useRouter } from "vue-router";
import LoadingScreen from '../components/LoadingScreen.vue';
import { groupsService } from '../api/groupsService';
import { notificationsService } from '../api/notificationsService';
import { userStore } from '../store/userStore';
import LoadingContainer from '../components/LoadingContainer.vue';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid';
import Dropdown from '../components/UI/Dropdown.vue';
import { SwitchInput } from '../components/UI/input';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const group = ref<Group>();
const loading = ref<boolean>();
const groupId = ref<string>();
const notifications = ref<Array<Notification>>([]);
const notifsLoading = ref<boolean>();
const preferences = ref<Array<NotificationPreference>>([]);
const isSavingId = ref<string | null>(null);

const route = useRoute();
const router = useRouter();

const formatType = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

onMounted(() => {
    fetchAllData();
});

async function fetchAllData() {
    try {
        loading.value = true;
        
        groupId.value = route.params.id || route.query.id;
    
        if (!groupId.value) {
            throw new Error('Group ID is missing');
        }

        // Fetch group details
        const { data: groupData, error: groupError } = await groupsService.getGroupByIdUsingView(groupId.value);

        if (groupError) throw new Error('Failed to load group details');
        group.value = groupData;

        await getNotifications();
        await getPreferences();

    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function getNotifications() {
    try {
        notifsLoading.value = true;

        const { data, error } = await notificationsService.getUserGroupNotifcations(userStore.user?.id, groupId.value);
        if (error) throw new Error('Failed to load group notifications');

        notifications.value = data || []

    } catch(err) {
        console.error(err);
    } finally {
        notifsLoading.value = false;
    }
}

async function getPreferences() {
    try {
        const { data, error } = await notificationsService.getUserGroupPreferences(userStore.user?.id, groupId.value);
        if (error) throw new Error('Failed to load preferences');

        preferences.value = data || []

    } catch(err) {
        console.error(err);
    }
}

async function handleToggle(id: string, allowPush: boolean) {
    try {
        isSavingId.value = id;

        await notificationsService.updateNotificationPreferencePush(id, allowPush);

        toast("Preference updated successfully!", {
            "type": "success",
            "position": "top-center"
        });
    } catch(err) {
        console.error(err);
    } finally {
        isSavingId.value = null;
    }
}

</script>