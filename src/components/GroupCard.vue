<template>
    <router-link to="/group" class="bg-white shadow-md rounded-xl p-4 flex justify-between items-center transition hover:shadow-lg">
        <div>
            <h3 class="text-lg font-semibold">{{ group.name }}</h3>
            <p class="text-gray-500">{{ group.members }} members</p>
        </div>
    </router-link>
  </template>
  
  <script setup>
  defineProps({
    group: Object
  });
  </script>
  