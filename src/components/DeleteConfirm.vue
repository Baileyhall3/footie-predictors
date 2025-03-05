<template>
    <Teleport to="body">
        <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-96 text-center">
                <h2 class="text-xl font-semibold mb-4">{{ props.title }}</h2>
                <p class="text-gray-700 mb-6">{{ props.message }}</p>
                <div class="flex justify-center gap-4">
                    <button @click="cancel" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                        Cancel
                    </button>
                    <button @click="confirm" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
  
<script setup lang="ts">
import { ref } from "vue";

export interface IProps {
    title: string;
    message: string;
}

const props = withDefaults(defineProps<IProps>(), {
    title: 'Confirm Delete',
    message: 'Are you sure you wish to delete? This cannot be undone.',
});

const isVisible = ref(false);
const resolve = ref<((value: boolean) => void) | null>(null);
  
// Function to show the dialog and return a promise
const show = () => {
    isVisible.value = true;
    return new Promise<boolean>((res) => {
        resolve.value = res;
    });
};
  
// Handle confirmation
const confirm = () => {
    resolve.value?.(true);
    isVisible.value = false;
};

// Handle cancellation
const cancel = () => {
    resolve.value?.(false);
    isVisible.value = false;
};

// Expose the show method to be called from parent
defineExpose({ show });
</script>
  