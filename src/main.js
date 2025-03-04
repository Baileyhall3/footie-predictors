import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { userStore } from './store/userStore';
import { supabase } from './api/supabase';
import { hasAuthState, getAuthState } from './utils/authPersistence';

// Initialize the app
const app = createApp(App);
const head = createHead();

// Create a global auth state flag
let authInitialized = false;

// Add a global property to check if auth is initialized
app.config.globalProperties.$authInitialized = () => authInitialized;

// Make auth state available in all components
app.provide('userStore', userStore);

// Use plugins
app.use(head);

// Initialize Supabase auth before mounting the app
async function initializeAuth() {
  try {
    // Check if we have a stored auth state
    const hasStoredAuth = hasAuthState();
    console.log('Has stored auth state:', hasStoredAuth);
    
    // Get the initial session
    const { data } = await supabase.auth.getSession();
    
    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      // Use the userStore's updateAuthState method to update the state
      userStore.updateAuthState(session);
    });
    
    // Set initial auth state via the userStore's init method
    console.log('Initializing auth state');
    await userStore.init();
    
    // Fetch user profile if user is logged in
    if (userStore.user) {
      await userStore.fetchUserProfile();
    }
    
    console.log('User authentication initialized');
    authInitialized = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
    authInitialized = true; // Still mark as initialized to prevent hanging
    return false;
  }
}

// Initialize auth and then mount the app
initializeAuth().then(() => {
  // Add router after auth is initialized
  app.use(router);
  
  // Mount the app
  app.mount('#app');
});
