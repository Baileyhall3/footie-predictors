<template>
    <div class="relative flex items-center bg-white filter-row">
        <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 icon" v-if="!filterString && !isFocused && !props.disabled" />
        <input
            id="columnFilter"
            :disabled="disabled"
            v-model="filterString"
            type="text"
            class="w-full px-1 py-0.5 text-sm border focus:outline-none border-none text-black"
            :style="{ maxWidth: col.width }"
            @focus="handleFocus"
            @blur="handleBlur"
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
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const filterString = ref<string>('');
const isFocused = ref<boolean>(false);

const props = defineProps<{
    col: GridColProps,
    gridState: GridState,
    disabled?: boolean
}>();

function handleFocus() {
    isFocused.value = true;
}

function handleBlur() {
    isFocused.value = false;
}

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
.filter-row .icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 8px;
}
</style>