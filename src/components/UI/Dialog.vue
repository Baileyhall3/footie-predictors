<template>
    <Teleport to="body">
        <div v-if="isVisible" 
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" 
            @click="hide"
            :class="{ 'backdrop-blur-md': props.bgBlur }"
        >
            <div 
                @click.stop
                :class="[
                    'bg-white w-full sm:h-auto max-h-[90dvh] flex flex-col rounded-lg overflow-hidden shadow-lg sm:mt-0',
                    sizeClass
                ]"
            >
                <div class="flex items-center px-6 py-4 border-b bg-white z-10">
                    <slot name="header"></slot>
                    <div class="text-lg font-semibold" v-if="!$slots.header">
                        {{ title }}
                    </div>
                    <button type="button" class="ms-auto text-gray-600 hover:text-gray-800" @click="hide">
                        <XMarkIcon class="size-6" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto min-h-0">
                    <slot name="body"></slot>
                </div>

                <div class="px-6 py-4 border-t flex justify-end bg-white z-10 gap-4">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
    title: string,
    modelValue?: boolean;
    bgBlur?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl';
}>();

const emit = defineEmits<{
    (e: 'shown'): void,
    (e: 'beforeHide'): void,
    (e: 'hidden'): void,
    (e: 'update:modelValue', isShown: boolean): void
}>();

const isVisible = ref<boolean>(props.modelValue ?? true);

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'max-w-sm';
        case 'md': return 'max-w-md';
        case 'lg': return 'max-w-3xl';
        case 'xl': return 'max-w-5xl';
        default: return 'max-w-md';
    }
});

function hide() {
    isVisible.value = false;
    emit("hidden");
    emit("update:modelValue", false);
}

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        emit("shown");
        console.log('shown');
    } else {
        emit("hidden");
        console.log('hidden');
    }
    isVisible.value = newVal ?? true;
});

</script>