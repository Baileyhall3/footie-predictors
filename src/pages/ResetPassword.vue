<template>
    <div class="min-h-screen flex justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full ">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleResetpassword">
          <div v-if="userStore.error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ userStore.error }}
                </h3>
              </div>
            </div>
          </div>
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="password" class="sr-only">New Password</label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  :type="isViewingPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  v-model="password"
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                <button type="button" class="absolute inset-y-0 right-3 flex items-center" style="z-index: 1000;" @click="togglePasswordVisibility">
                  <EyeIcon class="size-6" v-if="!isViewingPassword"  />
                  <EyeSlashIcon class="size-6" v-else />
                </button>
              </div>
            </div>
            <div>
              <label for="confirm-password" class="sr-only">Confirm New Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autocomplete="new-password"
                v-model="confirmPassword"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>
  
          <div>
            <button
              type="submit"
              @click="handleResetpassword"
              :disabled="userStore.loading || !passwordsMatch || !isFormValid || !isPasswordStrong"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="userStore.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <!-- Loading spinner -->
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span v-else class="absolute left-0 inset-y-0 flex items-center pl-3">
                <!-- User icon -->
                <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </span>
              Save
            </button>
          </div>
          <div v-if="!passwordsMatch && password && confirmPassword" class="text-sm text-red-600 text-center">
            Passwords do not match
          </div>
          <div v-if="passwordsMatch && password && confirmPassword && !isPasswordStrong" class="text-sm text-red-600 text-center">
            Password must contain minimum 8 characters and consist of at least one uppercase letter, one lowercase letter and one number.
          </div>
          <!-- <div v-if="errorMessage" class="text-sm text-red-600 text-center">
            {{ errorMessage }}
          </div> -->
        </form>
        
      </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userStore } from '../store/userStore';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isViewingPassword = ref(false);

const togglePasswordVisibility = () => {
  isViewingPassword.value = !isViewingPassword.value;
};

const passwordsMatch = computed(() => {
    return !password.value || !confirmPassword.value || password.value === confirmPassword.value;
});
  
const isFormValid = computed(() => {
    return password.value && confirmPassword.value;
});
  
const isPasswordStrong = computed(() => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password.value);
});

onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
    if (error) throw error
    console.log('Session restored:', data.session)
  } catch (err) {
    console.error('Error restoring session:', err.message)
    errorMessage.value = 'Invalid or expired password reset link.'
  }
})
  
const handleResetpassword = async () => {
    try {
      const { error: profileError } = await userStore.updatePassword(password.value);

      if (profileError) {
        errorMessage.value = profileError;
      } else {
        toast("Password updated successfully!", {
            "type": "success",
            "position": "top-center"
        });
        errorMessage.value = '';
        router.push('/login')

        // Redirect to login after a delay
        // setTimeout(() => {
        //     router.push('/login');
        // }, 3000);
      }
    } catch (err) {
      console.error(err);
      errorMessage.value = err;
    }
};

</script>
  