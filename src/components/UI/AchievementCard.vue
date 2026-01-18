<template>
    <div
        class="relative rounded-xl p-4 transition-all duration-300 cursor-pointer" 
        :class="[
            props.achievement.is_unlocked
            ? 'bg-white shadow hover:shadow-md'
            : 'bg-gray-100 opacity-60 grayscale'
        ]"
        @click="openDetailDialog"
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

    <AchievementDetail :achievement="achievement" ref="achievementDetail" />
</template>

<script setup lang="ts">
import { Achievement } from '../../types';
import { computed, ref } from 'vue'; 
import AchievementDetail from '../dialogs/AchievementDetail.vue';

const props = defineProps<{
    achievement: Achievement
}>();

const achievementDetail = ref(null);

const isHidden = computed(() => {
    return props.achievement.is_hidden && !props.achievement.is_unlocked;
});

function openDetailDialog() {
    achievementDetail.value?.show();
}
</script>