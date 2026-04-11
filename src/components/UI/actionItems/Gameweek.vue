<template>
    <button @click="copyPageLink('Gameweek')" class="p-1 rounded-md hover:bg-gray-200" title="Copy gameweek link">
        <LinkIcon class="size-6 text-blue-500" />
    </button>
    <Dropdown>
    <template #trigger>
        <EllipsisVerticalIcon class="size-6 text-gray-500" />
    </template>
    <template #items>
        <router-link :to="`/group/${gameweek?.group_id}`" class="text-blue-600 dropdown-item item-separator">
            Go to Group
        </router-link>
        <router-link :to="`/season/${gameweek?.season_id}`" class="text-blue-600 dropdown-item item-separator">
            {{ gameweek?.season_name }}
        </router-link>
        <template v-if="isAdmin">
            <button @click="emit('toggleLock')" class="dropdown-item item-separator" v-if="!gameweek?.is_finished">
                {{ gameweek?.is_locked ? 'Unlock' : 'Lock' }}
            </button>
            <button v-if="!gameweek?.is_active && !gameweek?.is_finished" @click="emit('toggleActive')" class="dropdown-item item-separator">
                Set Active
            </button>
            <button @click="emit('deleteGameweek')" class="dropdown-item text-red-700 item-separator">
                Delete
            </button>
        </template>
    </template>
    </Dropdown>
</template>

<script setup lang="ts">
import { LinkIcon, EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
import type { Gameweek } from '../../../types';
import Dropdown from "../Dropdown.vue";
import { copyPageLink } from "../../../utils/sharedFunctions";

const props = defineProps<{
    gameweek: Gameweek | null;
    isAdmin: boolean;
}>();

const emit = defineEmits<{
    (e: 'toggleLock' ): void;
    (e: 'toggleActive' ): void;
    (e: 'deleteGameweek' ): void;
}>();
</script>