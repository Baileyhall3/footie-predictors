<template>
    <div class="relative w-full md:w-64">
        <input
            type="text"
            :value="props.modelValue"
            placeholder="Search for group..."
            @input="handleInput"
            @keydown.enter="handleSearchQuery"
            class="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <svg
            class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
        </svg>

        <XMarkIcon
            v-if="props.modelValue"
            class="absolute right-3 top-2.5 size-5 text-gray-500 cursor-pointer bg-gray-10 p-0.5 hover:bg-gray-200"
            @click="clearSearch"
        />
    </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
    modelValue: string;
    disableSearchWhileTyping?: boolean
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

function handleSearchQuery(e: Event) {
    emit("update:modelValue", (e.target as HTMLInputElement).value);
}

function handleInput(e: Event) {
    if (!props.disableSearchWhileTyping) {
        emit("update:modelValue", (e.target as HTMLInputElement).value);
    }
}

function clearSearch() {
    emit("update:modelValue", "");
}
</script>
