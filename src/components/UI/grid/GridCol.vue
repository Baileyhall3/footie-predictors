<template>
    <div class="grid-col" 
        :style="{ width }"
        :class="{ 'no-border-right' : hideVerticalLines, 'no-border-bottom' : hideHorizontalLines }"
        :title="props.colTitle ?? props.colName"
    >
    
        <div v-if="row === undefined">
            {{ colName }}
        </div>
        <template v-else>
            <slot name="display" v-bind="{ row }" />
            <div v-if="!slots.display">
                {{ row[field] }}
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { inject, useSlots } from 'vue';

const props = defineProps<{
    field: string,
    colName: string,
    width?: string,
    row?: Record<string, any> // injected from slot scope,
    colTitle?: string
}>();

const hideHorizontalLines = inject<boolean>('hideHorizontalLines', false);
const hideVerticalLines = inject<boolean>('hideVerticalLines', false);

const slots = useSlots();
</script>

<style scoped>
.grid-col {
    padding: 10px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
}
.grid-col.no-border-right {
    border-right: none;
}
.grid-col.no-border-bottom {
    border-bottom: none;
}
</style>