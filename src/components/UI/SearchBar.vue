<template>
    <div class="flex items-center justify-center h-screen bg-gray-100">
        <div class="w-full max-w-xl">
            <div class="relative flex items-center w-full bg-white border border-gray-300 rounded-full shadow-md p-2">
                <svg class="w-5 h-5 text-gray-400 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <MagnifyingGlassIcon />
                    <!-- <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 12.65z" /> -->
                </svg>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    class="w-full px-4 py-2 text-gray-700 bg-transparent border-none focus:outline-none" 
                    oninput="this.style.cursor='none';" 
                    onmousemove="this.style.cursor='auto';" 
                />
                <button class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition">
                    Search
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

</script>