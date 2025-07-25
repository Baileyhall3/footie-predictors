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
                <h2 class="text-2xl font-bold truncate">Notifications</h2>
            </template>
            <template #actionItems>
                <Dropdown>
                    <template #trigger>
                        <EllipsisVerticalIcon class="size-6 text-gray-500" />
                    </template>
                    <template #items="{ close }">
                        <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item item-separator">
                            Go to Group
                        </router-link>
                        <button 
                            class="dropdown-item disabled:opacity-50 item-separator" 
                            @click="markAllAsRead(); close();"
                            :disabled="unreadNotifications.length === 0"
                            :title="unreadNotifications.length === 0 ? 'All notifications have been read' : 'Mark all notifications as read'"
                        >
                            Mark All as Read
                        </button>
                        <button
                            class="dropdown-item disabled:opacity-50 text-red-600"
                            :disabled="readNotifications.length === 0"
                            @click="deleteAllRead(); close();"
                            :title="readNotifications.length === 0 ? 'No notifications have been read' : 'Delete all notifications that have been read'"
                        >
                            Delete All Read
                        </button>
                    </template>
                </Dropdown>
            </template>
            <template #details>
                <p class="text-gray-500">Notifications for {{ group?.name }}</p>
            </template>
        </PageHeader>
        <Tabs>
            <Tab header="Notifications">
                <LoadingContainer v-if="notifsLoading" />
                <template v-else>
                    <RoundedContainer v-if="notifications.length === 0">
                        <p class="text-gray-600">
                            No notifications for this group yet.
                        </p>
                    </RoundedContainer>
                    <template v-else>
                        <RoundedContainer 
                            v-for="notif in notifications" 
                            :key="notif.id" 
                        >
                            <div class="flex items-center justify-between gap-4 flex-nowrap">
                                <div class="flex items-center gap-2 min-w-0 max-w-full flex-1"
                                    :class="['transition-opacity', notif.read ? 'opacity-60' : 'opacity-100']"
                                >
                                    <span 
                                        v-if="!notif.read"
                                        class="inline-block w-3 h-3 rounded-full me-1"
                                        :class="priorityBadgeClass(notif.priority)"
                                        title="Priority"
                                    ></span>
                                    <h3 class="text-xl font-semibold">{{ formatType(notif.type) }}</h3>
                                </div>
                                <div class="flex flex-wrap gap-2 justify-end flex-shrink-0">
                                    <Dropdown>
                                        <template #trigger>
                                            <EllipsisVerticalIcon class="size-5 text-gray-500" />
                                        </template>
                                        <template #items="{ close }">
                                            <button @click="toggleNotificationRead(notif); close();" 
                                                class="dropdown-item item-separator"
                                                >
                                                {{ `Mark as ${notif.read ? 'un' : ''}read` }}
                                            </button>
                                            <button class="text-red-600 dropdown-item" @click="deleteNotification(notif)">
                                                Delete
                                            </button>
                                        </template>
                                    </Dropdown>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2" :class="['transition-opacity', notif.read ? 'opacity-60' : 'opacity-100']">
                                <div class="flex items-center justify-between">
                                    <div class="text-sm text-gray-700 dark:text-gray-300">
                                        You have a new gameweek!  
                                        <span class="font-medium">Week {{ notif.template_data.week_number }}</span>  
                                        with a deadline of  
                                        <span class="font-semibold">
                                        {{ DateUtils.toFullDateTime(notif.template_data.deadline) }}
                                        </span>.
                                    </div>
                                </div>
    
                                <div class="flex gap-4 items-center">
                                    <RouterLink 
                                        :to="notif.link" 
                                        class="text-blue-600 hover:underline text-sm"
                                        @click="toggleNotificationRead(notif)"
                                    >
                                        View Gameweek →
                                    </RouterLink>
                                </div>
                                <div class="ms-auto">
                                    <span class="text-gray-500">
                                        {{ DateUtils.toRelevantDateOrTime(notif.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </RoundedContainer>
                    </template>
                </template>
            </Tab>  
            <Tab header="Preferences">
                <RoundedContainer>
                    <NotificationPreferences :preferences="preferences" />
                </RoundedContainer>
            </Tab>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import { Tab, Tabs, RoundedContainer } from '../components/UI';
import PageHeader from '../components/PageHeader.vue';
import { ref, onMounted, computed } from 'vue';
import { Group, Notification, NotificationPreference } from '../types';
import { useRoute, useRouter } from "vue-router";
import LoadingScreen from '../components/LoadingScreen.vue';
import { groupsService } from '../api/groupsService';
import { notificationsService } from '../api/notificationsService';
import { userStore } from '../store/userStore';
import LoadingContainer from '../components/LoadingContainer.vue';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid';
import Dropdown from '../components/UI/Dropdown.vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import DateUtils from '../utils/dateUtils';
import NotificationPreferences from '../components/NotificationPreferences.vue';

const group = ref<Group>();
const loading = ref<boolean>();
const groupId = ref<string>();
const notifications = ref<Array<Notification>>([]);
const notifsLoading = ref<boolean>();
const preferences = ref<Array<NotificationPreference>>([]);

const route = useRoute();
const router = useRouter();

const unreadNotifications = computed((): Notification[] => {
    return notifications.value.filter((x: Notification) => !x.read);
});

const readNotifications = computed((): Notification[] => {
    return notifications.value.filter((x: Notification) => x.read);
});

const formatType = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const priorityBadgeClass = (priority: string) => {
    switch (priority) {
        case 'info':
            return 'bg-blue-500'
        case 'success':
            return 'bg-green-500'
        case 'warning':
            return 'bg-yellow-500'
        case 'urgent':
            return 'bg-red-500'
        default:
            return 'bg-gray-400'
    }
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
        // unreadNotifications.value = data.length > 0 ? data.filter((x: Notification) => !x.read) : []
        // readNotifications.value = data.length > 0 ? data.filter((x: Notification) => x.read) : []

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

async function toggleNotificationRead(notif: Notification) {
    try {
        const { data, error } = await notificationsService.updateNotificationReadStatus(notif.id, !notif.read);
        if (error) throw new Error('Failed to update read status for notification');

        refreshNotification(notif.id);
    } catch(err) {
        console.error(err);
    }
}

async function deleteNotification(notif: Notification) {
    try {
        notifsLoading.value = true;

        const { success, error } = await notificationsService.deleteNotification(notif.id);
        if (error) throw new Error('Failed to delete notification');

        if (success) {
            toast("Notification deleted.", {
                "type": "success",
                "position": "top-center"
            });
            getNotifications();
        }
    } catch(err) {
        console.error(err);
    } finally {
        notifsLoading.value = false;
    }
}

async function markAllAsRead() {
    try {
        const unread = unreadNotifications.value;
        if (unread.length == 0) { return; }
        
        for (const notif of unread) {
            const { data, error } = await notificationsService.updateNotificationReadStatus(notif.id, !notif.read);
            if (error) throw new Error('Failed to update read status for notification');
    
            refreshNotification(notif.id);
        }

        toast("Notifications updated!", {
            "type": "success",
            "position": "top-center"
        });
    } catch(err) {
        console.error(err);
    }
}

async function deleteAllRead() {
    try {
        const read = readNotifications.value;
        if (read.length == 0) { return; }
        
        for (const notif of read) {
            const { success, error } = await notificationsService.deleteNotification(notif.id);
            if (error) throw new Error('Failed to delete notification');
            
            const targetIndex = notifications.value.findIndex(n => n.id === notif.id);
            notifications.value.splice(targetIndex, 1);
        }

        toast("All read notifications deleted.", {
            "type": "success",
            "position": "top-center"
        });
    } catch(err) {
        console.error(err);
    }
}

function refreshNotification(id: string) {
    const target = notifications.value.find(n => n.id === id);
    if (target) {
        target.read = !target.read;
    }
}
</script>