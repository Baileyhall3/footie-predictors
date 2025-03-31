<template>
    <div class="relative w-full">
        <label class="block font-medium">{{ selectLabel }}</label>
        <div class="w-full border p-2 rounded-md cursor-pointer bg-white" 
            @click="toggleDropdown"
            @keydown.down.prevent="navigate(1)"
            @keydown.up.prevent="navigate(-1)"
            @keydown.enter.prevent="selectOption(activeIndex)"
            tabindex="0"
        >
            <div class="justify-between flex items-center">
                {{ selectedLabel }}
                <ChevronDownIcon class="size-5 ms-2"  />
            </div>
        </div>
      
        <ul v-if="isOpen" 
            class="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg">
            <li v-for="(option, index) in options" 
                :key="option.value" 
                class="p-2 cursor-pointer hover:bg-gray-200" 
                :class="{ 'bg-gray-300': activeIndex === index }"
                @click="selectOption(index)"
                @mouseenter="activeIndex = index"
            >
                {{ option.label }}
            </li>
        </ul>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDownIcon } from "@heroicons/vue/24/solid";

  
const props = defineProps({
    modelValue: String | Boolean,
    options: Array,
    selectLabel: String
});
const emit = defineEmits(['update:modelValue']);
  
const isOpen = ref(false);
const activeIndex = ref(-1);
  
const selectedLabel = computed(() => {
    const selected = props.options.find(option => option.value === props.modelValue);
    return selected ? selected.label : 'Select an option';
});
  
const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};
  
const selectOption = (index) => {
    if (index < 0 || index >= props.options.length) return;
    emit('update:modelValue', props.options[index].value);
    isOpen.value = false;
};
  
const navigate = (direction) => {
    activeIndex.value = (activeIndex.value + direction + props.options.length) % props.options.length;
};
  
const closeDropdown = (event) => {
    if (!event.target.closest('.relative')) {
        isOpen.value = false;
    }
};
  
onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));
</script>
  