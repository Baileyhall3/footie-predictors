<template>
    <button type="button" @click="toggleFilter">
        <FunnelIcon v-if="isFiltering" class="size-5 ms-2" />
        <FunnelIconOutline v-else class="size-5 ms-2"  />
    </button>
</template>

<script setup lang="ts">
import { FunnelIcon } from '@heroicons/vue/24/solid';
import { FunnelIcon as FunnelIconOutline } from '@heroicons/vue/24/outline';
import { ref, watch } from 'vue';

const props = defineProps<{
    filterActive?: boolean,
}>();

const emit = defineEmits<{
    (e: 'onFilter', filtering: boolean): void;
}>();

const isFiltering = ref<boolean>(props.filterActive ?? false);

watch(() => props.filterActive, (val) => {
    isFiltering.value = val ?? false;
});

const toggleFilter = () => {
    isFiltering.value = !isFiltering.value;
    emit("onFilter", isFiltering.value);
}
</script>