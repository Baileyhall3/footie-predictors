<template>
    <div class="data-grid" :class="{ 'no-border': hideBorder }">
        <div class="grid-header" :style="{ backgroundColor: headerBgColor }">
            <slot name="columns" />
        </div>
        <div class="grid-body">
            <div class="grid-row" v-for="(row, rowIndex) in data" :key="rowIndex">
                <slot name="columns"
                    v-bind="{
                        row,
                        rowIndex
                    }"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';

const props = defineProps<{
    data: Record<string, any>[],
    hideVerticalLines?: boolean,
    hideHorizontalLines?: boolean,
    hideBorder?: boolean,
    headerBgColor?: string
}>();

provide('hideHorizontalLines', props.hideHorizontalLines ?? false);
provide('hideVerticalLines', props.hideVerticalLines ?? false);
</script>

<style scoped>
.data-grid {
  display: grid;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  overflow-x: scroll;
}
.data-grid.no-border {
    border: none;
}
.grid-header {
    font-weight: 600;
    display: flex;
}
.grid-body {
    display: flex;
    flex-direction: column;
}
.grid-row {
    display: flex;
}
</style>