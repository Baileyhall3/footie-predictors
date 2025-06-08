<template>
    <div class="relative flex items-center bg-white filter-row">
        <input
            id="columnFilter"
            :disabled="disabled"
            v-model="filterString"
            type="text"
            class="w-full px-1 py-0.5 text-sm border focus:outline-none border-none text-black"
            :style="{ maxWidth: col.width }"
            :placeholder="!props.disabled ? `Filter ${col.colName}` : ''"
            @keydown.enter="applyFilterString(col)"
        />
        <div class="flex items-center" v-if="filterString">
            <button type="button" @click="clearFilterString(col)" title="Clear column filter">
                <XMarkIcon class="size-5 text-gray-400" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { GridColProps } from './GridCol.vue';
import type { GridState } from './DataGrid.vue';
import { XMarkIcon } from "@heroicons/vue/24/solid";

const filterString = ref('');

const props = defineProps<{
    col: GridColProps,
    gridState: GridState,
    disabled?: boolean
}>()

function applyFilterString(col: GridColProps) {
    if (filterString.value) {
        props.gridState.filterState?.apply({ field: col.field, queryValue: filterString.value });
    } else {
        clearFilterString(col);
    }
    props.gridState.load();
}

function clearFilterString(col: GridColProps) {
    if (!filterString.value) { return; }

    filterString.value = '';
    props.gridState.filterState?.clear(col.field);
    props.gridState.load();
}
</script>

<style scoped>
.filter-row {
    padding: 8px 0px 8px 5px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
}
</style>