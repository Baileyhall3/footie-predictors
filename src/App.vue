<template>
  <div className="min-h-screen bg-gray-100">
    <Header
      :navItems="navItems"
      headerTitle="Footie Predictors"
    />
    <!-- Background Blur -->
    <div v-if="mobileNavControls.isOpen" class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-40" @click="mobileNavControls.close"></div>

    <transition name="fade">
      <router-view v-if="isVisible" />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Header from "./components/Header.vue";
import mobileNavControls from './shared';

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});

const navItems = [
  {
    name: "Groups",
    href: "/groups",
  },
  {
    name: "Predictions",
    href: "/predictions",
  },
  {
    name: "Leaderboards",
    href: "/leaderboards",
  },
  {
    name: "Profile",
    href: "/profile",
  },
];
</script>

<style>
.fade-enter-active {
  transition: opacity 1s ease-out;
}
.fade-enter-from {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
</style>
