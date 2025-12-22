<template>
    <RoundedContainer 
        v-for="notif in props.notifications" 
        :key="notif.id" 
    >
        <div class="flex items-center justify-between gap-4 flex-nowrap">
            <div class="flex items-center gap-2 min-w-0 max-w-full flex-1"
                :class="['transition-opacity', notif.read ? 'opacity-60' : 'opacity-100']"
            >
                <span 
                    v-if="!notif.read"
                    class="inline-block w-3 h-3 rounded-full me-1"
                    :class="getPriorityBadgeClass(notif.priority)"
                    :title="`Priority: ${notif.priority}`"
                ></span>
                <h3 class="text-xl font-semibold">{{ notif.template_data.header ?? formatType(notif.type) }}</h3>
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
                        <button class="text-red-600 dropdown-item" @click="deleteNotification(notif); close();">
                            Delete
                        </button>
                    </template>
                </Dropdown>
            </div>
        </div>
        <div class="flex flex-col gap-2" :class="['transition-opacity', notif.read ? 'opacity-60' : 'opacity-100']">
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700 dark:text-gray-300">
                    <div class="prose mt-2" v-if="notif.template_data.content" v-html="notif.template_data.content"></div>
                </div>
            </div>

            <span v-if="notif.expires_at" class="text-gray-500 text-sm">Expires {{ DateUtils.toFullDateTime(notif.expires_at) }}</span>
            <div class="flex items-center">
                <RouterLink 
                    :to="notif.link" 
                    class="text-blue-600 hover:underline text-sm"
                    @click="toggleNotificationRead(notif)"
                >
                    <template v-if="notif.template_data.link_text">
                        {{ notif.template_data.link_text }} →
                    </template>
                    <template v-else-if="notif.type === 'welcome_message'">
                        App Info →
                    </template>
                    <template v-else-if="notif.type === 'gameweek_created' || notif.type === 'gameweek_deadline'">
                        View Gameweek →
                    </template>
                </RouterLink>
                <div class="ms-auto">
                    <span class="text-gray-500">
                        {{ DateUtils.toRelevantDateOrTime(notif.created_at) }}
                    </span>
                </div>
            </div>
        </div>
    </RoundedContainer>
</template>

<script setup lang="ts">
import DateUtils from '../utils/dateUtils';
import { RoundedContainer, Dropdown } from './UI';
import type { Notification } from '../types';
import { notificationsService } from '../api/notificationsService';
import { ref } from 'vue';
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { getPriorityBadgeClass } from '../utils/sharedFunctions';
import { notificationsStore } from '../store/notificationsStore';

const props = defineProps<{
    notifications: Notification[],
    readonly?: boolean
}>();

const emit = defineEmits<{
    (e: 'loading'): void // not sure this will be suitable?
    (e: 'notification-deleted', notification: Notification): void
    (e: 'notification-updated', notification: Notification, field: string, newValue: any): void
}>();

const notifsLoading = ref<boolean>(false);

const formatType = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

async function toggleNotificationRead(notif: Notification) {
    try {
        const { data, error } = await notificationsService.updateNotificationReadStatus(notif.id, !notif.read);
        if (error) throw new Error('Failed to update read status for notification');

        emit("notification-updated", notif, 'read', !notif.read);
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
            emit("notification-deleted", notif);
            toast("Notification deleted.", {
                "type": "success",
                "position": "top-center"
            });
            notificationsStore.removeNotificationById(notif.id);
            // const targetIndex = props.notifications.findIndex(n => n.id === notif.id);
            // props.notifications.splice(targetIndex, 1);
        }
    } catch(err) {
        console.error(err);
    } finally {
        notifsLoading.value = false;
    }
}

function refreshNotification(id: string) {
    const target = props.notifications.find(n => n.id === id);
    if (target) {
        target.read = !target.read;
    }
}
</script>