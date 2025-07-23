<template>
    <button 
        type="button"
        @click="beginEdit" 
        class="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50" 
        :title="props.title"
        :disabled="props.disabled"
    >
        <PencilSquareIcon class="size-5 text-gray-500" />
    </button>
</template>

<script setup lang="ts">
import { PencilSquareIcon } from "@heroicons/vue/24/solid";
import { ActionButtonsProps } from "./componentProps";

const props = defineProps<ActionButtonsProps>();

const emit = defineEmits<{
    (e: 'begin-edit'): void
}>();

function beginEdit() {
    emit("begin-edit");
}
</script>