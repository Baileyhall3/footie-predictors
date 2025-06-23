<template>
    <div class="grid-header" :style="{ backgroundColor: bgColor, color: headerTextColor }">
        <div v-for="(col, colIndex) in props.columns" :key="colIndex" :style="{ width: col.width }">
            <div class="grid-col" 
                :class="{ 
                    'no-border-bottom' : !gridState?.gridOptions.hasHorizontalLines,
                }"
            >
                <div :title="col.colTitle ?? col.colName" class="relative">
                    <div class="flex items-center justify-between select-none">
                        <component :is="col.headerSlot ? col.headerSlot : 'span'" v-if="col.headerSlot" />
                        <template v-else>
                            {{ col.colName }}
                        </template>
                        <SortButton 
                            v-if="col.sortable" 
                            :currentSort="gridState?.currentSortField === col.field ? gridState.currentSortOrder : null" 
                            @sorted="(direction) => handleSort(direction, col)" 
                        />
                    </div>
                </div>
            </div>
            <div v-if="!props.hideFilterRow">
                <GridFilterRow :col="col" :gridState="gridState" :disabled="col.disableFilter" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, useSlots, computed, ref, onMounted, onUnmounted } from 'vue';
import SortButton from '../SortButton.vue';
import { SortOrder } from '../SortButton.vue';
import type { GridState } from './DataGrid.vue';
import type { GridColProps } from './GridCol.vue';
import GridFilterRow from './GridFilterRow.vue';

export interface GridHeaderProps {
    columns: GridColProps[],
    bgColor: string,
    hideFilterRow?: boolean,
    headerTextColor?: string
}

const props = defineProps<GridHeaderProps>();
const gridState = inject<GridState>('gridState');
const slots = useSlots();

function handleSort(direction: SortOrder, col: GridColProps) {
    if (col.sortable && gridState) {
        gridState.handleSort(direction, col.field);
    }
}

// onMounted(() => document.addEventListener('click', stopEditing));
// onUnmounted(() => document.removeEventListener('click', stopEditing));
</script>

<style scoped>
.grid-header {
    font-weight: 600;
    display: flex;
    color: white;
}
.grid-col {
    padding: 10px 0px 10px 5px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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