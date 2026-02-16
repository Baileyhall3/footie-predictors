<template>
    <button @click="copyPageLink('Match')" class="p-1 rounded-md hover:bg-gray-200" title="Copy match predictions link">
        <LinkIcon class="size-6 text-blue-500" />
    </button>
    <Dropdown>
        <template #trigger>
            <EllipsisVerticalIcon class="size-6 text-gray-500" />
        </template>
        <template #items>
            <router-link :to="`/group/${groupId}`" class="text-blue-600 dropdown-item">
                Go to Group
            </router-link>
        </template>
    </Dropdown>
</template>

<script setup lang="ts">
import { copyPageLink } from '../../../utils/sharedFunctions';
import { EllipsisVerticalIcon, LinkIcon } from '@heroicons/vue/24/solid';
import Dropdown from '../Dropdown.vue';

const props = defineProps<{
    groupId: number;
}>();
</script>