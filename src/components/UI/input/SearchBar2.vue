<template>
    <div class="relative w-full md:w-64">
        <input
            type="text"
            v-model="props.modelValue"
            placeholder="Search for group..."
            @keydown.enter="handleSearchQuery"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    modelValue: string
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null): void
}>();

function handleSearchQuery(e: Event) {
    emit("update:modelValue", e.target.value);
}

</script>