<template>
    <header
        class="sticky top-0 z-40 bg-white border-b"
        style="padding-top: env(safe-area-inset-top)"
    >
        <div class="h-12 flex items-center justify-between px-3">

        <!-- Left: Back -->
        <button
            @click="handleBack"
            class="p-2 -ml-2 rounded-full active:bg-gray-100"
        >
            <ChevronLeftIcon class="size-5 text-gray-700" />
        </button>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
            <slot name="actions" />
        </div>

        </div>
    </header>
</template>

<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';

const props = defineProps<{
    backTo: string;
}>();

const router = useRouter();

const handleBack = () => {
    if (props.backTo) {
        router.push(props.backTo)
    } else {
        router.back()
    }
}
</script>