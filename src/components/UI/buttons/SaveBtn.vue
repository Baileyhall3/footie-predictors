<template>
    <button 
        type="button" 
        @click="saveChanges" 
        class="p-1 rounded-md hover:bg-blue-200 disabled:opacity-50" 
        title="Save changes"
        :disabled="props.disabled"
    >
        <CheckIcon class="size-5 text-blue-600" />
    </button>
</template>

<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/solid";
import { ActionButtonsProps } from "./componentProps";

const props = defineProps<ActionButtonsProps>();

const emit = defineEmits<{
    (e: 'saved'): void
}>();

function saveChanges() {
    emit("saved");
}
</script>