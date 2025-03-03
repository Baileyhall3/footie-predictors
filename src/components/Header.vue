<template>
    <header :class="[props.headerColor, props.sticky ? 'sticky top-0' : '', 'z-50', props.headerTextColor]" 
        class="w-full shadow-lg">
        <!-- First Layer -->
        <div class="flex items-center py-3 px-6 border-b relative">
            <div class="lg:hidden absolute left-6">
                <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-700">
                    <Bars3Icon class="size-6" />
                </button>
            </div>
            <router-link to="/" class="text-2xl font-bold mx-auto">{{ props.headerTitle }}</router-link>
            <div class="flex space-x-4 absolute right-6">
                <button><MagnifyingGlassIcon class="size-6 text-gray-700" /></button>
                <button><ShoppingCartIcon class="size-6 text-gray-700" /></button>
            </div>
        </div>
        <!-- Mobile Navigation -->
        <transition
            enter-active-class="transition-transform duration-300 ease-in-out"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-300 ease-in-out"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
        >
            <nav v-if="mobileMenuOpen" class="fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-4 z-50">
                <button @click="mobileMenuOpen = false" class="absolute top-4 right-4 text-gray-700">
                    <XMarkIcon class="size-6" />
                </button>
                <div class="flex flex-col space-y-4 mt-10">
                    <router-link to="/shirts" class="hover:underline">T-Shirts</router-link>
                    <router-link to="/sweats" class="hover:underline">Sweats</router-link>
                    <router-link to="/accessories" class="hover:underline">Accessories</router-link>
                    <router-link to="/collections" class="hover:underline">Collections</router-link>
                </div>
            </nav>
        </transition>
        <!-- Second Layer (Desktop Only) -->
        <nav class="hidden lg:flex justify-center space-x-6 py-2 text-sm font-medium">
            <router-link to="/shirts" class="hover:underline">T-Shirts</router-link>
            <router-link to="/sweats" class="hover:underline">Sweats</router-link>
            <router-link to="/accessories" class="hover:underline">Accessories</router-link>
            <router-link to="/collections" class="hover:underline">Collections</router-link>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MagnifyingGlassIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';

const mobileMenuOpen = ref(false);

export interface IProps {
    headerTitle: string;
    headerColor?: string;
    sticky?: boolean;
    headerTextColor?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    headerColor: 'bg-white',
    sticky: true,
    headerTextColor: 'text-gray-900',
});
</script>
