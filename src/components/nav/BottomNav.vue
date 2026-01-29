<template>
    <nav
        class="sticky bottom-0 left-0 right-0 z-50 bg-white border-t shadow lg:hidden shrink-0"
        style="padding-bottom: env(safe-area-inset-bottom)"
    >
        <div class="grid grid-cols-5 items-center h-14 text-xs">
            <NavItem to="/" label="Home">
                <HomeIcon class="size-6" />
            </NavItem>

            
            <NavItem to="/predictions" label="Predictions">
                <TargetIcon class="size-6" />
            </NavItem>
            
            <NavItem to="/groups" label="Groups">
                <UserGroupIcon class="size-6" />
            </NavItem>
            <NavItem to="/leaderboards" label="Leaderboards">
                <TrophyIcon class="size-6" />
            </NavItem>

            <NavItem to="/profile" label="Profile" v-slot="{ isActive }">
                <div v-if="userStore.userProfile?.profile_picture_url" 
                    class=" w-6 h-6 flex items-center justify-center rounded-full overflow-hidden"
                    :class="isActive ? 'ring-1 ring-green-600 ring-offset-2 transition-all scale-105' : ''"  
                >
                    <img 
                        :src="userStore.userProfile.profile_picture_url" 
                        alt="Profile Image" 
                        class="object-cover w-full h-full" 
                    />
                </div>
                <div v-else
                    class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium"
                    :class="isActive ? 'ring-1 ring-green-600 ring-offset-2 transition-all scale-105' : ''"
                    :style="{ backgroundColor: userStore.userProfile.bg_colour || '#ccc' }"
                >
                    {{ userStore.userProfile.username.charAt(0).toUpperCase() }}
                </div>
            </NavItem>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { HomeIcon, UserGroupIcon, TrophyIcon } from '@heroicons/vue/24/solid';
import { TargetIcon } from 'lucide-vue-next';
import NavItem from './NavItem.vue';
import { userStore } from '../../store/userStore';
</script>