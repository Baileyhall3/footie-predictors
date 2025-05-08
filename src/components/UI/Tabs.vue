<template>
    <div>
        <!-- Tab headers -->
        <div class="flex border-b mb-4 space-x-4">
            <button v-for="(tab, index) in tabs"
                :key="index"
                @click="selectTab(index)"
                :class="[
                    'px-4 py-2 text-sm font-medium transition',
                    selected === index
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
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
import { ref, provide, reactive, watchEffect } from 'vue';

const tabs = reactive<{ header: string; index: number }[]>([]);
const selected = ref(0);

function registerTab(header: string) {
    const index = tabs.length;
    tabs.push({ header, index });
    return index;
}

function selectTab(index: number) {
    selected.value = index;
}

provide('registerTab', registerTab);
provide('selectedTab', selected);
</script>
  