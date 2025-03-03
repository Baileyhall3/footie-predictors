<template>
  <div className="min-h-screen bg-gray-100">
    <Header
      :navItems="navItems"
      headerTitle="FOOTIE PREDICTORS"
    />
    <transition name="fade">
      <router-view v-if="isVisible" />
    </transition>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Header from "./components/Header.vue";
import Footer from './components/Footer.vue';
import { GlobeAltIcon, ShoppingCartIcon } from "@heroicons/vue/24/outline";

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});

const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Predictions",
    href: "/predictions",
  },
  {
    name: "Leagues",
    href: "/leagues",
    children: [
      {
        name: "Premier League",
        href: "/leagues/premier-league",
        description: "English Premier League predictions",
        icon: GlobeAltIcon,
      },
      {
        name: "Champions League",
        href: "/leagues/champions-league",
        description: "UEFA Champions League predictions",
        icon: ShoppingCartIcon,
      },
    ],
  },
  {
    name: "Statistics",
    href: "/statistics",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
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
