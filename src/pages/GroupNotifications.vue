<template>
    <LoadingScreen v-if="loading" />
    <div class="h-full flex flex-col min-h-0" v-else>
        <GroupMobileHeader v-if="isMobileNav">
          <template #actions>
            <GroupNotificationsActionItems :groupId="groupId" />
          </template>
        </GroupMobileHeader>
        <PageHeader>
            <template #header>
                <img 
                    :src="group?.icon_url ?? '/images/green-football-md.png'" 
                    class="w-10 h-10 flex-shrink-0" 
                    alt="Group Logo"
                />
                <div>
                    <h2 class="text-2xl font-bold truncate">{{ group?.name }}</h2>
                    <h6 class="text-gray-500">Notifications</h6>
                </div>
            </template>
            <template #actionItems>
                <GroupNotificationsActionItems :groupId="groupId" v-if="!isMobileNav" />
            </template>
        </PageHeader>
        <Tabs>
            <Tab header="Notifications">
                <LoadingContainer v-if="notifsLoading" />
                <template v-else>
                    <div class="flex gap-2 mb-4 ">
                        <button 
                            @click="markAllAsRead" 
                            class="px-4 flex items-center bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            :disabled="unreadNotifications.length === 0"
                            :title="unreadNotifications.length === 0 ? 'All notifications have been read' : 'Mark all notifications as read'"
                        >
                        <CheckCheck class="size-5 me-2" />
                        Mark All as Read
                    </button>
                    <button @click="deleteAllRead" class="px-4 py-2 flex items-center bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                        :disabled="readNotifications.length === 0"
                        :title="readNotifications.length === 0 ? 'No notifications have been read' : 'Delete all notifications that have been read'"
                    >
                        <Trash2 class="size-5 me-2" />  
                        Delete All Read
                    </button>
                    </div>
                    <RoundedContainer v-if="notifications.length === 0">
                        <p class="text-gray-600">
                            No notifications for this group yet.
                        </p>
                    </RoundedContainer>

                    <NotificationCard :notifications="notifications" @notification-deleted="getNotifications" />
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
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import DateUtils from '../utils/dateUtils';
import NotificationPreferences from '../components/NotificationPreferences.vue';
import NotificationCard from '../components/NotificationCard.vue';
import { CheckCheck, Trash2 } from 'lucide-vue-next';
import GroupNotificationsActionItems from '../components/UI/actionItems/GroupNotifications.vue';
import GroupMobileHeader from '../components/nav/GroupMobileHeader.vue';
import { useLayout } from '../shared';

const group = ref<Group>();
const loading = ref<boolean>();
const groupId = ref<string>();
const notifications = ref<Array<Notification>>([]);
const notifsLoading = ref<boolean>();
const preferences = ref<Array<NotificationPreference>>([]);

const { isMobile, isMobileNav } = useLayout();

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
    getNotifications();

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