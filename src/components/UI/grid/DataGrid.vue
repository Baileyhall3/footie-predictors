<template>
    <div class="data-grid" :class="{ 'no-border': hideBorder }">
        <GridHeader :columns="initialColumns" :bgColor="headerBgColor" :hideFilterRow="hideFilterRow" v-if="!hideHeader" />
        <div class="grid-body" :key="gridKey">
            <div v-for="(row, rowIndex) in sortedData" :key="rowIndex" 
                class="grid-row hover:bg-gray-100"
                @click="onRowClick(row)"
            >
                <RowProvider :row="row">
                    <slot name="columns" :row="row"></slot>
                </RowProvider>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, provide, computed, ref, reactive, useSlots } from 'vue';
import RowProvider from './RowProvider.vue';
import type { SortOrder } from '../SortButton.vue';
import { registerColumns } from './columns';
import GridHeader from './GridHeader.vue';
import type { GridFilterState } from './filters';
import { gridFilterState } from './filters';

export type DataObject = {
    data: Record<string, any>[],
    fields: string[],
}

export interface GridProps {
    data: Record<string, any>[],
    hideVerticalLines?: boolean,
    hideHorizontalLines?: boolean,
    hideBorder?: boolean,
    headerBgColor?: string,
    sortField?: string,
    sortOrder?: 'asc' | 'desc',
    bgColor?: string,
    hideFilterRow?: boolean,
    hideHeader?: boolean
}

const props = defineProps<GridProps>();

export interface GridSlots {
    default(props?: never): any,
    columns(props?: { row: Record<string, any> | undefined }): any
}

export type GridState = {
    // data: Record<string, any>[],
    currentSortField?: string,
    currentSortOrder?: SortOrder
    currentRow?: Record<string, any>
    activeCell?: {
        clickEvent: any,
        row: Record<string, any> | undefined,
        field: string,
        colName: string,
        width?: string,
        colTitle?: string,
        sortable?: boolean,
        editable?: boolean,
        type?: string,
        isEditing: boolean
    },
    gridOptions: {
        hasVerticalLines: boolean,
        hasHorizontalLines: boolean,
        hasBorder: boolean,
        headerBgColor: string | undefined,
        bgColor: string | undefined,
    },
    filterState?: GridFilterState,
    load: () => void
    handleSort: (direction: SortOrder, field: string) => void
}

const gridState = reactive<GridState>({
    // data: props.data,
    currentSortField: props.sortField,
    currentSortOrder: props.sortOrder,
    gridOptions: {
        hasVerticalLines: !props.hideVerticalLines,
        hasHorizontalLines: !props.hideHorizontalLines,
        hasBorder: !props.hideBorder,
        headerBgColor: props.headerBgColor,
        bgColor: 'white'
    },
    filterState: gridFilterState,
    load: load,
    handleSort: handleSort,
});

const emit = defineEmits<{
    (e: 'rowClick', row: Record<string, any>): void;
}>();

provide('gridState', gridState);

const gridKey = ref(0);

const sortedData = computed(() => {
    const data = filteredData.value;

    if (!gridState.currentSortField || !gridState.currentSortOrder) return data;

    return [...props.data].sort((a, b) => {
        const valA = a[gridState.currentSortField!];
        const valB = b[gridState.currentSortField!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return gridState.currentSortOrder === 'asc' ? valA - valB : valB - valA;
        }

        return gridState.currentSortOrder === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });
});

const filters = reactive<Record<string, string>>({});

const filteredData = computed(() => {
    const activeFilters = gridState.filterState?.activeFilters;
    if (!activeFilters || !activeFilters.length) return props.data;

    return props.data.filter(row => {
        return activeFilters.every((filter) => {
            if (!filter.queryValue) return true;
            const cellValue = row[filter.field];
            return String(cellValue ?? '').toLowerCase().includes(filter.queryValue.toLowerCase());
        });
    });
});

const slots = defineSlots<GridSlots>();

let initialColumns: any[] = [];
if (slots.columns) {
    const vNodes = slots.columns({ row: undefined });
    initialColumns = registerColumns(vNodes);
    console.log('colsss: ', initialColumns)
}

function onRowClick(row: Record<string, any>) {
    emit("rowClick", row);
    gridState.currentRow = row;
}

function handleSort(direction: SortOrder, field: string) {
    if (direction === null) {
        gridState.currentSortField = undefined;
        gridState.currentSortOrder = undefined;
    } else {
        gridState.currentSortField = field;
        gridState.currentSortOrder = direction;
    }
    load();
}

function load() {
    gridKey.value++
}

</script>

<style scoped>
.data-grid {
  display: grid;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  overflow-x: auto;
  background-color: white;
}
.data-grid.no-border {
    border: none;
}
.grid-header {
    font-weight: 600;
    display: flex;
    color: white;
}
.grid-body {
    display: flex;
    flex-direction: column;
}
.grid-row {
    display: flex;
}
</style>