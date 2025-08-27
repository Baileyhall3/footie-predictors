<template>
    <Dialog title="Create Notification" v-model="isVisible" bgBlur @hidden="hideEvent" size="lg" @shown="showEvent">
        <template #body>
            <div class="p-6">
                <div class="flex flex-col w-full gap-6">
                    <p class="text-gray-600">Create a notification to be sent to all group members.</p>
                </div>

                <div class="space-y-4 mt-4" v-if="notification">
                    <div>
                        <label for="header" class="text-gray-600 font-medium text-sm">Header</label>
                        <input
                            v-model="notification.template_data.header"
                            type="text"
                            placeholder="Header"
                            class="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="header"
                        />
                    </div>

                    <div>
                        <p class="text-gray-600 font-medium text-sm">Content</p>
                        <TextEditor v-model="notification.template_data.content" />
                    </div>

                    <div ref="priorityDropdown">
                        <label class="block text-sm font-medium text-gray-600">Priority</label>
                        <div class="relative">
                            <button 
                                @click="togglePriorityDropdown"
                                class="mt-1 p-2 w-full border rounded-md flex justify-between items-center"
                                type="button"
                            >   
                                <template v-if="notification.priority">
                                    <div class="flex items-center">
                                        <span 
                                            class="inline-block w-5 h-5 rounded-full me-2"
                                            :class="getPriorityBadgeClass(notification.priority)"
                                            :title="`Priority: ${notification.priority}`"
                                        ></span>
                                        {{ notification.priority }}
                                    </div>
                                </template>
                                <span v-else>Select...</span>
                            </button>
                            
                            <ul v-if="priorityDropdownOpen" class="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-20">
                                <li v-for="priority in notificationPriorities" :key="priority" 
                                    @click="notification.priority = priority; priorityDropdownOpen = false;"
                                    class="p-2 hover:bg-gray-100 flex items-center cursor-pointer"
                                >
                                    <span 
                                        class="inline-block w-5 h-5 rounded-full me-2"
                                        :class="getPriorityBadgeClass(priority)"
                                        :title="`Priority: ${priority}`"
                                    ></span>
                                    {{ priority }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <label for="link" class="text-gray-600 font-medium text-sm">Link (optional)</label>
                        <input
                            v-model="notification.link"
                            type="text"
                            placeholder="Example: /season/season1"
                            class="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="link"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-600">Expiry Date (optional)</label>
                        <div class="p-2 border border-gray-300 rounded-md">
                            <DatePicker 
                                v-model="notification.expires_at" 
                                showIcon 
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                                class="w-full"
                                :minDate="minDate"
                                fluid
                                hideOnDateTimeSelect
                            />
                        </div>
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
            <button 
                @click="createNotification" 
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                :disabled="!notification?.template_data.header || !notification?.template_data.content || !notification?.priority"
            >
                Create
            </button>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog } from '../UI';
import { ref, watch, onBeforeUnmount, nextTick, computed } from 'vue';
import { TextEditor } from '../UI/input';
import type { NotificationType, NotificationPriority, NotificationTemplateData } from '../../types';
import LoadingContainer from '../../components/LoadingContainer.vue';
import { getPriorityBadgeClass } from '../../utils/sharedFunctions';
import { groupsService } from '../../api/groupsService';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

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

const priorityDropdownOpen = ref(false);
const priorityDropdown = ref<HTMLElement | null>(null);

const minDate = computed(() => {
    return new Date();
});

const handleClickOutside = (event: MouseEvent) => {
    if (priorityDropdown.value && !priorityDropdown.value.contains(event.target as Node)) {
        priorityDropdownOpen.value = false;
    }
};

watch(priorityDropdownOpen, async (isOpen) => {
    if (isOpen) {
        await nextTick(); // ensure DOM is updated
        document.addEventListener("click", handleClickOutside, true); // use capture phase
    } else {
        document.removeEventListener("click", handleClickOutside, true);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside, true);
});

const notificationPriorities: NotificationPriority[] = ['info', 'success', 'warning', 'urgent']

function showEvent() {
    notification.value = {
        group_id: props.groupId,
        template_data: {
            header: 'Group Announcement',
            content: ''
        },
        type: 'admin_announcement',
        priority: 'info',
        expires_at: undefined,
        link: undefined
    }
}

const togglePriorityDropdown = () => {
    priorityDropdownOpen.value = !priorityDropdownOpen.value;
};

async function createNotification() {
    try {

        const { error } = await groupsService.createGroupNotification(notification.value);
        if (error) {
            errorMsg.value = error;
            throw new Error;
        }

        hide();

        toast('Notification Sent!', {
            "type": "success",
            "position": "top-center"
        });
    } catch (err) {
        console.error(err);
        errorMsg.value = err;
    }
}

function hideEvent() {
    // document.removeEventListener("click", handleClickOutside);
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