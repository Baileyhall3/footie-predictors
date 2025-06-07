<template>
    <div class="grid-col" 
        :style="{ width }"
        :class="{ 
            'no-border-right' : !gridState?.gridOptions.hasVerticalLines && !isColHeader,
            'no-border-bottom' : !gridState?.gridOptions.hasHorizontalLines,
            'hover:bg-gray-100' : !isColHeader,
            'hover:cursor-pointer' : sortable && isColHeader,
            'active-cell' : isActiveCell && !isColHeader
        }"
        @click="onCellClick"
    >
    
        <div v-if="isColHeader" :title="props.colTitle ?? props.colName" class="relative">
            <div class="flex items-center justify-between select-none">
                {{ colName }}
                <SortButton 
                    v-if="props.sortable" 
                    :currentSort="gridState?.currentSortField === props.field ? gridState.currentSortOrder : null" 
                    @sorted="handleSort" 
                />
            </div>
        </div>
        <div v-else>
            <slot name="display" v-bind="{ row }" />
            <input id="colEditor" v-if="isEditingCell" :type="props.type" v-model="row[field]" style="width: -webkit-fill-available;"/>
            <div v-if="!slots.display && !isEditingCell">
                {{ row[field] }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, useSlots, computed, ref, onMounted, onUnmounted } from 'vue';
import SortButton from '../SortButton.vue';
import { SortOrder } from '../SortButton.vue';
import { GridState } from './DataGrid.vue';

type SupportedInput = 'string' | 'number'

export interface GridColProps {
    field: string,
    colName: string,
    width?: string,
    colTitle?: string,
    sortable?: boolean,
    editable?: boolean,
    type?: SupportedInput
}

const props = defineProps<GridColProps>();

const emit = defineEmits<{
    (e: 'cellClick', row: Record<string, any>): void;
}>();

const row = inject<Record<string, any> | undefined>('row', undefined);
const gridState = inject<GridState>('gridState');

const slots = useSlots();

const isColHeader = computed(() => {
    return row === undefined;
});

const isActiveCell = computed(() => {
    return gridState?.activeCell?.row === row && gridState?.activeCell?.field === props.field;
});

const isEditingCell = computed(() => {
    return props.type && isActiveCell.value && gridState?.activeCell?.isEditing;
})

function handleSort(direction: SortOrder) {
    if (props.sortable && gridState) {
        gridState.handleSort(direction, props.field);
    }
}

function onCellClick(event) {
    emit("cellClick", event);
    const clickedCell = { clickEvent: event, row, ...props, isEditing: props.editable ? true : false }
    if (gridState) {
        gridState.activeCell = clickedCell;
    }
    console.log(gridState)
}

function stopEditing() {
    if (isEditingCell.value && isActiveCell.value) {
        gridState.activeCell.isEditing = false;
    }
}

// onMounted(() => document.addEventListener('click', stopEditing));
// onUnmounted(() => document.removeEventListener('click', stopEditing));
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
.grid-col.active-cell {
    border: green;
    border-style: solid;
    border-width: thin;
}
</style>