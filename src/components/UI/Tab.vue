<template>
    <div v-if="selectedTab === index">
        <slot />
    </div>
    <!-- <div v-show="show">
        <slot />
    </div> -->
</template>
  
<script setup lang="ts">
import { inject, onMounted, ref, Ref, computed } from 'vue';
  
const props = defineProps<{
    header: string;
}>();
  
const selectedTab = inject('selectedTab') as Ref<number>;
const registerTab = inject('registerTab') as (header: string) => number;
const loadedTabs = inject('loadedTabs') as boolean[];

const index = ref<number>(-1);

const show = computed(() => {
    return selectedTab.value === index.value || loadedTabs[index.value];
});

onMounted(() => {
    index.value = registerTab(props.header);
});
</script>
  