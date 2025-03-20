<template>
    <div class="flex items-center">
        <div class="w-full max-w-xl">
            <div class="relative flex items-center w-full bg-white border border-gray-300 rounded-full shadow-md p-2">
                <svg class="w-5 h-5 text-gray-400 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <MagnifyingGlassIcon />
                </svg>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    v-model="searchQuery"
                    class="w-full px-2 py-1 text-gray-700 bg-transparent border-none focus:outline-none" 
                    oninput="this.style.cursor='none';" 
                    onmousemove="this.style.cursor='auto';" 
                    @keydown.enter="enterSearch"
                />
                <button class="px-2 py-1 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition" @click="enterSearch()">
                    Search
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { ref } from 'vue';

const searchQuery = ref("");
const emit = defineEmits(["search-entered"])

function enterSearch() {
    emit("search-entered", searchQuery.value);
}
</script>