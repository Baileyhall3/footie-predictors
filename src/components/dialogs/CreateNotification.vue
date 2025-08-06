<template>
    <Dialog title="Create Notification" v-model="isVisible" bgBlur @hidden="hideEvent" size="lg" @shown="showEvent">
        <template #body>
            <div class="p-6">
                <div class="flex flex-col w-full gap-6">
                    <p class="text-gray-600">Create a notification to be sent to all group members.</p>
                </div>

                <div class="space-y-4 mt-4" v-if="notification">
                    <div>
                        <label for="header" class="text-gray-600 text-sm">Header</label>
                        <input
                            ref="inputRef"
                            v-model="notification.template_data.header"
                            type="text"
                            placeholder="Header"
                            class="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="header"
                        />
                    </div>
                    <div>
                        <p class="text-gray-600 text-sm">Content</p>
                        <TextEditor v-model="notification.template_data.content" />
                    </div>
                </div>
                
                <div class="justify-center flex" v-if="errorMsg">
                    <p class="text-red-500 mt-3">{{ errorMsg }}</p>
                </div>
            </div>
        </template>
        <template #footer>
            <button @click="cancel" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                Cancel
            </button>
            <button @click="createNotification" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                Create
            </button>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog } from '../UI';
import { ref } from 'vue';
import { TextEditor } from '../UI/input';
import type { NotificationType, NotificationPriority, NotificationTemplateData } from '../../types';
import LoadingContainer from '../../components/LoadingContainer.vue';

export interface GroupNotification {
    group_id?: string,
    template_data: NotificationTemplateData,
    type: NotificationType
    priority: NotificationPriority
    expires_at?: Date
    link?: string
}

const props = defineProps<{
    groupId: string
}>();

const isVisible = ref<boolean>(false);
const errorMsg = ref<string>('');
const notification = ref<GroupNotification>();
const isLoading = ref<boolean>(false);

function showEvent() {
    notification.value = {
        group_id: props.groupId,
        template_data: {
            header: 'New Notification',
            content: ''
        },
        type: 'admin_announcement',
        priority: 'info'
    }
}

async function createNotification() {
    console.log('notif ', notification.value?.template_data.content )
}

function hideEvent() {
    // userDisplayPicColour.value = userStore.userProfile.bg_colour;
}

const cancel = () => {
    hide();
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