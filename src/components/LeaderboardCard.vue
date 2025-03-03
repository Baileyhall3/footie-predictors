<template>
    <div class="bg-white shadow-md rounded-xl p-4 text-center">
      <h3 class="text-lg font-semibold">Leaderboard</h3>
      <p class="text-gray-600">Position: <span class="font-bold text-blue-600">#{{ leaderboard.position }}</span> / {{ leaderboard.totalPlayers }}</p>
      <p class="text-gray-600">Total Points: <span class="font-bold">{{ leaderboard.points }}</span></p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    leaderboard: Object
  });
  </script>
  