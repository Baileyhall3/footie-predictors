<template>
    <Teleport to="body">
        <div v-if="isVisible" 
            :class="[
                'fixed inset-0 bg-black bg-opacity-50 z-50 flex',
                presentation === 'dialog' ? 'items-center justify-center' : 'items-end',
                { 'backdrop-blur-md': props.bgBlur }
            ]"
            @click="hide"
        >
            <div
                @click.stop
                :style="presentation === 'sheet'
                    ? { transform: `translateY(${dragOffset}px)` }
                    : undefined"
                :class="[
                    'bg-white w-full flex flex-col overflow-hidden shadow-lg',
                    presentation === 'dialog'
                        ? ['rounded-lg max-h-[90dvh]', sizeClass]
                        : [
                            'rounded-t-2xl max-h-[85dvh]',
                            'touch-none',
                            !isDragging && (isHiding ? 'animate-sheet-out' : 'animate-sheet-in')
                        ]
                ]"
            >
                <!-- Grab handle -->
                <div
                    v-if="presentation === 'sheet'"
                    class="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2"
                    @touchstart="onTouchStart"
                    @touchmove="onTouchMove"
                    @touchend="onTouchEnd"
                />
                <div class="flex items-center px-6 py-4 border-b bg-white z-10">
                    <slot name="header"></slot>
                    <div class="text-lg font-semibold" v-if="!$slots.header">
                        {{ title }}
                    </div>
                    <button v-if="presentation === 'dialog'" type="button" class="ms-auto text-gray-600 hover:text-gray-800" @click="hide">
                        <XMarkIcon class="size-6" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto min-h-0">
                    <slot name="body"></slot>
                </div>

                <div class="px-6 py-4 border-t flex justify-end bg-white z-10 gap-4" v-if="$slots.footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { useWindowSize } from '@vueuse/core';

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
const isHiding = ref(false);
const startY = ref<number | null>(null);
const currentY = ref(0);
const isDragging = ref(false);

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 640);

const presentation = computed((): 'sheet' | 'dialog' => isMobile.value ? 'sheet' : 'dialog')

const dragOffset = computed(() => {
    if (!isDragging.value) return 0;
    return Math.max(0, currentY.value - (startY.value ?? 0));
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'max-w-sm';
        case 'md': return 'max-w-md';
        case 'lg': return 'max-w-3xl';
        case 'xl': return 'max-w-5xl';
        default: return 'max-w-md';
    }
});

function onTouchStart(e: TouchEvent) {
    if (presentation.value !== 'sheet') return;

    startY.value = e.touches[0].clientY;
    isDragging.value = true;
}

function onTouchMove(e: TouchEvent) {
    if (!isDragging.value || startY.value === null) return;

    currentY.value = e.touches[0].clientY;
}

function onTouchEnd() {
    if (!isDragging.value) return;

    const distance = dragOffset.value;

    isDragging.value = false;
    startY.value = null;
    currentY.value = 0;

    // threshold (tweakable)
    if (distance > 120) {
        hide(); // dismiss
    }
}

function hide() {
    if (presentation.value === 'sheet') {
        isHiding.value = true;

        // wait for animation to finish
        setTimeout(() => {
            isHiding.value = false;
            isVisible.value = false;
            emit('hidden');
            emit('update:modelValue', false);
        }, 250);
    } else {
        isVisible.value = false;
        emit('hidden');
        emit('update:modelValue', false);
    }
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

<style scoped>
@keyframes sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes sheet-down {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

.animate-sheet-in {
  animation: sheet-up 0.25s ease-out forwards;
}

.animate-sheet-out {
  animation: sheet-down 0.25s ease-in forwards;
}

.touch-none {
  touch-action: none;
}
</style>