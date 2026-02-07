<template>
    <div class="justify-center bg-red-600 rounded-md py-2 flex items-center text-white">
        <Clock4 class="w-5 h-5 inline-block mr-1" />
        <h3 class="text-lg">
            Deadline:
            <span class="font-semibold">
                <DeadlineCountdown :deadline="new Date(props.deadline)" />
            </span>
        </h3>
    </div>
</template>

<script setup lang="ts">
import DeadlineCountdown from './DeadlineCountdown.vue';
import { ClockIcon } from '@heroicons/vue/24/outline';

import { Clock4 } from 'lucide-vue-next';

const props = defineProps<{
    deadline: Date;
}>();
</script>