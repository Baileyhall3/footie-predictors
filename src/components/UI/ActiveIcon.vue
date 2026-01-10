<template>
    <StarIcon class="text-yellow-300" :class="`size-${props.size}`" title="Active" />
</template>

<script setup lang="ts">
import { StarIcon } from "@heroicons/vue/24/solid";

const props = withDefaults(defineProps<{
    size?: number
}>(), {
    size: 5
});
</script>