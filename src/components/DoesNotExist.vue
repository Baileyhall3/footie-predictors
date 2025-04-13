<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <!-- Icon or code -->
      <h1 class="text-7xl font-extrabold text-gray-800 mb-4 animate-pulse">
        🤔
      </h1>
    
      <!-- Message text -->
      <p class="text-xl text-gray-600 mb-6">
        The {{ entity }} you are looking for does not exist.
      </p>
  
      <!-- Go back button -->
      <RouterLink
        to="/"
        class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
      >
        Go back home
      </RouterLink>
    </div>
  </template>
  
  <script setup>
  defineProps({
    entity: {
      type: String,
      default: 'group',
    },
  });
  </script>
  
  <style scoped>
  @keyframes wiggle {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }
  
  .animate-wiggle {
    animation: wiggle 0.5s ease-in-out infinite;
  }
  </style>
  