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
import { CreatedNotification, notificationsService } from '../../api/notificationsService';
import { Gameweek } from '../../types';
import DateUtils from '../../utils/dateUtils';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface Member {
    user_id: string,
    username: string,
    bg_colour: string,
    profile_picture_url?: string
}

const props = defineProps<{
    groupMembers: Member[],
    groupId: string,
    gameweek: Gameweek
}>();

const isVisible = ref<boolean>(false);
const errorMsg = ref<string>('');
const isSending = ref<boolean>(false);

async function sendNotification() {
    try {
        isSending.value = true;

        const userIds: string[] = props.groupMembers.map(x => x.user_id);
        const notif: CreatedNotification = {
            group_id: props.groupId,
            template_data: {
                header: 'Predictions Reminder',
                content: `You have not submitted all predictions for gameweek <b>${props.gameweek.week_number}</b>.<br> The deadline is <b>${DateUtils.toFullDateTime(props.gameweek.deadline)}</b>. Go make your predictions now!`,
                link_text: 'View Gameweek'
            },
            type: 'predictions_reminder',
            priority: 'warning',
            link: `/gameweek/${props.gameweek.id}`,
            expires_at: props.gameweek.deadline
        }

        const { error } = await notificationsService.notifySelectedUsers(notif, userIds);
        if (error) {
            errorMsg.value = error;
            throw new Error;
        }

        hide();

        toast('Notification Sent!', {
            "type": "success",
            "position": "top-center"
        });
    } catch(err) {
        errorMsg.value = err;
        console.error(err);
    } finally {
        isSending.value = false;
    }
}

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