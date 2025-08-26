<template>
    <LoadingScreen v-if="isLoading" />
    <div v-else class="container mx-auto px-6 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 class="text-2xl font-bold">Your Notifications</h2>
            <SearchBar2 v-model="searchQuery" @update:model-value="handleSearchQuery" placeholder="Search for group..." />
        </div>
        <div class="flex gap-2 flex-wrap mb-4">
            <!-- Example filter buttons -->
            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                @click="setActiveFilter('all')"
                :class="{ 'border border-blue-600' : activeFilter === 'all' }"
            >
                All
            </button>
            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                @click="setActiveFilter('unread')"
                :class="{ 'border border-blue-600' : activeFilter === 'unread' }"
            >
                Unread
            </button>
            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                @click="setActiveFilter('read')"
                :class="{ 'border border-blue-600' : activeFilter === 'read' }"
            >
                Read
            </button>
        </div>

        <div v-if="groupedNotifications.length">
            <div 
                v-for="(group, index) in groupedNotifications" 
                :key="group.group_id || `general-${index}`" 
                class="mb-8"
            >
                <div class="flex items-center mb-4">
                    <template v-if="group.group_id">
                        <img :src="group.group_icon_url ?? '/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
                        <h3 class="text-xl font-semibold">
                            <router-link 
                                :to="`/group/${group.group_id}`" 
                                class="text-blue-600 hover:underline"
                            >
                                {{ group.group_name }}
                            </router-link>
                        </h3>
                    </template>
                    <template v-else>
                        <h3 class="text-xl font-semibold">General</h3>
                    </template>
                </div>

                <NotificationCard :notifications="group.notifications" @notification-deleted="handleNotificationDelete" />
            </div>
        </div>

        <div v-else class="bg-white rounded-xl shadow p-10 text-center text-gray-500 mt-4 border border-dashed border-gray-300">
            <p class="text-lg font-medium mb-2">No notifications yet!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import LoadingScreen from '../components/LoadingScreen.vue';
import { ref, onMounted, computed } from 'vue';
import type { Notification } from '../types';
import { notificationsService } from '../api/notificationsService';
import { userStore } from '../store/userStore';
import { SearchBar2 } from '../components/UI/input';
import NotificationCard from '../components/NotificationCard.vue';

type ReadFilter = 'all' | 'unread' | 'read'

const isLoading = ref<boolean>();
const notifications = ref<Array<Notification>>([]);
const allNotifications = ref<Array<Notification>>([]);
const searchQuery = ref<string>('');
const activeFilter = ref<ReadFilter>('all');

onMounted(() => {
    fetchAllData();
});

const groupedNotifications = computed(() => {
    let filtered = allNotifications.value;

    if (activeFilter.value === 'read') {
        filtered = filtered.filter(n => n.read === true);
    } else if (activeFilter.value === 'unread') {
        filtered = filtered.filter(n => n.read === false);
    }

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim().toLowerCase();
        filtered = filtered.filter(n => 
            n.group_name?.toLowerCase().includes(query)
        );
    }

    const groups: Record<string, { 
        group_name: string | null, 
        group_id: string | null, 
        group_icon_url: string | null, 
        notifications: Notification[] 
    }> = {};

    filtered.forEach(notif => {
        const key = notif.group_id || 'general';
        if (!groups[key]) {
            groups[key] = {
                group_name: notif.group_name,
                group_id: notif.group_id || null,
                group_icon_url: notif.group_icon_url || null,
                notifications: []
            };
        }
        groups[key].notifications.push(notif);
    });

    return Object.values(groups).sort((a, b) => {
        if (!a.group_id) return -1;
        if (!b.group_id) return 1;
        return 0;
    });
});

async function fetchAllData() {
    try {
        isLoading.value = false;

        const { data, error } = await notificationsService.getAllUserNotifcations(userStore.user?.id);
        if (error) throw new Error(error);

        notifications.value = data || [];
        allNotifications.value = data || [];
    } catch(err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

function handleSearchQuery() {
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        notifications.value = allNotifications.value.filter(group =>
            group.group_name && group.group_name.toLowerCase().includes(query)
        );
    } else {
        notifications.value = allNotifications.value;
    }
}

function setActiveFilter(filter: ReadFilter) {
    activeFilter.value = filter;
}

function handleNotificationDelete(notif: Notification) {
    allNotifications.value = allNotifications.value.filter(n => n.id !== notif.id);
}

</script>