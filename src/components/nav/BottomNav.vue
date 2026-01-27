<template>
    <nav
        class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg lg:hidden"
        style="padding-bottom: env(safe-area-inset-bottom)"
    >
        <div class="flex justify-around items-center h-14 text-xs">
        
        <NavItem to="/" label="Home">
            <HomeIcon class="size-6" />
        </NavItem>

        <NavItem to="/groups" label="Groups">
            <UserGroupIcon class="size-6" />
        </NavItem>

        <NavItem to="/predictions" label="Predictions">
            <TargetIcon class="size-6" />
        </NavItem>

        <NavItem to="/leaderboards" label="Leaderboards">
            <TrophyIcon class="size-6" />
        </NavItem>

        <!-- <NavItem to="/profile" label="Profile">
            <UserIcon class="size-6" />
        </NavItem> -->

        </div>
    </nav>
</template>

<script setup lang="ts">
import { HomeIcon, UserGroupIcon, TrophyIcon } from '@heroicons/vue/24/solid';
import { TargetIcon } from 'lucide-vue-next';
import NavItem from './NavItem.vue';
</script>