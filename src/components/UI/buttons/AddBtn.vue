<template>
    <button
        type="button"
        class="p-1 rounded-md hover:bg-green-200"
        :title="props.title"
        :disabled="props.disabled"
        @click="add"
    >
        <PlusIcon class="size-5 text-green-600" />
    </button>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';
import { ActionButtonsProps } from "./componentProps";

const props = defineProps<ActionButtonsProps>();

const emit = defineEmits<{
    (e: 'addClicked'): void
}>();

function add() {
    emit("addClicked");
} 
</script>