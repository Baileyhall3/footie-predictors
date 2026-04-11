<template>
    <Dialog v-model="isVisible" bgBlur @shown="showEvent" @hidden="hideEvent" size="lg">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="text-lg font-semibold">
                    {{ dateTitle }}
                </div>
                <button class="rounded-full bg-black text-white mx-2" @click="handleCreateClicked">
                    <span class="p-1">
                        +
                    </span>
                </button>
            </div>
        </template>
        <template #body>
            <div class="px-6 py-4 gap-1">
                <template v-if="props.events.length">
                    <div class="grid grid-cols-[35%_15%_50%] mb-2" v-for="event in props.events" :key="event.id">
                        <span>
                            {{ DateUtils.toTime(event.start) }}
                            -
                            {{ DateUtils.toTime(event.end) }}
                        </span>
                        <div
                            class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium me-2"
                            :style="{ backgroundColor: event.color || '#ccc' }"
                        >
                        </div>
                        <span class="font-semibold">{{ event.title }}</span>
                    </div>
                </template>
                <div v-else class="flex justify-center">
                    <span class="text-gray-500">No events</span>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from '../Dialog.vue';
import { ref, computed } from 'vue';
import "vue3-toastify/dist/index.css";
import DateUtils from '../../../utils/dateUtils';
import CalendarAddEvent from './CalendarAddEvent.vue';

const props = defineProps<{
    date: Date
    events: any[];
}>();

const emit = defineEmits<{
    (e: 'create-clicked'): void;
}>();

const isVisible = ref(false);

const dateTitle = computed(() => {
    return DateUtils.toLongDate(props.date)
});

function handleCreateClicked() {
    emit("create-clicked");
}

const show = () => {
    isVisible.value = true;
}

const hide = () => {
    isVisible.value = false;
}

defineExpose({ show, hide });
</script>