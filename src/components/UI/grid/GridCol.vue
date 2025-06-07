<template>
    <div class="grid-col" 
        :style="{ width }"
        :class="{ 
            'no-border-right' : hideVerticalLines && !isColHeader,
            'no-border-bottom' : hideHorizontalLines,
            'hover:bg-gray-100' : !isColHeader,
            'hover:cursor-pointer' : sortable && isColHeader
        }"
        @click="onCellClick"
    >
    
        <div v-if="isColHeader" :title="props.colTitle ?? props.colName" class="relative">
            <div class="flex items-center justify-between select-none">
                {{ colName }}
                <SortButton v-if="props.sortable" @sorted="handleSort" />
            </div>
        </div>
        <div v-else>
            <slot name="display" v-bind="{ row }" />
            <div v-if="!slots.display">
                {{ row[field] }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, useSlots, computed, ref } from 'vue';
import SortButton from '../SortButton.vue';

const props = defineProps<{
    field: string,
    colName: string,
    width?: string,
    colTitle?: string,
    sortable?: boolean
}>();

const emit = defineEmits<{
    (e: 'cellClick', row: Record<string, any>): void;
}>();

const row = inject<Record<string, any> | undefined>('row', undefined);
const hideHorizontalLines = inject<boolean>('hideHorizontalLines', false);
const hideVerticalLines = inject<boolean>('hideVerticalLines', false);
const sortHandler = inject<(direction: 'asc' | 'desc' | null, field: string) => void>('handleSort');

const slots = useSlots();

const isColHeader = computed(() => {
    return row === undefined;
});

function handleSort(direction: 'asc' | 'desc') {
    if (props.sortable && sortHandler) {
        sortHandler(direction, props.field);
    }
}

function onCellClick(event) {
    emit("cellClick", event);
    const clickedCell = { clickEvent: event, row, ...props }
    console.log('cell clicked ', clickedCell)
}
</script>

<style scoped>
.grid-col {
    padding: 10px 0px 10px 5px;
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