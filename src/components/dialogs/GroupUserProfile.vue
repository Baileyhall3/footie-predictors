<template>
    <Dialog title="Create Notification" v-model="isVisible" bgBlur @hidden="hideEvent" size="lg" @shown="loadAllData">
        <template #body>
            hello
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import "vue3-toastify/dist/index.css";
import { Dialog } from '../UI';

const props = defineProps<{
    userId: string;
    groupId: string;
}>();

const isVisible = ref<boolean>(false);
const errorMsg = ref<string>('');

async function loadAllData() {

}

const show = () => {
    isVisible.value = true;
}

const hide = () => {
    errorMsg.value = '';
    // hasChanges.value = false;
    isVisible.value = false;
}

defineExpose({ show });
</script>