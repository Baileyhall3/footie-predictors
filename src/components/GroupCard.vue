<template>
  <router-link 
    :to="`/group/${group.id}`" 
    class="bg-white shadow-md rounded-xl p-4 flex justify-between items-center transition hover:shadow-lg"
  >
    <div class="justify-between flex items-center">
      <img :src="group.icon_url ?? '/src/assets/images/green-football-md.png'" class="w-10 h-10 mr-3" alt="Group Logo"/>
      <div>
        <h3 class="text-lg font-semibold">{{ group.name }}</h3>
        <p class="text-gray-500">{{ group.member_count }} members</p>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  group: Object
});
</script>
