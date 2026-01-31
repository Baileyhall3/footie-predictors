<template>
    <header
        class="sticky top-0 z-40 bg-green-600 border-b text-white"
        style="padding-top: env(safe-area-inset-top)"
    >
        <div class="h-12 flex items-center justify-between px-6">

            <!-- Left: Page title -->
            <h2 class="text-2xl font-semibold  capitalize">
                {{ title }}
            </h2>

            <!-- Right: Actions -->
            <div class="flex items-center gap-3">
                <FavouriteGroupIcon 
                    v-if="userStore.userProfile?.favourite_group_id"
                />
                <NotificationBell v-if="userStore.isAuthenticated" />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { userStore } from '../../store/userStore';
import { FavouriteGroupIcon, NotificationBell } from '../UI';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const title = computed(() => {
    if (route.meta?.title) return route.meta.title
    return route.name?.toString().replace('-', ' ') ?? ''
});
</script>