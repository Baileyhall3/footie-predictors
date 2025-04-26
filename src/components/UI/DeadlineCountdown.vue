<template>
    <span v-if="countdown && !deadlineHasPassed">{{ countdown }}</span>
    <span v-if="deadlineHasPassed">{{ DateUtils.toFullDateTime(deadline) }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import DateUtils from '../../utils/dateUtils';

export interface IProps {
    deadline: string | Date
}
const props = defineProps<IProps>();

const countdown = ref('');
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const deadlineHasPassed = computed(() => {
    return new Date() > new Date(props.deadline)
})

const updateCountdown = () => {
    if (!props.deadline) return;

    const now = new Date().getTime();
    const deadlineTime = new Date(props.deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) {
        countdown.value = 'Deadline passed';
        clearInterval(countdownInterval!);
        return;
    }

    // If it's more than 24 hours away
    if (diff > 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        countdown.value = `${days}d ${hours}h ${minutes}m`;
    } else {
        // Less than 24 hours away
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdown.value = `${hours}h ${minutes}m ${seconds}s`;
    }
};

onMounted(() => {
    if (props.deadline) {
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }
});

onBeforeUnmount(() => {
    if (countdownInterval) clearInterval(countdownInterval);
});

</script>