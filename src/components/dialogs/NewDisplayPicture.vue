<template>
    <Dialog title="Edit Display Picture" v-if="isVisible">
        <template #details>
            <div class="flex flex-col w-full gap-6">
                <div class="flex gap-4 mt-4 items-start justify-center mb-4">
                    <div class="relative flex items-center justify-center" style="width: 10rem; height: 10rem;">
                        <div class="flex items-center justify-center rounded-full text-6xl font-bold shadow-lg cursor-pointer overflow-hidden"
                            style="width: 10rem; height: 10rem; border: 2px solid black;"
                            @click="triggerFileUpload"
                        >
                            <template v-if="previewUrl">
                                <img :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
                            </template>
                            <template v-else-if="userProfileImageUrl">
                                <img :src="userProfileImageUrl" alt="Current Profile" class="object-cover w-full h-full" />
                            </template>
                            <template v-else>
                                <PhotoIcon class="size-6" />
                            </template>
                        </div>

                        <button v-if="userStore.userProfile.profile_picture_url"
                            @click="removeProfilePicture"
                            class="absolute bottom-[-1.8rem] text-red-500 text-sm underline hover:text-red-700 w-full text-center"
                        >
                            Remove
                        </button>
                    </div>

                    <div
                        class="flex items-center justify-center rounded-full text-white text-4xl font-bold shadow-lg"
                        :style="{ width: '10rem', height: '10rem', backgroundColor: userDisplayPicColour }"
                    >
                        {{ userStore.userProfile.username.charAt(0).toUpperCase() }}
                    </div>

                    <input 
                        ref="fileInputRef"
                        type="file"
                        class="hidden"
                        accept="image/*"
                        @change="handleFileChange"
                    />
                </div>


                <div>
                    <h4 class="text-l font-semibold mb-2 ms-2">Select Colour</h4>
                    <div class="flex flex-wrap justify-center gap-4 border-t pt-6 w-full p-4">
                        <div 
                            v-for="colour in selectableColours"
                            :key="colour"
                            class="flex items-center justify-center rounded-full text-white text-lg font-semibold cursor-pointer transition duration-200"
                            @click="setNewColour(colour)"
                            :style="{
                                width: '5rem',
                                height: '5rem',
                                backgroundColor: colour,
                                border: colour === userDisplayPicColour ? '2px solid black' : 'none'
                            }"
                        >
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="justify-center flex" v-if="errorMsg">
                <p class="text-red-500 mt-3">{{ errorMsg }}</p>
            </div>
        </template>
        <template #dialogFooter>
            <button @click="cancel" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                Cancel
            </button>
            <button @click="saveChanges" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" :disabled="!hasChanges">
                Save
            </button>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from '../UI/Dialog.vue';
import { ref } from 'vue';
import { userStore } from '../../store/userStore';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { PhotoIcon } from '@heroicons/vue/24/solid';
import { userService } from '../../api/userService';

const hasChanges = ref<boolean>(false);
const isVisible = ref<boolean>(false);
const userDisplayPicColour = ref<string>(userStore.userProfile.bg_colour);
const errorMsg = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const hasRemovedProfilePicture = ref<boolean>(false);
const userProfileImageUrl = ref<string | null>(userStore.userProfile.profile_picture_url);

const selectableColours = [
    '#FF6B6B', // red
    '#6BCB77', // green
    '#4D96FF', // blue
    '#FFD93D', // yellow
    '#FF6EC7', // pink
    '#9D4EDD', // purple
    '#00C49A', // teal
    '#FFA07A', // light salmon
    '#20B2AA', // light sea green
    '#778899'  // light slate gray
]

const triggerFileUpload = () => {
    fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
    hasRemovedProfilePicture.value = false;
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
    const files = (event.target as HTMLInputElement).files;
    hasChanges.value = true;
    if (files && files.length > 0) {
        selectedFile.value = files[0];
        if (selectedFile.value) {
            previewUrl.value = URL.createObjectURL(selectedFile.value);
        } else {
            previewUrl.value = null;
        }
    }
};

function setNewColour(colour: string) {
    hasChanges.value = true;
    userDisplayPicColour.value = colour;
}

function removeProfilePicture() {
    userProfileImageUrl.value = null;
    hasChanges.value = true;
    hasRemovedProfilePicture.value = true;
}

async function saveChanges() {
    try {
        if (selectedFile.value) {
            const { data, error } = userService.uploadDisplayPicture(selectedFile.value);
            if (error) {
                errorMsg.value = error;
                return;
            }
        }

        if (hasRemovedProfilePicture.value) {
            const { data, error } = userService.removeDisplayPicture();
            if (error) {
                errorMsg.value = error;
                return;
            }
        }

        const { data: profileData, error: profileError } = await userStore.updateProfile({ bg_colour: userDisplayPicColour.value });

        if (profileError) {
            errorMsg.value = profileError;
            return;
        } else {
            toast("Display picture updated successfully!", {
                "type": "success",
                "position": "top-center"
            });
            hide();
        }
    } catch(err) {
        errorMsg.value = err;
        console.error(err);
    } finally {
        hasChanges.value = false;
        hasRemovedProfilePicture.value = false;
        userProfileImageUrl.value = userStore.userProfile.profile_picture_url;
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
    hasChanges.value = false;
    isVisible.value = false;
}

defineExpose({ show });
</script>