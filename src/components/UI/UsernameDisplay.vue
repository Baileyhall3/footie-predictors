<template>
    <div class="flex items-center gap-2">
        <span class="font-medium w-6 text-center" v-if="props.showUserPosition">{{ user.position }}.</span>
        <ArrowUpIcon class="size-3 text-green-600" v-if="user.movement == 'up'" />
        <ArrowDownIcon class="size-3 text-red-600" v-else-if="user.movement == 'down'" />
        <EqualsIcon class="size-3 text-gray-600" v-else-if="user.movement == 'same'" />
        <component
            :is="props.includeUserPredictionLink && props.gameweekId ? 'router-link' : 'span'"
            :to="props.includeUserPredictionLink && props.gameweekId ? `/user-gameweek-predictions/${props.gameweekId}/${user.user_id}` : undefined"
        >
            <div class="flex items-center space-x-2">
                <div v-if="user.profile_picture_url" class=" w-6 h-6 flex items-center justify-center rounded-full overflow-hidden me-2">
                    <img :src="user.profile_picture_url" alt="Profile Image" class="object-cover w-full h-full" />
                </div>
                <div v-else
                    class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium me-2"
                    :style="{ backgroundColor: user.bg_colour || '#ccc' }"
                >
                    {{ user.username.charAt(0).toUpperCase() }}
                </div>
                {{ user.username }}
            </div>
        </component>
        <span v-if="props.currentUserId && user.user_id === props.currentUserId" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
        
        <slot name="additionalDisplay"></slot>
    </div>
</template>

<script setup lang="ts">
import { ArrowUpIcon, ArrowDownIcon, EqualsIcon, StarIcon, TrophyIcon } from "@heroicons/vue/24/solid";

export interface User {
    position: number,
    movement: 'up' | 'down' | 'same',
    user_id: string,
    bg_colour: string,
    username: string,
    profile_picture_url: string,
}
const props = defineProps<{
    user: User,
    includeUserPredictionLink?: boolean,
    gameweekId?: string,
    currentUserId?: string
    showUserPosition?: boolean
}>();
</script>