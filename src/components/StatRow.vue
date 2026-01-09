<template>
    <div class="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg border border-gray-150">
        <div class="flex items-center space-x-2">
            <span class="text-xl">{{ icon }}</span>
            <span class="text-gray-700 font-medium">{{ label }}</span>
        </div>
        <span class="text-gray-900 font-semibold">{{ value }}</span>
    </div>
</template>
  
<script setup>
defineProps({
    icon: String,
    label: String,
    value: [String, Number]
})
</script>
  