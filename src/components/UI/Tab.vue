<template>
    <div v-show="selectedTab === index">
        <slot />
    </div>
</template>
  
<script setup lang="ts">
import { inject, onMounted, ref, Ref } from 'vue';
  
const props = defineProps<{
    header: string;
}>();
  
const selectedTab = inject('selectedTab') as Ref<number>;
const registerTab = inject('registerTab') as (header: string) => number;

const index = ref<number>(-1);

onMounted(() => {
    index.value = registerTab(props.header);
});
</script>
  