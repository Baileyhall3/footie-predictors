<template>
    <div class="flex items-center gap-2">
        <ArrowUpIcon class="size-3 text-green-600" v-if="user.movement == 'up'" />
        <ArrowDownIcon class="size-3 text-red-600" v-else-if="user.movement == 'down'" />
        <EqualsIcon class="size-3 text-gray-600" v-else-if="user.movement == 'same'" />
        <component
            :is="props.includeUserPredictionLink && props.gameweekId ? 'router-link' : 'span'"
            :to="props.includeUserPredictionLink && props.gameweekId ? `/user-gameweek-predictions/${props.gameweekId}/${user.user_id}` : undefined"
        >
            <div class="flex items-center space-x-2">
                <div
                    class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium me-2"
                    :style="{ backgroundColor: user.bg_colour || '#ccc' }"
                >
                    {{ user.username.charAt(0).toUpperCase() }}
                </div>
                {{ user.username }}
            </div>
        </component>
        <!-- <TrophyIcon v-if="user.user_id === props.winnerId" class="size-5 text-yellow-300" />
        <span v-if="user.user_id === userStore.user?.id" class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">You</span>
        <StarIcon v-else-if="props.userId && user.user_id === props.userId" class="size-5 text-yellow-300" /> -->
    </div>
</template>

<script setup lang="ts">
import { ArrowUpIcon, ArrowDownIcon, EqualsIcon, StarIcon, TrophyIcon } from "@heroicons/vue/24/solid";

export interface User {
    position: number,
    movement: 'up' | 'down' | 'same',
    user_id: string,
    bg_color: string,
    username: string,
}
const props = defineProps<{
    user: User,
    includeUserPredictionLink?: boolean,
    gameweekId?: string
}>();

</script>