<template>
    <div class="flex flex-col h-full min-h-0">
        <!-- Tab headers -->
        <div class="relative z-10 bg-white shrink-0 border-b">
            <div class="flex overflow-x-auto no-scrollbar space-x-4">
                <button v-for="(tab, index) in tabs"
                    :key="index"
                    @click="selectTab(index)"
                    class="shrink-0 px-4 py-2 text-sm font-medium transition whitespace-nowrap"
                    :class="[
                        selected === index
                        ? `border-b-2 border-${props.borderColour}-600 text-${props.borderColour}-600`
                        : `text-gray-500 hover:text-${props.borderColour}-600`
                    ]"
                >
                    {{ tab.header }}
                </button>
            </div>
        </div>

        <!-- Tab content -->
         <div 
            class="flex-1 overflow-y-auto min-h-0 touch-pan-y"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        >
            <div :style="{ transform: `translateX(${deltaX * 0.25}px)` }" class="transition-transform pt-8">
                <slot />
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, provide, reactive, computed, watch } from 'vue';
import type { TouchEvent } from 'vue'

type BorderColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'gray';

export interface IProps {
    borderColour?: BorderColor,
    modelValue?: number;
}

const props = withDefaults(defineProps<IProps>(), {
    borderColour: 'blue',
    modelValue: 0
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
    (e: 'tab-selected', index: number): void;
}>();

const tabs = reactive<{ header: string; index: number }[]>([]);
// const loadedTabs = reactive<boolean[]>([]);
const selected = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
    selected.value = newVal;
});

const colorMap = {
    blue: 'border-blue-600 text-blue-600 hover:text-blue-600',
    green: 'border-green-600 text-green-600 hover:text-green-600',
    purple: 'border-purple-600 text-purple-600 hover:text-purple-600',
    black: 'border-black text-black hover:text-black',
    gray: 'border-gray-600 text-gray-600 hover:text-gray-600',
} as const;

function registerTab(header: string) {
    const index = tabs.length;
    tabs.push({ header, index });
    // loadedTabs.push(false);
    return index;
}

function selectTab(index: number) {
    selected.value = index;
    emit("tab-selected", index);
    emit("update:modelValue", index);
    // loadedTabs[index] = true;
}

provide('registerTab', registerTab);
provide('selectedTab', selected);
// provide('loadedTabs', loadedTabs);

// Swipe handling
const startY = ref(0);
const startX = ref(0)
const deltaX = ref(0)
const threshold = 60

function onTouchStart(e: TouchEvent) {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
}

function onTouchMove(e: TouchEvent) {
  const dx = e.touches[0].clientX - startX.value
  const dy = e.touches[0].clientY - startY.value

  if (Math.abs(dx) > Math.abs(dy)) {
    deltaX.value = dx
  }
}

function onTouchEnd() {
  if (Math.abs(deltaX.value) > threshold) {
    if (deltaX.value < 0) {
      // Swipe left → next tab
      if (selected.value < tabs.length - 1) {
        selectTab(selected.value + 1)
      }
    } else {
      // Swipe right → previous tab
      if (selected.value > 0) {
        selectTab(selected.value - 1)
      }
    }
  }

  // Always snap back
  deltaX.value = 0
}
</script>
  
<style scoped>
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>