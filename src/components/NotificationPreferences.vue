<template>
    <div 
        v-for="(preference, index) in props.preferences" 
        :key="preference.type" 
        :class="{'mb-4': index !== props.preferences.length - 1}"
    >
        <!-- <SwitchInput 
            :disabled="isSavingId === preference.id"
            v-model="preference.allow_push"
            @update:modelValue="(val) => handleToggle(preference.id, val)"    
        >
            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {{ formatType(preference.type) }}
            </span>
        </SwitchInput> -->
        
        <div class="flex items-center">
            <button 
                type="button" 
                class="p-1 disabled:opacity-50"
                :disabled="isSavingId === preference.id"
                @click="handleToggle(preference.id, !preference.allow_push)"
            >
                <BellIcon 
                    class="size-5" 
                    :class="{ 'animate-ding': dingingBells[preference.id] }"
                    v-if="preference.allow_push" 
                />
                <BellSlashIcon 
                    class="size-5" 
                    :class="{ 'animate-ding': dingingBells[preference.id] }"
                    v-else 
                />
            </button>
            <span class="ms-3 text-sm text-gray-900 dark:text-gray-300">
                {{ formatType(preference.type) }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { notificationsService } from '../api/notificationsService';
import type { NotificationPreference } from '../types';
import { ref } from 'vue';
import { BellIcon, BellSlashIcon } from '@heroicons/vue/24/solid';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const props = defineProps<{
    preferences: NotificationPreference[]
}>();

const emit = defineEmits<{
    (e: 'preference-updated', preference: NotificationPreference): void
}>()

// const preferences = ref<Array<NotificationPreference>>([]);
const isSavingId = ref<string | null>(null);
const dingingBells = ref<{ [id: string]: boolean }>({});

const formatType = (type: string): string => {
    return type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

async function handleToggle(id: string, allowPush: boolean) {
    dingingBells.value[id] = true;

    try {
        isSavingId.value = id;

        const { data, error } = await notificationsService.updateNotificationPreferencePush(id, allowPush);
        if (error) throw new Error('Failed to update allow_push for preference');

        // refresh only that notification
        const target = props.preferences.find(n => n.id === id);
        if (target) {
            target.allow_push = !target.allow_push;
        }

        emit("preference-updated", data);
        
        toast("Preference updated successfully!", {
            "type": "success",
            "position": "top-center"
        });
    } catch(err) {
        console.error(err);
    } finally {
        isSavingId.value = null;
        setTimeout(() => {
            dingingBells.value[id] = false;
        }, 500);
    }
}

</script>

<style scoped>
@keyframes ding {
  0% { transform: scale(1) rotate(0); }
  20% { transform: scale(1.1) rotate(-10deg); }
  40% { transform: scale(1.1) rotate(10deg); }
  60% { transform: scale(1.075) rotate(-5deg); }
  80% { transform: scale(1.05) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}

.animate-ding {
  animation: ding 0.5s ease-in-out;
}
</style>