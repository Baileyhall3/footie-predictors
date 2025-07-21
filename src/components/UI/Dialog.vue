<template>
    <Teleport to="body">
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col rounded-lg overflow-hidden shadow-lg">
                <div class="px-6 py-4 border-b text-lg font-semibold sticky top-0 bg-white z-10">
                    {{ title }}
                </div>
                <div class="flex-1 overflow-y-auto">
                    <slot name="details"></slot>
                </div>
                <div class="px-6 py-4 border-t flex justify-end sticky bottom-0 bg-white z-10 gap-4">
                    <slot name="dialogFooter"></slot>
                    <!-- <button @click="cancel" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                        Cancel
                    </button>
                    <button @click="confirm" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        {{ props.confirmText }}
                    </button> -->
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string,
    // size: 'sm' | 'md' | 'lg'
}>()
</script>