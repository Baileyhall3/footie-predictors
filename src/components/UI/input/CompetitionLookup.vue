<template>
    <div :class="props.class" ref="competitionDropdown">
        <div class="relative">
            <button 
                @click="toggleCompetitionDropdown"
                class="mt-1 p-2 w-full border rounded-md flex justify-between items-center"
                type="button"
            >   
                <template v-if="selectedCompetition">
                    <span>
                        <img :src="selectedCompetition.emblem" alt="Competition Emblem" class="w-6 h-6 inline-block mr-2">
                        {{ selectedCompetition.name }}
                    </span>
                    <button type="button" @mousedown.stop="clearCompetition">
                        <XMarkIcon class="size-5" />
                    </button>
                </template>
                <span v-else>Select...</span>
            </button>
            
            <ul v-if="competitionDropdownOpen" class="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto z-20">
                <li v-for="competition in competitions" :key="competition.id" 
                    @click="selectCompetition(competition)"
                    class="p-2 hover:bg-gray-100 flex items-center cursor-pointer">
                    <img :src="competition.emblem" alt="Competition Emblem" class="w-6 h-6 mr-2">
                    {{ competition.name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, HTMLAttributes } from 'vue';
import { competitionsService } from '../../../api/competitionsService';
import type { Competition } from '../../../api/competitionsService';
import { footballApiClient } from '../../../api/footballApi.client';
import { XMarkIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
    selectedCompetition: Competition | null;
    class?: HTMLAttributes['class'];
}>();

const emit = defineEmits<{
    (e: 'competition-selected', competition: Competition): void;
    (e: 'competition-cleared'): void;
}>();

const competitionDropdownOpen = ref(false);
const competitionDropdown = ref(null);

const competitions = ref<Array<Competition>>([]);

const toggleCompetitionDropdown = () => {
    competitionDropdownOpen.value = !competitionDropdownOpen.value;
};

const selectCompetition = async(competition: any) => {
    competitionDropdownOpen.value = false;
    emit('competition-selected', competition);
};

const clearCompetition = () => {
    competitionDropdownOpen.value = false;
    emit('competition-cleared');
};

const handleClickOutside = (event: any) => {
    if (competitionDropdown.value && !competitionDropdown.value.contains(event.target)) {
        competitionDropdownOpen.value = false;
    }
}

onMounted(async () => {
    document.addEventListener("click", handleClickOutside);
    competitions.value = await footballApiClient.getLeagues();
    // const { data, error } = await competitionsService.getCompetitions();
    // if (error) {
    //     console.error('Error fetching competitions:', error);
    // } else {
    //     competitions.value = data || [];
    // }
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>