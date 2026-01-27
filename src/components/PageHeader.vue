<template>
    <div class="px-2 my-4">
        <div class="flex items-center justify-between gap-4 mb-4 flex-nowrap">
            <div class="flex items-center gap-3 min-w-0 max-w-full flex-1">
                <slot name="header"></slot>
            </div>

            <div class="flex flex-wrap gap-2 justify-end flex-shrink-0" v-if="slots.actionItems">
                <slot name="actionItems"></slot>
            </div>
        </div>

        <slot name="details"></slot>
    </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

const slots = useSlots();

</script>