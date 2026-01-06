<template>
    <router-link :to="`/gameweek/${gameweek.id}`">
        <div
            class="rounded-xl p-4 transition-all duration-300 bg-white hover:shadow-lg border border-gray-200 hover:border-gray-300 h-full"
        >
            <div class="justify-center flex mb-4 font-semibold text-lg">
                Gameweek {{ gameweek.week_number }}
            </div>
            <div>
                <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span class="font-semibold">Deadline: </span>
                    {{ DateUtils.toDateTime(gameweek.deadline) }}
                </div>
                <div class="flex items-center justify-between text-sm text-gray-600" v-if="gameweek.is_finished && gameweek.winner_name">
                    <span class="font-semibold">Winner: </span>
                    {{ gameweek.winner_name }}
                </div>
            </div>
        </div>
    </router-link>

    <!-- <div>
        <div class="items-center flex">
            <router-link :to="`/gameweek/${gameweek.id}`" class="text-blue-600 hover:underline font-medium">
                Gameweek {{ gameweek.week_number }}
            </router-link>
            <LockClosedIcon class="size-4 ms-2" v-if="gameweek.is_locked" />
        </div>
        <div class="text-sm text-gray-600">
            <span class="font-semibold">Deadline: </span>
            {{ DateUtils.toFullDateTime(gameweek.deadline) }}
        </div>
        <div class="text-sm text-gray-600" v-if="gameweek.is_finished && gameweek.winner_name">
            <span class="font-semibold">Winner: </span>
            {{ gameweek.winner_name }}
        </div>
    </div>
    
    <div class="flex items-center gap-2">
        <div v-if="gameweek.is_active" class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full transition">
            Active
        </div>
    </div> -->

</template>

<script setup lang="ts">
import type { Gameweek } from '../../types';
import { computed, ref } from 'vue'; 
import { LockClosedIcon } from "@heroicons/vue/24/solid";
import DateUtils from '../../utils/dateUtils';

const props = defineProps<{
    gameweek: Gameweek
}>();

const achievementDetail = ref(null);

</script>