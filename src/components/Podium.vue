<template>
    <!-- Header -->
    <div class="flex justify-between items-center mb-4" v-if="props.header">
        <div class="items-center flex">
            <!-- <TrophyIcon class="h-6 w-6 text-yellow-500 mr-2" /> -->
            <span class="text-xl mr-2" v-if="props.icon">{{ props.icon }}</span>
            <h3 class="text-xl font-semibold">{{ props.header }}</h3>
        </div>
    </div>

    <!-- Podium Layout -->
    <div class="flex flex-col items-center gap-6">
        <!-- First Place -->
        <div v-if="props.podiumData[0]" class="w-full flex justify-center">
            <div class="bg-yellow-100 rounded-2xl px-4 py-2 shadow text-center w-1/2">
                <p class="text-sm text-gray-500">🥇 1st</p>
                <p class="text-lg font-bold">{{ props.podiumData[0][props.nameField] }}</p>
                <p class="text-lg" v-if="props.displayField">{{ props.podiumData[0][props.displayField] }}</p>
            </div>
        </div>

        <!-- Second & Third Place -->
        <div class="w-full flex justify-around">
            <!-- Second Place -->
            <div v-if="props.podiumData[1]" class="bg-gray-100 rounded-2xl px-4 py-2 shadow text-center w-1/3">
                <p class="text-sm text-gray-500">🥈 2nd</p>
                <p class="text-base font-semibold">{{ props.podiumData[1][props.nameField] }}</p>
                <p class="text-lg" v-if="props.displayField">{{ props.podiumData[1][props.displayField] }}</p>
            </div>

            <!-- Third Place -->
            <div v-if="props.podiumData[2]" class="bg-amber-100 rounded-2xl px-4 py-2 shadow text-center w-1/3">
                <p class="text-sm text-gray-500">🥉 3rd</p>
                <p class="text-base font-semibold">{{ props.podiumData[2][props.nameField] }}</p>
                <p class="text-lg" v-if="props.displayField">{{ props.podiumData[2][props.displayField] }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TrophyIcon } from '@heroicons/vue/24/solid';

export interface IProps {
    podiumData: any[],
    nameField?: string,
    header?: string
    icon?: string
    displayField?: string
}

const props = withDefaults(defineProps<IProps>(), {
    nameField: 'username'
});
</script>