<template>
    <Teleport to="body">
        <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-96 text-center">
                <h2 class="text-xl font-semibold mb-4">Enter Group PIN</h2>
                <p class="text-gray-700 mb-4">This group is private. Enter the 4-digit PIN to join.</p>

                <div class="flex gap-2 justify-center mt-2">
                    <input
                        v-for="(digit, index) in pin"
                        :key="index"
                        ref="pinInputs"
                        type="number"
                        maxlength="1"
                        class="w-12 h-12 text-center border rounded-md text-xl font-bold focus:ring-2 focus:ring-blue-500"
                        v-model="pin[index]"
                        @input="handleInput(index, $event)"
                        @keydown.backspace="handleBackspace(index, $event)"
                    />
                </div>

                <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>

                <div class="mt-6 flex justify-center gap-4">
                    <button @click="confirm" class="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
                        Submit
                    </button>
                    <button @click="cancel" class="bg-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { groupsService } from "../api/groupsService";

const props = defineProps<{
    groupId: string;
}>()

const emit = defineEmits(["submit-pin"]);

const pin = ref(["", "", "", ""]);
const pinInputs = ref<HTMLInputElement[]>([]);
const isVisible = ref(false);
const errorMessage = ref("");

const show = () => {
    isVisible.value = true;
    pin.value = ["", "", "", ""]; // Reset PIN input
    errorMessage.value = "";
    
    nextTick(() => {
        pinInputs.value[0]?.focus(); // Auto-focus first input
    });
};

const confirm = async () => {
    try {
        const enteredPin = pin.value.join("")
        const isValid = await groupsService.verifyGroupPin(props.groupId, enteredPin)

        if (isValid) {
            emit("submit-pin", enteredPin)
            isVisible.value = false
        } else {
            errorMessage.value = "Incorrect PIN. Try again."
        }
    } catch (err) {
        errorMessage.value = "Something went wrong. Please try again."
    }
}

const cancel = () => {
    isVisible.value = false;
};

const handleInput = (index: number, event: Event) => {
    const value = (event.target as HTMLInputElement).value.replace(/\D/g, ""); // Allow only numbers
    pin.value[index] = value.substring(0, 1);

    if (value && index < 3) {
        nextTick(() => pinInputs.value[index + 1]?.focus());
    }
};

const handleBackspace = (index: number, event: KeyboardEvent) => {
    if (!pin.value[index] && index > 0) {
        nextTick(() => pinInputs.value[index - 1]?.focus());
    }
};

// Expose the show method to be called from parent
defineExpose({ show });
</script>
