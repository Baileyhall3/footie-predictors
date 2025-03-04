<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div class="bg-gradient-to-r from-green-600 to-green-800 px-6 py-8 text-white">
        <h1 class="text-3xl font-bold">Authentication Test</h1>
        <p class="mt-2 text-green-100">
          This page tests authentication persistence across page refreshes
        </p>
      </div>

      <div class="p-6">
        <div v-if="userStore.loading" class="flex justify-center py-8">
          <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else>
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Authentication State</h2>
            <div class="bg-gray-100 p-4 rounded">
              <p><span class="font-medium">Is Authenticated:</span> {{ userStore.isAuthenticated ? 'Yes' : 'No' }}</p>
              <p v-if="userStore.user"><span class="font-medium">User ID:</span> {{ userStore.user.id }}</p>
              <p v-if="userStore.user"><span class="font-medium">Email:</span> {{ userStore.user.email }}</p>
              <p v-if="userStore.userProfile"><span class="font-medium">Username:</span> {{ userStore.userProfile.username }}</p>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Local Storage</h2>
            <div class="bg-gray-100 p-4 rounded">
              <p><span class="font-medium">Has Auth State:</span> {{ hasStoredAuth ? 'Yes' : 'No' }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <button 
              @click="refreshPage" 
              class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Refresh Page
            </button>
            
            <button 
              v-if="userStore.isAuthenticated"
              @click="handleLogout" 
              class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Sign Out
            </button>
            
            <router-link 
              v-else
              to="/login" 
              class="block w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-center"
            >
              Sign In
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../store/userStore'
import { hasAuthState } from '../utils/authPersistence'

export default {
  name: 'AuthTestPage',
  setup() {
    const router = useRouter()
    const hasStoredAuth = ref(false)

    onMounted(() => {
      // Check if we have a stored auth state
      hasStoredAuth.value = hasAuthState()
    })

    const handleLogout = async () => {
      await userStore.signOut()
      router.push('/login')
    }

    const refreshPage = () => {
      window.location.reload()
    }

    return {
      userStore,
      hasStoredAuth,
      handleLogout,
      refreshPage
    }
  }
}
</script>
