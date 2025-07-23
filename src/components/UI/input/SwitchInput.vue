<template>
    <div
        class="flex flex-wrap gap-2 mt-4"
        :class="{ 'opacity-50 pointer-events-none': props.disabled }"
    >
        <label class="inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            :checked="modelValue"
            @change="onToggle"
            class="sr-only peer"
            :disabled="props.disabled"
        >
        <div
            class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full
                rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-['']
                after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border
                after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600
                peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
        ></div>

        <slot></slot>
        </label>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    modelValue: boolean,
    disabled?: boolean
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>();

const onToggle = (e: Event) => {
    const target = e.target as HTMLInputElement
    emit('update:modelValue', target.checked)
}
</script>