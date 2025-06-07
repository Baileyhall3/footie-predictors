<template>
    <div class="data-grid" :class="{ 'no-border': hideBorder }">
        <div class="grid-header" :style="{ backgroundColor: headerBgColor }">
            <slot name="columns" />
        </div>
        <div class="grid-body" :key="gridKey">
            <div v-for="(row, rowIndex) in sortedData" :key="rowIndex" 
                class="grid-row hover:bg-gray-100"
                @click="onRowClick(row)"
            >
                <RowProvider :row="row">
                    <slot name="columns" :row="row" />
                </RowProvider>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, provide, computed, ref } from 'vue';
import RowProvider from './RowProvider.vue';

const props = defineProps<{
    data: Record<string, any>[],
    hideVerticalLines?: boolean,
    hideHorizontalLines?: boolean,
    hideBorder?: boolean,
    headerBgColor?: string,
    sortField?: string,
    sortOrder?: 'asc' | 'desc'
}>();

const emit = defineEmits<{
    (e: 'rowClick', row: Record<string, any>): void;
}>();

provide('hideHorizontalLines', props.hideHorizontalLines ?? false);
provide('hideVerticalLines', props.hideVerticalLines ?? false);
provide('handleSort', handleSort);

const gridKey = ref(0);
const sortField = ref<string | undefined>(props.sortField);
const sortOrder = ref<'asc' | 'desc' | undefined | null>(props.sortOrder);

const sortedData = computed(() => {
    if (!sortField.value || !sortOrder.value) return props.data;

    return [...props.data].sort((a, b) => {
        const valA = a[sortField.value!];
        const valB = b[sortField.value!];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder.value === 'asc' ? valA - valB : valB - valA;
        }

        return sortOrder.value === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });
});

function onRowClick(row) {
    emit("rowClick", row);
    console.log('row clicked: ', row)
}

function handleSort(direction: 'asc' | 'desc' | null, field: string) {
    if (direction === null) {
        sortField.value = undefined;
        sortOrder.value = undefined;
    } else {
        sortField.value = field;
        sortOrder.value = direction;
    }
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