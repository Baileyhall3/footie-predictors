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
                <div v-if="dropdownOpen" class="absolute right-0 w-32 bg-white shadow-lg rounded-md border z-50">
                    <slot name="items"></slot>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { EllipsisHorizontalIcon } from "@heroicons/vue/24/solid";
import { ref, useSlots } from 'vue';

const dropdownOpen = ref(false);

const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
}

const slots = useSlots();

document.addEventListener("click", (event) => {
    if (!event.target.closest(".relative")) {
        dropdownOpen.value = false;
    }
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