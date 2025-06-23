<template>
    <button type="button" @click="toggleCollapse">
        <ChevronDownIcon v-if="!isCollapsed" class="size-5 ms-2 transition-transform duration-300"  />
        <ChevronUpIcon v-else class="size-5 ms-2 transition-transform duration-300" />
    </button>
</template>

<script setup lang="ts">
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid";
import { ref, watch } from 'vue';

const props = defineProps<{
    collapsed?: boolean,
}>();

const emit = defineEmits<{
    (e: 'onCollapse', collapsed: boolean): void;
}>();

const isCollapsed = ref<boolean>(props.collapsed ?? false);

watch(() => props.collapsed, (val) => {
    isCollapsed.value = val ?? false;
});

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    emit("onCollapse", isCollapsed.value);
}
</script>