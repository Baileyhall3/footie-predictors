<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-800 px-6 py-8 text-white">
        <h1 class="text-3xl font-bold">My Profile</h1>
        <div class="flex items-center space-x-2" v-if="userStore.user">
            <div v-if="userStore.userProfile.profile_picture_url" class=" w-6 h-6 flex items-center justify-center rounded-full overflow-hidden me-2">
                <img :src="userStore.userProfile.profile_picture_url" alt="Profile Image" class="object-cover w-full h-full" />
            </div>
            <div v-else
                class="flex items-center justify-center rounded-full w-6 h-6 text-white text-sm font-medium me-2"
                :style="{ backgroundColor: userStore.userProfile.bg_colour || '#ccc' }"
            >
                {{ userStore.userProfile.username.charAt(0).toUpperCase() }}
            </div>
            {{ userStore.userProfile.username }}
        </div>
      </div>

      <!-- Profile Content -->
      <div class="p-6">
        <div v-if="userStore.loading" class="flex justify-center py-8">
          <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="!userStore.user" class="py-8 text-center">
          <p class="text-gray-600 mb-4">You are not logged in.</p>
          <div class="flex justify-center space-x-4">
            <router-link to="/login" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Sign In
            </router-link>
            <router-link to="/register" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
              Register
            </router-link>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- User Info Section -->
          <div class="border-b pb-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Account Information</h2>
                <div class="flex flex-wrap gap-2">
                    <EditBtn v-if="!editMode" @begin-edit="editMode = true" title="Edit profile" />
                    <template v-else>
                      <SaveBtn @saved="saveChanges" />
                      <CancelBtn @cancelled="cancelChanges" title="Cancel changes" />
                    </template>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Display Picture</p>
                <div class="flex items-center">
                  <div v-if="userStore.userProfile.profile_picture_url" class=" w-10 h-10 flex items-center justify-center rounded-full overflow-hidden">
                      <img :src="userStore.userProfile.profile_picture_url" alt="Profile Image" class="object-cover w-full h-full" />
                  </div>
                  <div v-else
                      class="flex items-center justify-center rounded-full w-10 h-10 text-white text-sm font-medium me-2"
                      :style="{ backgroundColor: userStore.userProfile.bg_colour || '#ccc' }"
                  >
                      {{ userStore.userProfile.username.charAt(0).toUpperCase() }}
                  </div>
                  <button type="button" @click="openDisplayPictureDialog">
                    <PaintBrushIcon class="size-4 ms-2" v-if="editMode" />
                  </button>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="text-gray-800">{{ userStore.user.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Username</p>
                <input v-if="editMode" type="text" class="w-full border p-2 rounded-md" v-model="userData.username" placeholder="Enter username">
                <p v-else class="text-gray-800">{{ userStore.userProfile.username }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Account ID</p>
                <p class="text-gray-800">{{ userStore.user.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Member Since</p>
                <p class="text-gray-800">{{ DateUtils.toShortDate(userStore.user.created_at) }}</p>
              </div>
            </div>
            <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
          </div>

          <!-- Account Actions -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
            <div class="space-y-3">
              <button 
                @click="handleLogout" 
                class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center"
                :disabled="userStore.loading"
              >
                <span v-if="userStore.loading" class="mr-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <NewDisplayPicture ref="displayPictureDialog" />
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { userStore } from '../store/userStore';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import DateUtils from '../utils/dateUtils';
import NewDisplayPicture from '../components/dialogs/NewDisplayPicture.vue';
import { PaintBrushIcon } from "@heroicons/vue/24/solid";
import { SaveBtn, CancelBtn, EditBtn } from '../components/UI/buttons';

const router = useRouter();
const editMode = ref(false);
const errorMessage = ref('');
const displayPictureDialog = ref(null);
const userData = ref({ username: userStore.userProfile.username });

const toggleEditMode = () => {
  editMode.value = true;
}

const cancelChanges = () => {
  editMode.value = false;
}

const saveChanges = async () => {
  if (userData.value.username == '') {
    errorMessage.value = 'You need to enter a username.';
    return;
  } else {
    try {
      const { data: profileData, error: profileError } = await userStore.updateProfile({username: userData.value.username});

      if (profileError) {
        errorMessage.value = profileError;
      } else {
        toast("Profile updated successfully!", {
            "type": "success",
            "position": "top-center"
        });
        errorMessage.value = '';
        editMode.value = false;
      }
    } catch (err) {
      console.error(err);
      errorMessage.value = err;
    }
  }
}

const handleLogout = async () => {
  const { error } = await userStore.signOut()
  if (!error) {
    router.push('/login')
  }
}

const openDisplayPictureDialog = () => {
  displayPictureDialog.value.show();
}
</script>

