<template>
    <div class="relative">
        <component :is="currentSort === null || currentSort === undefined ? ChevronUpDownIcon : currentSort === 'asc' ? ChevronUpIcon : ChevronDownIcon" 
            :class="`size-${currentSort === null || currentSort === undefined ? props.size : (props.size - 2)}`" @click="sortMenuOpen = !sortMenuOpen" 
            style="margin-right: 0.2rem;"
        />

        <!-- Sort dropdown -->
        <transition name="fade">
            <div v-if="sortMenuOpen"
                class="absolute top-full right-0 mt-1 bg-white shadow-lg rounded z-10"
            >
                <div class="flex items-center justify-center px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    @click.stop="handleSort('asc')"
                >
                    <ChevronUpIcon class="size-4 text-black" />
                </div>
                <div class="flex items-center justify-center px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    @click.stop="handleSort('desc')"
                >
                    <ChevronDownIcon class="size-4 text-black" />
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid';

export type SortOrder = 'asc' | 'desc' | null | undefined;

const props = withDefaults(defineProps<{
    size?: number,
    currentSort?: SortOrder
}>(), {
    size: 6
});

const emit = defineEmits<{
    (e: 'sorted', direction: SortOrder): void;
}>();

const sortMenuOpen = ref<boolean>(false);
const currentSort = ref<SortOrder>(props.currentSort);

watch(() => props.currentSort, (newVal) => {
    currentSort.value = newVal;
});

function handleSort(direction: 'asc' | 'desc') {
    if (currentSort.value === direction) {
        currentSort.value = null;
        emit('sorted', null);
    } else {
        currentSort.value = direction;
        emit('sorted', direction);
    }
    sortMenuOpen.value = false;
}

const closeDropdown = (event) => {
    if (!event.target.closest('.relative')) {
        sortMenuOpen.value = false;
    }
};
  
onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>