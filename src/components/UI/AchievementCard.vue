<template>
    <div
        class="relative rounded-xl p-4 transition-all duration-300"
        :class="[
            props.achievement.is_unlocked
            ? 'bg-white shadow-md hover:shadow-xl'
            : 'bg-gray-100 opacity-60 grayscale'
        ]"
    >
        <div class="flex items-start gap-3">
            <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl leading-none"
                :class="props.achievement.is_unlocked ? 'bg-green-100' : 'bg-gray-300'"
            >
                <template v-if="props.achievement.is_unlocked">
                    {{ props.achievement.icon }}
                </template>
                <span class="font-bold" v-else>
                    {{ isHidden ? '?' : (props.achievement.icon ?? '🏆') }}
                </span>
            </div>

            <div>
                <h3 class="text-lg font-semibold">
                    {{ isHidden ? '???' : props.achievement.name }}
                </h3>
                <p class="text-sm text-gray-600">
                    {{ isHidden ? 'Achievement is hidden!' :props.achievement.description }}
                </p>
                <p
                    v-if="props.achievement.is_unlocked && props.achievement.awarded_at"
                    class="mt-1 text-xs text-green-600"
                >
                    Unlocked {{ new Date(props.achievement.awarded_at).toLocaleDateString('en-GB') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Achievement } from '../../types';
import { computed } from 'vue'; 

const props = defineProps<{
    achievement: Achievement
}>();

const isHidden = computed(() => {
    return props.achievement.is_hidden && !props.achievement.is_unlocked;
});
</script>