<template>
    <div class="relative me-2 border border-gray-300 rounded-md">
        <div class="inline-flex items-center">
            <button @click="showLookupMenu = !showLookupMenu"
                class="text-sm px-3 py-1 border-r border-gray-300 rounded-md hover:bg-gray-200 transition"
                :class="`bg-${props.bgColor ?? 'bg-gray-100'}`"
            >
                {{ props.displayText }}
            </button>
    
            <div class="px-3 py-1 text-sm bg-gray-50 text-gray-700  border-gray-300" v-if="props.displayValue">
                {{ props.displayValue }}
            </div>
        </div>

        <ul v-if="showLookupMenu"
            class="absolute mt-2 z-10 bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto w-48"
        >
            <li v-for="item in props.data"
                :key="item.id"
                @click="selectItem(item)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                :class="{
                    'bg-blue-100': item.selected,
                }"
            >
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

export interface LookupOption {
    id: string | number,
    name: string,
    selected: boolean
}

export interface IProps {
    displayText: string | number | undefined,
    data: LookupOption[],
    bgColor?: string
    displayValue?: string
}

export interface IEmits {
    (e: 'item-selected', item: LookupOption): void,
}

const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();

const showLookupMenu = ref(false);

function selectItem(item: LookupOption) {
    props.data.forEach(x => {
        x.selected = false;
    });
    item.selected = true;
    showLookupMenu.value = false;
    emit("item-selected", item);
}

const closeLkpMenu = (event) => {
    if (!event.target.closest('.relative')) {
        showLookupMenu.value = false;
    }
}

onMounted(() => document.addEventListener('click', closeLkpMenu));
onUnmounted(() => document.removeEventListener('click', closeLkpMenu));

</script>