<template>
    <router-link to="/notifications" class="relative hover:underline me-2">
        <BellIcon class="size-5" />
        <span
            v-if="notificationsStore.unreadNotifications > 0"
            class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-[10px] leading-none text-white bg-red-600 rounded-full"
        >
            {{ displayNotifCount }}
        </span>
    </router-link>
</template>

<script setup lang="ts">
import { BellIcon } from '@heroicons/vue/24/outline';
import { notificationsStore } from '../../store/notificationsStore';
import { computed } from 'vue';

const displayNotifCount = computed(() => {
    return notificationsStore.unreadNotifications > 9 ? '9+' : notificationsStore.unreadNotifications
});
</script>