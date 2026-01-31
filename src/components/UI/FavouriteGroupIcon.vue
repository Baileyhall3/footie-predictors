<template>
    <router-link 
        :to="`/group/${userStore.userProfile?.favourite_group_id}`"
    >
        <div
            class="relative w-5 h-5 ring-1 ring-green-600 ring-offset-2 me-2 rounded-full"
        >
            <div class="w-full h-full rounded-full overflow-hidden">
                <img
                    :src="userStore.userProfile?.favourite_group_icon_url ?? '/images/green-football-md.png'"
                    alt="Group Logo"
                    class="w-full h-full object-cover"
                />
            </div>

            <div
                class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-600 ring-2 ring-white flex items-center justify-center"
            >
                <StarIcon class="w-3 h-3 text-yellow-400" />
            </div>
        </div>
    </router-link>
</template>

<script setup lang="ts">
import { userStore } from '../../store/userStore';
import { StarIcon } from '@heroicons/vue/24/solid';
</script>