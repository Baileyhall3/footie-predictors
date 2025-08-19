<template>
    <Dialog title="Send Reminder" v-model="isVisible" bgBlur size="lg">
        <template #body>
            <div class="p-6">
                <div class="flex flex-col w-full gap-6">
                    <p class="text-gray-600">A reminder notification will be sent to the following group members:</p>
                </div>
                <div class="rounded-md bg-gray-200 px-2 mt-2">
                    <div v-for="(member, index) in props.groupMembers" :key="member.user_id" 
                        class="flex justify-between items-center py-3">
                        <UsernameDisplay :user="member" />
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <button @click="cancel" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                Cancel
            </button>
            <button 
                @click="sendNotification" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSending"
            >
                Send
            </button>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog } from '../UI';
import { ref } from 'vue';
import UsernameDisplay from '../UI/UsernameDisplay.vue';

interface Member {
    user_id: string,
    username: string,
    bg_colour: string,
    profile_picture_url?: string
}

const props = defineProps<{
    groupMembers: Member[],
    groupId: string
}>();

const isVisible = ref<boolean>(false);
const errorMsg = ref<string>('');
const isSending = ref<boolean>(false);

const cancel = () => {
    hide();
}

const show = () => {
    isVisible.value = true;
}

const hide = () => {
    errorMsg.value = '';
    isVisible.value = false;
}

defineExpose({ show });
</script>