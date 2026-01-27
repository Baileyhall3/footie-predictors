<template>
    <router-link
        :to="to"
        class="flex flex-col items-center justify-center gap-1 px-2 py-1"
        :class="isActive ? 'text-green-600' : 'text-gray-500'"
    >
        <slot />
        <span class="text-[11px] font-medium">{{ label }}</span>
    </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
    to: string;
    label: string
}>()

const route = useRoute()

const isActive = computed(() =>
  route.path === props.to || route.path.startsWith(props.to + '/')
)
</script>