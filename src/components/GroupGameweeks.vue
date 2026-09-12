<template>
    <RoundedContainer header-text="Gameweeks">
        <template v-if="props.isAdmin && !props.hideCreateGameweeks" #headerContent>
            <router-link :to="`/group/${props.groupId}/create-gameweek`">
                <button 
                    class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                    + Add Gameweek
                </button>
            </router-link>
        </template>
        <div v-if="gameweeks.length">
            <template v-for="(gameweek, index) in gameweeks" :key="gameweek.id">
                <div class="flex justify-between items-start py-3" :class="{ 'border-b' : index !== (gameweeks.length - 1)}">
                    <div>
                        <div class="items-center flex">
                            <router-link :to="`/gameweek/${gameweek.id}`" class="text-blue-600 hover:underline font-medium">
                                Gameweek {{ gameweek.week_number }}
                            </router-link>
                            <LockClosedIcon class="size-4 ms-2" v-if="gameweek.is_locked" />
                            <ActiveIcon v-if="gameweek.is_active" :size="5" class="ms-2" />
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
                </div>
            </template>
        </div>
        <p v-else class="text-gray-600 py-2">No gameweeks yet.</p>
    </RoundedContainer>
</template>

<script setup lang="ts">
import DateUtils from '../utils/dateUtils';
import { LockClosedIcon } from "@heroicons/vue/24/solid";
import { Gameweek } from '../types';
import ActiveIcon from './UI/ActiveIcon.vue';
import { RoundedContainer } from './UI/index.ts';

export interface IProps {
    gameweeks: Gameweek[],
    isAdmin: boolean,
    groupId: string,
    hideCreateGameweeks?: boolean
}

const props = defineProps<IProps>();

</script>