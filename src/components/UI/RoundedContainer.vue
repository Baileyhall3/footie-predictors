<template>
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8">
        <div class="flex justify-between items-center mb-4" v-if="props.headerText || slots.header">
            <div class="items-center flex">
                <slot name="header"></slot>
                <h3 class="text-xl font-semibold" v-if="!slots.header">{{ props.headerText }}</h3>
                <button type="button" @click="toggleContentCollapsed" v-if="collapsable">
                    <ChevronDownIcon v-if="!contentCollapsed" class="size-5 ms-2"  />
                    <ChevronUpIcon v-else class="size-5 ms-2" />
                </button>
            </div>
            <slot name="headerContent"></slot>
        </div>

        <template v-if="!contentCollapsed">
            <slot />
        </template>
    </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { ref, useSlots } from 'vue';

export interface IProps {
    headerText?: string,
    collapsable?: boolean
}
const props = defineProps<IProps>();
const slots = useSlots();

const contentCollapsed = ref(false);

const toggleContentCollapsed = () => {
    contentCollapsed.value = !contentCollapsed.value;
}

</script>