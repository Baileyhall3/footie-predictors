<template>
    <div class="relative bg-white border-4 border-yellow-400 shadow-lg rounded-xl p-6 mb-8">
        <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 p-2 rounded-full shadow-md">
            <TrophyIcon class="w-8 h-8 text-white" />
        </div>
        <div class="mt-6 text-center">
            <h2 class="text-xl font-bold text-gray-800 mb-2">
                🎉 {{ props.username }}{{ props.isCurrentUser ? ', you' : '' }} {{ props.isCurrentUser ? 'are' : 'is' }} 
                the winner of Gameweek {{ props.weekNumber ?? '' }}!
            </h2>
            <p class="text-gray-600 text-md">
                Total Points: <span class="font-semibold text-yellow-600">{{ props.totalPoints }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TrophyIcon } from '@heroicons/vue/24/solid';

export interface IProps {
    username: string,
    totalPoints: number,
    isCurrentUser: boolean,
    weekNumber?: number
}

const props = defineProps<IProps>();
</script>