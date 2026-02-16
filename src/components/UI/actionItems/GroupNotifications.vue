<template>
    <Dropdown>
        <template #trigger>
            <EllipsisVerticalIcon class="size-6 text-gray-500" />
        </template>
        <template #items="{ close }">
            <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item">
                Go to Group
            </router-link>
        </template>
    </Dropdown>
</template>

<script setup lang="ts">
import { EllipsisVerticalIcon } from '@heroicons/vue/24/solid';
import Dropdown from '../Dropdown.vue';

const props = defineProps<{
    groupId: number;
}>();
</script>