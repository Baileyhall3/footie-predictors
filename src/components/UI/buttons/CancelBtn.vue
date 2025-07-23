<template>
    <button 
        type="button"
        @click="cancelChanges" 
        class="p-1 rounded-md hover:bg-red-200 disabled:opacity-50" 
        title="Cancel changes"
        :disabled="props.disabled"
    >
        <XMarkIcon class="size-5 text-red-700" />
    </button>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/solid";
import { ActionButtonsProps } from "./componentProps";

const props = defineProps<ActionButtonsProps>();

const emit = defineEmits<{
    (e: 'cancelled'): void
}>();

function cancelChanges() {
    emit("cancelled");
}
</script>