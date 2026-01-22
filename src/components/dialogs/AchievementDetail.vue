<template>
    <Teleport to="body">
        <div v-if="isVisible" 
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-md" 
            @click="hide"
        >
            <div 
                @click.stop
                :class="[
                    'bg-white w-full sm:h-auto max-h-[90dvh] flex flex-col rounded-lg overflow-hidden shadow-lg sm:mt-0 max-w-md'
                ]"
            >
                <div class="flex items-start px-6 py-4 bg-white z-10">
                    <div class="flex items-center justify-center flex-shrink-0 rounded-full text-5xl font-bold shadow-lg cursor-pointer overflow-hidden"
                        style="width: 5rem; height: 5rem;"
                        :class="props.achievement.is_unlocked ? 'bg-green-100' : 'bg-gray-300'"
                    >
                        <template v-if="props.achievement.is_unlocked">
                            {{ props.achievement.icon }}
                        </template>
                        <span class="font-bold" v-else>
                            {{ isHidden ? '?' : (props.achievement.icon ?? '🏆') }}
                        </span>
                    </div>
                    <div class="ms-2">
                        <div class="text-lg font-semibold">
                            {{ props.achievement.name }}
                        </div>
                        <div>
                            <p class="text-m text-gray-600">
                                {{ isHidden ? 'Achievement is hidden!' :props.achievement.description }}
                            </p>
                            <div class="mt-2 text-sm">
                                <p
                                    v-if="props.achievement.is_unlocked && props.achievement.awarded_at"
                                    class="mt-1  text-green-600"
                                >
                                    Unlocked {{ new Date(props.achievement.awarded_at).toLocaleDateString('en-GB') }}
                                </p>
                                <p class="mt-1">
                                    {{ props.achievement.unlock_percentage }}% of players have unlocked this!
                                </p>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="ms-auto text-gray-600 hover:text-gray-800" @click="hide">
                        <XMarkIcon class="size-6" />
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import "vue3-toastify/dist/index.css";
import { Achievement } from '../../types';
import { XMarkIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
    achievement: Achievement;
}>();

const isVisible = ref<boolean>(false);
const errorMsg = ref<string>('');

const isHidden = computed(() => {
    return props.achievement.is_hidden && !props.achievement.is_unlocked;
});

const show = () => {
    isVisible.value = true;
}

const hide = () => {
    errorMsg.value = '';
    isVisible.value = false;
}

defineExpose({ show });
</script>