<template>
    <div class="relative flex items-center gap-2">
        <div class="relative">
            <button @click="toggleDropdown()" class="p-1 rounded-md hover:bg-gray-200" :class="{'bg-gray-200': dropdownOpen}">
                <slot name="trigger"></slot>
                <template v-if="!slots.trigger">
                    <EllipsisHorizontalIcon class="size-6 text-gray-500" />
                </template>
            </button>

            <!-- Dropdown Menu -->
            <Transition name="fade-slide">
                <template v-if="dropdownOpen">
                    <div class="absolute right-0 bg-white shadow-lg rounded-md border z-50" style="width: max-content;">
                        <slot name="items"></slot>
                    </div>
                </template>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { EllipsisHorizontalIcon } from "@heroicons/vue/24/solid";
import { ref, useSlots, onMounted, onUnmounted } from 'vue';

const dropdownOpen = ref(false);
let isMounted = false;

const toggleDropdown = () => {
    if (!isMounted) return;
    dropdownOpen.value = !dropdownOpen.value;
}

const slots = useSlots();

function handleClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest(".relative")) {
        dropdownOpen.value = false;
    }
}

onMounted(() => {
    isMounted = true;
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Fade and slide-down effect */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>