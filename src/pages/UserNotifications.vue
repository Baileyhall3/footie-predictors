<template>
    <LoadingScreen v-if="isLoading" />
    <MainContent v-else>
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

        <template v-if="groupedNotifications.length">
            <GroupedGroup 
                v-for="(group, index) in groupedNotifications" 
                :key="group.group_id || `general-${index}`" 
                :group="{
                    group_id: group.group_id,
                    group_name: group.group_id ? group.group_name : 'General',
                    group_icon_url: group.group_icon_url
                }"
                :hide-image="!group.group_id"   
            >
                <NotificationCard :notifications="group.visibleNotifications" />

                <button
                    v-if="group.hasMore && group.group_id"
                    class="mt-2 text-sm text-blue-600 hover:underline justify-center flex w-full"
                    @click="group.group_id ? $router.push(`/group/${group.group_id}/notifications`) : ''"
                >
                    View all ({{ group.totalCount }})
                </button>
            </GroupedGroup>
        </template>

        <div v-else class="bg-white rounded-xl shadow p-10 text-center text-gray-500 mt-4 border border-dashed border-gray-300">
            <p class="text-lg font-medium mb-2">No notifications yet!</p>
        </div>
    </MainContent>
</template>

<script setup lang="ts">
import LoadingScreen from '../components/LoadingScreen.vue';
import { ref, onMounted, computed } from 'vue';
import type { Notification } from '../types';
import { SearchBar2 } from '../components/UI/input';
import NotificationCard from '../components/NotificationCard.vue';
import { notificationsStore } from '../store/notificationsStore';
import MainContent from '../components/layout/MainContent.vue';
import GroupedGroup from '../components/UI/GroupedGroup.vue';

type ReadFilter = 'all' | 'unread' | 'read'

const isLoading = ref<boolean>();
const notifications = ref<Array<Notification>>([]);
const searchQuery = ref<string>('');
const activeFilter = ref<ReadFilter>('all');

onMounted(() => {
    fetchAllData();
});

const groupedNotifications = computed(() => {
    let filtered = notificationsStore.notifications;

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

    return Object.values(groups).map(group => ({
        ...group,
        totalCount: group.notifications.length,
        hasMore: group.notifications.length > 5,
        visibleNotifications: group.notifications.slice(0, 5)
    })).sort((a, b) => {
        if (!a.group_id) return -1;
        if (!b.group_id) return 1;
        return 0;
    });
});

async function fetchAllData() {
    try {
        isLoading.value = false;
        notifications.value = notificationsStore.notifications || [];
    } catch(err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

function handleSearchQuery() {
    const query = searchQuery.value.trim().toLowerCase();

    if (query) {
        notifications.value = notificationsStore.notifications.filter(group =>
            group.group_name && group.group_name.toLowerCase().includes(query)
        );
    } else {
        notifications.value = notificationsStore.notifications;
    }
}

function setActiveFilter(filter: ReadFilter) {
    activeFilter.value = filter;
}
</script>