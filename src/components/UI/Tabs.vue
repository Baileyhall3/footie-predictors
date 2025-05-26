<template>
    <div>
        <!-- Tab headers -->
        <div class="flex overflow-x-auto no-scrollbar bg-white mb-8 space-x-4">
            <button v-for="(tab, index) in tabs"
                :key="index"
                @click="selectTab(index)"
                class="shrink-0"
                :class="[
                    'px-4 py-2 text-sm font-medium transition whitespace-nowrap',
                    selected === index
                        ? `border-b-2 border-${props.borderColour}-600 text-${props.borderColour}-600`
                        : `text-gray-500 hover:text-${props.borderColour}-600`
                ]"
            >
                {{ tab.header }}
            </button>
        </div>

        <!-- Tab content -->
        <div>
            <slot />
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, provide, reactive, computed, watch } from 'vue';

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