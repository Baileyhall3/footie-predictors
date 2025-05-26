<template>
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Gameweeks</h3>
            <router-link :to="`/group/${props.groupId}/create-gameweek`" v-if="props.isAdmin && !props.hideCreateGameweeks">
                <button 
                    class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                    + Add Gameweek
                </button>
            </router-link>
        </div>
            
        <div v-if="gameweeks.length">
            <div v-for="gameweek in gameweeks" :key="gameweek.id" class="flex justify-between items-center border-b py-3">
                <div>
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
                </div>
            </div>
        </div>
        <p v-else class="text-gray-600 py-2">No gameweeks yet.</p>
    </div>
</template>

<script setup lang="ts">
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon } from "@heroicons/vue/24/solid";
import { Gameweek } from '../types';

export interface IProps {
    gameweeks: Gameweek[],
    isAdmin: boolean,
    groupId: string,
    hideCreateGameweeks?: boolean
}

const props = defineProps<IProps>();

</script>