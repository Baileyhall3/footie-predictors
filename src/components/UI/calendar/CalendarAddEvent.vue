<template>
    <Dialog v-model="isVisible" bgBlur @shown="showEvent" @hidden="hideEvent" size="lg">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="text-lg font-semibold">
                    New Session
                </div>
                <!-- <button class="rounded-full bg-black text-white mx-2">
                    <span class="p-1">
                        +
                    </span>
                </button> -->
            </div>
        </template>
        <template #body>
            <div class="px-6 py-4 gap-1">
                <div>
                    <label class="block font-medium">Title</label>
                    <input
                      v-model="newSession.title"
                      type="text"
                      placeholder="Title"
                      class="w-full border p-2 rounded-md"
                      required
                    />
                </div>

                <div class="mt-4">
                    <label class="block font-medium">Start</label>
                    <div class="p-2 border w-full rounded-md">
                        <DatePicker 
                            v-model="newSession.from" 
                            showIcon 
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                            class="w-full"
                            fluid
                            hideOnDateTimeSelect
                        />
                    </div>
                </div>

                <div class="mt-4">
                    <label class="block font-medium">End</label>
                    <div class="p-2 border w-full rounded-md">
                        <DatePicker 
                            v-model="newSession.to" 
                            showIcon 
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                            class="w-full"
                            fluid
                            hideOnDateTimeSelect
                        />
                    </div>
                </div>
                
                <div class="mt-4">
                    <label class="block font-medium">Max Participants</label>
                    <input v-model.number="newSession.max_participants" type="number" min="1" max="100" class="w-full border p-2 rounded-md" />
                </div>
            </div>
        </template>
        <template #footer>
            <button @click="hide" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                Cancel
            </button>
            <button 
                @click="createSession" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                :disabled="!canCreateSession"
            >
                Create
            </button>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from '../Dialog.vue';
import { ref, computed, reactive } from 'vue';
import "vue3-toastify/dist/index.css";
import DateUtils from '../../../utils/dateUtils'

const props = defineProps<{
    date: Date
    defaultMaxParticipants?: number;
}>();

const isVisible = ref(false);

interface NewSession {
    title: string;
    from: Date;
    to: Date;
    max_memebers: number
}

const newSession = reactive<NewSession>({
    title: '',
    from: props.date,
    to: null,
    max_memebers: 25
});

const canCreateSession = computed(() => {
    return (newSession.title && newSession.from && newSession.to) ? true : false;
});

const show = () => {
    isVisible.value = true;
}

const hide = () => {
    isVisible.value = false;
}

defineExpose({ show, hide });
</script>