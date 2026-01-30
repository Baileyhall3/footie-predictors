<template>
    <header 
        :class="[
            props.headerColor, 
            props.sticky ? 'sticky top-0' : '', 
            'z-50', 
            props.headerTextColor
        ]"
        class="w-full shadow-lg shrink-0"
        style="padding-top: env(safe-area-inset-top)"
    >
        <div class="bg-green-600 text-white">
            <!-- Top Navbar -->
            <div class="container mx-auto justify-between flex items-center py-2 sm:py-3 px-2">
                <div class="flex items-center relative justify-between w-full">
                    <!-- Logo & Title -->
                    <div class="flex items-center space-x-2">
                        <TrophyIcon class="size-6" style="color: gold;" />
                        <router-link to="/" class="text-xl sm:text-2xl font-bold">{{ props.headerTitle }}</router-link>
                    </div>
        
                    <!-- Desktop Navigation -->
                    <nav class="hidden lg:flex space-x-6 text-lg font-medium items-center" v-if="!props.hideNav">
                        <template v-if="userStore.isAuthenticated">
                            <router-link to="/groups" class="hover:underline">Groups</router-link>
                            <router-link to="/predictions" class="hover:underline">Predictions</router-link>
                            <router-link to="/leaderboards" class="hover:underline">Leaderboards</router-link>
                            <router-link to="/user-stats" class="hover:underline">Stats</router-link>
                            <router-link to="/profile" class="hover:underline">Profile</router-link>
                            <router-link 
                                v-if="userStore.userProfile?.favourite_group_id"
                                :to="`/group/${userStore.userProfile.favourite_group_id}`"
                            >
                                <div
                                    class="relative w-5 h-5 ring-1 ring-green-600 ring-offset-2 me-2 rounded-full"
                                >
                                    <!-- Circle clip ONLY for the image -->
                                    <div class="w-full h-full rounded-full overflow-hidden">
                                        <img
                                            :src="userStore.userProfile.favourite_group_icon_url ?? '/images/green-football-md.png'"
                                            alt="Group Logo"
                                            class="w-full h-full object-cover"
                                        />
                                    </div>

                                    <!-- Favourite badge (now free to escape the circle) -->
                                    <div
                                        class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-600 ring-2 ring-white flex items-center justify-center"
                                    >
                                        <StarIcon class="w-3 h-3 text-yellow-400" />
                                    </div>
                                </div>
                            </router-link>
                            <router-link to="/notifications" class="relative hover:underline">
                                <BellIcon class="size-5" />
                                <span
                                    v-if="notificationsStore.unreadNotifications > 0"
                                    class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-[10px] leading-none text-white bg-red-600 rounded-full"
                                >
                                    {{ notificationsStore.unreadNotifications }}
                                </span>
                            </router-link>
                        </template>
                        <template v-else>
                            <router-link to="/app-info" class="hover:underline">How it Works</router-link>
                            <router-link to="/login" class="hover:underline">Log In</router-link>
                        </template>
                    </nav>
        
                    <!-- Mobile Menu Button -->
                    <div class="flex items-center ml-auto lg:hidden text-white">
                        <router-link 
                            v-if="userStore.userProfile?.favourite_group_id"
                            :to="`/group/${userStore.userProfile.favourite_group_id}`"
                        >
                            <div
                                class="relative w-5 h-5 ring-1 ring-green-600 ring-offset-2 me-2 rounded-full"
                            >
                                <!-- Circle clip ONLY for the image -->
                                <div class="w-full h-full rounded-full overflow-hidden">
                                    <img
                                        :src="userStore.userProfile.favourite_group_icon_url ?? '/images/green-football-md.png'"
                                        alt="Group Logo"
                                        class="w-full h-full object-cover"
                                    />
                                </div>

                                <!-- Favourite badge (now free to escape the circle) -->
                                <div
                                    class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-600 ring-2 ring-white flex items-center justify-center"
                                >
                                    <StarIcon class="w-3 h-3 text-yellow-400" />
                                </div>
                            </div>
                        </router-link>
                        <router-link to="/notifications" @click="mobileNavControls.close" class="relative hover:underline me-2" v-if="userStore.isAuthenticated">
                            <BellIcon class="size-5" />
                            <span
                                v-if="notificationsStore.unreadNotifications > 0"
                                class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-[10px] leading-none text-white bg-red-600 rounded-full"
                            >
                                {{ notificationsStore.unreadNotifications }}
                            </span>
                        </router-link>
                        <button @click="mobileNavControls.toggle" v-if="!props.hideNav">
                            <div v-if="!mobileNavControls.isOpen">
                                <Bars3Icon class="size-6" />
                            </div>
                            <XMarkIcon v-else class="size-6" />
                        </button>
                    </div>
                </div>
            </div>
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
                    <template v-if="userStore.isAuthenticated">
                        <router-link to="/groups" @click="mobileNavControls.close" class="hover:underline">Groups</router-link>
                        <router-link to="/predictions" @click="mobileNavControls.close" class="hover:underline">Predictions</router-link>
                        <router-link to="/leaderboards" @click="mobileNavControls.close" class="hover:underline">Leaderboards</router-link>
                        <router-link to="/user-stats" @click="mobileNavControls.close" class="hover:underline">Stats</router-link>
                        <router-link to="/profile" @click="mobileNavControls.close" class="hover:underline">Profile</router-link>
                    </template>
                    <template v-else>
                        <router-link to="/app-info" @click="mobileNavControls.close" class="hover:underline">How It Works</router-link>
                        <router-link to="/login" @click="mobileNavControls.close" class="hover:underline">Log In</router-link>
                    </template>
                </div>
            </nav>
        </transition>
    </header>
</template>

<script setup lang="ts">
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
import { TrophyIcon, StarIcon } from '@heroicons/vue/24/solid';
import mobileNavControls from '../shared';
import { BellIcon } from '@heroicons/vue/24/solid';
import { userStore } from '../store/userStore';
import { notificationsStore } from '../store/notificationsStore';

export interface IProps {
    headerTitle: string;
    headerColor?: string;
    sticky?: boolean;
    headerTextColor?: string;
    hideNav?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
    headerColor: 'bg-green-600',
    sticky: true,
    headerTextColor: 'text-white',
});

// onMounted(() => {
//     if (userStore.isAuthenticated) {
//         getUnreadNotifications();
//     }
// });

// async function getUnreadNotifications() {
//     try {
//         await notificationsStore.fetchUserUnreadNotifications();    
//     } catch (err) {
//         console.error(err);
//     }
// }
</script>
