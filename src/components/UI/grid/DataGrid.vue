<template>
    <div class="bg-white shadow-lg rounded-xl">

        <!-- Grid card header, will render above grid itself -->    
        <slot name="cardHeader"></slot>

        <div class="data-grid" :class="{ 'no-border': hideBorder }">

            <!-- Grid header with col headers and filter row -->
            <GridHeader 
                v-if="!hideHeader" 
                :columns="initialColumns" 
                :bgColor="headerBgColor" 
                :hideFilterRow="hideFilterRow" 
                :headerTextColor="headerTextColor"
            />

            <!-- Main grid body with all rows-->
            <div class="grid-body" :key="gridState.key">
                <div v-if="visibleData.length > 0" 
                    v-for="(row, rowIndex) in visibleData" :key="rowIndex" 
                    class="grid-row"
                    :class="{ 'allow-hovering' : !props.disableActiveCell}"
                    @click="onRowClick(row)"
                >
                    <RowProvider :row="row">
                        <slot name="columns" :row="row"></slot>
                    </RowProvider>
                </div>
                <!-- <div v-else>
                    <p class="text-gray-500 py-2">No records to show.</p>
                </div> -->
                <div v-if="props.lazyLoading && recordsNotLoaded > 0" class="text-center mt-4">
                    <button 
                        @click="gridState.gridOptions.visibleRecordsCount += props.recordLimit ?? 100"
                        class="text-blue-600 hover:underline font-medium"
                    >
                        Show {{ Math.min(recordsNotLoaded, props.recordLimit ?? 100) }} more
                    </button>
                </div>
            </div>

            <!-- Grid footer, rendered under the last row -->
            <!-- Could be made sticky to bottom of page? -->
            <div class="grid-footer" v-if="!props.hideFooter">
                <p class="text-gray-500 py-2">Showing 
                    {{ visibleData.length }} 
                    of {{ gridState.recordCount }} records
                </p>
                <button type="button" @click="load()" title="Reload grid">
                    <ArrowPathIcon class="size-5 ms-4" />
                </button>
                <button v-if="!props.disableExport && props.exportOptions" 
                    type="button" 
                    @click="exportToExcel(gridState, props.exportOptions)" 
                    title="Export grid to Excel workbook"
                >
                    <DocumentChartBarIcon class="size-5 ms-2" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, provide, computed, ref, reactive, watch } from 'vue';
import RowProvider from './RowProvider.vue';
import type { SortOrder } from '../SortButton.vue';
import { registerColumns } from './columns';
import GridHeader from './GridHeader.vue';
import type { GridFilterState } from './filters';
import { gridFilterState } from './filters';
import type { GridColProps } from './GridCol.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';
import { DocumentChartBarIcon } from '@heroicons/vue/24/outline';
import { exportToExcel } from './grid.ts';
import type { GridExportOptions } from './grid.ts';

export type DataObject = {
    data: Record<string, any>[],
    fields: string[],
}

export interface GridProps {
    data: Record<string, any>[],

    /** Hides lines between cells */
    hideVerticalLines?: boolean,

    /** Hides lines between rows */
    hideHorizontalLines?: boolean,

    /** Hides the surrounding border of the grid */
    hideBorder?: boolean,
    headerBgColor?: string,
    sortField?: string,
    sortOrder?: 'asc' | 'desc',
    bgColor?: string,
    headerTextColor?: string,

    /** Reactive - Hides the filter row on initial load */
    hideFilterRow?: boolean,

    /** Reactive - Hides the column headers & filter row on initial load  */
    hideHeader?: boolean,

    /** Number of records to initially show */
    recordLimit?: number,

    /**
     * When set to true will load recordLimit, then show button for loading next batch of records.
     * When false, only recordLimit number of rows will be displayed.
     */
    lazyLoading?: boolean

    /** Hides the grid footer */
    hideFooter?: boolean

    /** Options for grid export feature */
    exportOptions?: GridExportOptions

    /** When set to true will not show export button in footer */
    disableExport?: boolean

    /** When set to true will not add any styling when rows/cells are clicked */
    disableActiveCell?: boolean
}

const props = defineProps<GridProps>();

export interface GridSlots {
    cardHeader(props?: never): any,
    default(props?: never): any,
    columns(props?: { row: Record<string, any> | undefined }): any
}

export type GridState = {
    data: Record<string, any>[],
    currentSortField?: string,
    currentSortOrder?: SortOrder
    currentRow?: Record<string, any>
    recordCount: number,
    key: number,
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
        recordLimit: number,
        lazyLoading: boolean,
        allRecordsLoaded: boolean,
        visibleRecordsCount: number,
        disableActiveCell: boolean
    },
    columns?: GridColProps[],
    filterState?: GridFilterState,
    load: () => void
    handleSort: (direction: SortOrder, field: string) => void
}

const gridState = reactive<GridState>({
    data: props.data,
    currentSortField: props.sortField,
    currentSortOrder: props.sortOrder,
    recordCount: props.data.length,
    key: 0,
    gridOptions: {
        hasVerticalLines: !props.hideVerticalLines,
        hasHorizontalLines: !props.hideHorizontalLines,
        hasBorder: !props.hideBorder,
        headerBgColor: props.headerBgColor,
        bgColor: 'white',
        recordLimit: props.recordLimit ?? 100,
        lazyLoading: false,
        allRecordsLoaded: false,
        visibleRecordsCount: props.recordLimit ?? 100,
        disableActiveCell: props.disableActiveCell ?? false
    },
    filterState: gridFilterState,
    load: load,
    handleSort: handleSort,
});

const emit = defineEmits<{
    (e: 'rowClick', row: Record<string, any>): void;
}>();

const slots = defineSlots<GridSlots>();

// Provide grid state to all children components
provide('gridState', gridState);

const visibleData = computed(() => {
    return sortedData.value.slice(0, gridState.gridOptions.visibleRecordsCount);
});

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


let initialColumns: any[] = [];
if (slots.columns) {
    const vNodes = slots.columns({ row: undefined });
    initialColumns = registerColumns(vNodes);
    gridState.columns = initialColumns;
    console.log('colsss: ', initialColumns)
}

const recordsNotLoaded = computed(() => {
    return sortedData.value.length - gridState.gridOptions.visibleRecordsCount;
});

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
    gridState.key++
}

watch(() => props.data, (oldVal, newVal) => {
    load();
});
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
.grid-row.allow-hovering:hover {
  background-color: #f3f4f6 !important;
}
.grid-footer {
    display: flex;
    padding: 6px 0px 6px 5px;
    border-top: 1px solid #ccc;
    align-items: center;
}
</style>