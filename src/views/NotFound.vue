<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <!-- Animated 404 -->
      <h1 class="text-7xl font-extrabold text-gray-800 mb-4 animate-bounce">
        404
      </h1>
  
      <!-- Fun emoji -->
      <div class="text-5xl mb-4 animate-wiggle">😵</div>
  
      <!-- Subtext -->
      <p class="text-xl text-gray-600 mb-6">
        Oops! We couldn’t find that page.
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
  
  <style scoped>
  @keyframes wiggle {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }
  
  .animate-wiggle {
    animation: wiggle 0.5s ease-in-out infinite;
  }
  </style>
  