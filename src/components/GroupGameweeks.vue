<template>
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Gameweeks</h3>
            <router-link :to="`/group/${props.groupId}/create-gameweek`">
                <button 
                    v-if="props.isAdmin" 
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
                    <div class="text-sm text-gray-500">
                        Deadline: {{ DateUtils.toFullDateTime(gameweek.deadline) }}
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    <div v-if="gameweek.is_active" class="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full transition">
                        Active
                    </div>
                </div>
            </div>
        </div>
        <p v-else class="text-gray-500 py-2">No gameweeks yet.</p>
    </div>
</template>

<script setup lang="ts">
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon } from "@heroicons/vue/24/solid";

type Gameweek = {
    id: string,
    week_number: number,
    is_active: boolean,
    is_locked: boolean,
    deadline: Date | string
}

export interface IProps {
    gameweeks: Gameweek[],
    isAdmin: boolean,
    groupId: string
}

const props = defineProps<IProps>();

</script>