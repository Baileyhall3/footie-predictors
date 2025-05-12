<template>
    <div>
        <!-- Tab headers -->
        <div class="flex overflow-x-auto no-scrollbar border-b border-t mb-8 space-x-4">
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
import { ref, provide, reactive, computed } from 'vue';

type BorderColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'gray';

export interface IProps {
    borderColour?: BorderColor
}

const props = withDefaults(defineProps<IProps>(), {
    borderColour: 'blue',
});

const tabs = reactive<{ header: string; index: number }[]>([]);
// const loadedTabs = reactive<boolean[]>([]);
const selected = ref(0);

// const colorMap = {
//   blue: 'text-blue-600 border-blue-600 hover:text-blue-600',
//   green: 'text-green-600 border-green-600 hover:text-green-600',
//   purple: 'text-purple-600 border-purple-600 hover:text-purple-600',
//   black: 'text-black border-black hover:text-black',
//   gray: 'text-gray-600 border-gray-600 hover:text-gray-600'
// };

const activeClass = computed(() => `border-b-2 ${colorMap[props.borderColour]}`);
const inactiveClass = computed(() => `text-gray-500 hover:${colorMap[props.borderColour].split(' ')[2]}`);

const colorMap = {
    blue: 'border-blue-600 text-blue-600 hover:text-blue-600',
    green: 'border-green-600 text-green-600 hover:text-green-600',
    purple: 'border-purple-600 text-purple-600 hover:text-purple-600',
    black: 'border-black text-black hover:text-black',
    gray: 'border-gray-600 text-gray-600 hover:text-gray-600',
} as const;

const getTabClass = (index: number) => {
    const base = 'px-4 py-2 text-sm font-medium transition';
    const active = colorMap[props.borderColour];
    const inactive = `text-gray-500 hover:${active.split(' ')[2]}`; // Just use the hover text color

    return selected.value === index
        ? `${base} ${active.split(' ').slice(0, 2).join(' ')}`
        : `${base} ${inactive}`;
};

function registerTab(header: string) {
    const index = tabs.length;
    tabs.push({ header, index });
    // loadedTabs.push(false);
    return index;
}

function selectTab(index: number) {
    selected.value = index;
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