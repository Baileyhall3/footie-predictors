<template>
    <div class="mb-8">
        <div class="flex items-center mb-4">
            <div class="items-center flex">
                <img 
                    v-if="!props.hideImage"
                    :src="group.group_icon_url ?? '/images/green-football-md.png'" 
                    class="w-10 h-10 mr-3" 
                    alt="Group Logo"
                />
                <h3 class="text-xl font-semibold">
                    <component
                        :is="group.group_id ? 'router-link' : 'span'"
                        :to="`/group/${group.group_id}`" 
                        :class="{ 'cursor-pointer hover:text-blue-600' : group.group_id }"
                    >
                        {{ group.group_name }}
                    </component>
                </h3>
            </div>
            <button type="button" @click="toggleContentCollapsed">
                <ChevronDownIcon v-if="!contentCollapsed" class="size-5 ms-2"  />
                <ChevronUpIcon v-else class="size-5 ms-2" />
            </button>
        </div>

        <template v-if="!contentCollapsed">
            <slot></slot>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { ref } from 'vue';

interface Group {
    group_id: number;
    group_name: string;
    group_icon_url?: string | null;
}

const props = defineProps<{
    group: Group;
    hideImage?: boolean;
}>();

const contentCollapsed = ref(false);

const toggleContentCollapsed = () => {
    contentCollapsed.value = !contentCollapsed.value;
}
</script>