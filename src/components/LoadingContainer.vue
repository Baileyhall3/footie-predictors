<template>
    <div class="flex items-center justify-center py-12" :style="{ backgroundColor: props.bgColor }">
        <div class="text-center">
            <svg class="animate-spin h-12 w-12 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" :style="{ color: props.color }">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 class="text-xl font-semibold text-gray-800" v-if="!props.hideLoadingMessage">Loading...</h2>
            <p class="text-gray-600 mt-2">{{ props.message }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    hideLoadingMessage?: boolean,
    message?: string
    color?: string
    bgColor?: string
}>(), {
    color: 'rgb(22 163 74 / 1)',
    bgColor: '#ffffff'
});
</script>
