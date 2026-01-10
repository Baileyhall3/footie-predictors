<template>
    <div class="flex justify-center items-center w-full">
        <div class="flex justify-center w-full">
            <span class="text-md font-semibold" :class="props.class">
                {{ props.homeScore !== null && props.homeScore !== undefined ? props.homeScore : '-' }}
            </span>
        </div>

        <div class="border-l border-gray-300 h-5"></div>

        <div class="flex justify-center w-full">
            <span class="text-md font-semibold" :class="props.class">
                {{ props.awayScore !== null && props.awayScore !== undefined ? props.awayScore : '-' }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    homeScore?: number | null;
    awayScore?: number | null;
    class?: string;
}>();
</script>