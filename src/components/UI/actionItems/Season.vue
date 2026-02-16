<template>
    <button @click="copyPageLink('Season')" class="p-1 rounded-md hover:bg-gray-200" title="Copy season link">
        <LinkIcon class="size-6 text-blue-500" />
    </button>
    <Dropdown>
        <template #trigger>
            <EllipsisVerticalIcon class="size-6 text-gray-500" />
        </template>
        <template #items>
            <router-link :to="`/group/${season?.group_id}`" class="text-blue-600 dropdown-item item-separator">
                Go to Group
            </router-link>
            <router-link :to="`/gameweek/${activeGameweek?.id}`" class="text-blue-600 dropdown-item" v-if="activeGameweek">
                Gameweek {{ activeGameweek?.week_number }}
            </router-link>
            <router-link :to="`/group/${season?.group_id}/create-gameweek`" v-if="isAdmin && !season?.is_finished">
                <button class="dropdown-item item-separator">
                    Create Gameweek
                </button>
            </router-link>
            <template v-if="isAdmin && !season?.end_date">
                <button class="dropdown-item" @click="emit('seasonEnded')">
                    End Season
                </button>
            </template>
        </template>
    </Dropdown>
</template>

<script setup lang="ts">
import { EllipsisVerticalIcon, LinkIcon } from '@heroicons/vue/24/solid';
import Dropdown from '../Dropdown.vue';
import type { Season, Gameweek } from '../../../types';
import { copyPageLink } from '../../../utils/sharedFunctions';

const props = defineProps<{
    season: Season | null;
    activeGameweek: Gameweek | null;
    isAdmin: boolean;
}>();

const emit = defineEmits<{
    (e: 'seasonEnded'): void;
}>();
</script>