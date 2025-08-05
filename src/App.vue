<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Loading Screen -->
    <LoadingScreen v-if="isLoading"/>
    
    <!-- Main App Content -->
    <template v-else>
      <Header
        headerTitle="Footie Predictors"
      />
      <!-- Background Blur -->
      <div v-if="mobileNavControls.isOpen" class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-40" @click="mobileNavControls.close"></div>

      <transition name="fade">
        <router-view v-if="isVisible" />
      </transition>
    </template>
  </div>
  <Analytics mode="production" />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Header from "./components/Header.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import mobileNavControls from './shared';
import { userStore } from './store/userStore';
import { footballApiService } from "./api/footballApiService";
import { groupsStore } from "./store/groupsStore";
import { Analytics } from '@vercel/analytics/vue';

const isVisible = ref(false);
const authInitialized = ref(false);

// Computed property to determine if we should show the loading screen
const isLoading = computed(() => {
  // Show loading if auth is not initialized or content is not visible yet
  return !authInitialized.value || !isVisible.value;
});

onMounted(async () => {
  try {
    console.log('App mounted, checking auth state...');
    
    // Check if auth is already initialized
    const checkAuth = () => {
      // We can use isAuthenticated which is a computed property
      // that will be true if user is not null
      const authStateResolved = userStore.isAuthenticated || 
                               (userStore.user === null && userStore.session === null);
      
      if (authStateResolved) {
        console.log('Auth state resolved:', userStore.isAuthenticated ? 'Authenticated' : 'Not authenticated');
        authInitialized.value = true;
      } else {
        console.log('Waiting for auth state to resolve...');
        setTimeout(checkAuth, 100);
      }
    };
    
    // Start checking auth state
    checkAuth();

    await groupsStore.fetchUserGroups();
    
    // Make content visible with a slight delay for smoother transitions
    setTimeout(() => {
      isVisible.value = true;
      // footballApiService.updateMatchScores();
    }, 300);
  } catch (error) {
    console.error('Error initializing app:', error);
    // In case of error, still show the app to avoid blank screen
    authInitialized.value = true;
    isVisible.value = true;
  }
});

</script>

<style>
.fade-enter-active {
  transition: opacity 1s ease-out;
}
.fade-enter-from {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
</style>
