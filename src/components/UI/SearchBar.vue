<template>
    <div class=" max-w-xl">
        <div class="relative flex items-center bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <svg class="w-5 h-5 text-gray-400 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <MagnifyingGlassIcon />
            </svg>
            <input  
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder" 
                class="w-full md:w-64 px-4 py-2 text-sm transparent border-none focus:outline-none"
                oninput="this.style.cursor='none';" 
                onmousemove="this.style.cursor='auto';" 
                @keydown.enter="enterSearch"
            />
            <div class="flex items-center">
                <button type="button" @click="clearSearch" :class="searchQuery ? 'visible' : 'invisible'">
                    <XMarkIcon class="size-6 mr-2 text-gray-400" />
                </button>
            </div>
            <button class="h-full px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 transition rounded-r-md" @click="enterSearch()">
                Search
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { ref, computed } from 'vue';
import { XMarkIcon } from "@heroicons/vue/24/solid";

export interface IProps {
    searchBasis?: String
}
const props = defineProps<IProps>();

const emit = defineEmits(["search-entered"])
const searchQuery = ref("");

const searchPlaceholder = computed(() => {
    return `Search${props.searchBasis ? ' ' + props.searchBasis : ''}...`
});

function enterSearch() {
    emit("search-entered", searchQuery.value);
}

function clearSearch() {
    searchQuery.value = '';
    emit("search-entered", searchQuery.value);
}
</script>