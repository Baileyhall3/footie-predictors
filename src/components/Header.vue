<template>
    <header :class="[props.headerColor, props.sticky ? 'sticky top-0' : '', 'z-50', props.headerTextColor]"
        class="w-full shadow-lg">
        
        <!-- Top Navbar -->
        <div class="flex items-center py-3 px-6 border-b relative bg-green-600 text-white">
            <!-- Logo & Title -->
            <div class="flex items-center space-x-2">
                <TrophyIcon class="size-6" style="color: gold;" />
                <router-link to="/" class="text-2xl font-bold">{{ props.headerTitle }}</router-link>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex space-x-6 ml-auto text-lg font-medium">
                <template v-for="navItem in navItems">
                    <router-link :to="navItem.href" class="hover:underline"> {{ navItem.name }}</router-link>
                </template>
                <!-- <router-link to="/groups" class="hover:underline">Groups</router-link>
                <router-link to="/predictions" class="hover:underline">Predictions</router-link>
                <router-link to="/leaderboard" class="hover:underline">Leaderboards</router-link>
                <router-link to="/profile" class="hover:underline">Profile</router-link> -->
            </nav>

            <!-- Mobile Menu Button -->
            <button @click="mobileNavControls.toggle" class="lg:hidden ml-auto text-white">
                <Bars3Icon v-if="!mobileNavControls.isOpen" class="size-6" />
                <XMarkIcon v-else class="size-6" />
            </button>
        </div>

        <!-- Mobile Navigation (Appears Below Navbar) -->
        <transition
            enter-active-class="transition-transform duration-300 ease-in-out"
            enter-from-class="-translate-y-full opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-transform duration-300 ease-in-out"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-full opacity-0"
        >
            <nav v-if="mobileNavControls.isOpen" class="absolute top-full left-0 w-full bg-white shadow-lg p-6 z-50 border-b">
                <div class="flex flex-col space-y-4 text-lg font-medium text-gray-900">
                    <router-link to="/groups" @click="mobileNavControls.close" class="hover:underline">Groups</router-link>
                    <router-link to="/predictions" @click="mobileNavControls.close" class="hover:underline">Predictions</router-link>
                    <router-link to="/leaderboards" @click="mobileNavControls.close" class="hover:underline">Leaderboards</router-link>
                    <router-link to="/profile" @click="mobileNavControls.close" class="hover:underline">Profile</router-link>
                </div>
            </nav>
        </transition>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import { TrophyIcon } from '@heroicons/vue/24/solid';
import mobileNavControls from '../shared';

interface NavItem {
    name: string,
    href: string,
}

export interface IProps {
    headerTitle: string;
    headerColor?: string;
    sticky?: boolean;
    headerTextColor?: string;
    navItems: Array<NavItem>
}

const props = withDefaults(defineProps<IProps>(), {
    headerColor: 'bg-green-600',
    sticky: true,
    headerTextColor: 'text-white',
});
</script>
