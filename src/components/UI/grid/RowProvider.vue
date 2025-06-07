<template>
    <slot />
</template>

<script setup lang="ts">
import { provide } from 'vue';

const props = defineProps<{
  row: Record<string, any>
}>();

provide('row', props.row);
</script>
