import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { userStore } from './store/userStore';
import { supabase } from './api/supabase';
import { hasAuthState, getAuthState } from './utils/authPersistence';
import VueToastify from "vue3-toastify";
import PrimeVue from 'primevue/config';
import DatePicker from 'primevue/datepicker';
import '@primevue/themes/aura'
import 'primeicons/primeicons.css';


// Initialize the app
const app = createApp(App);
const head = createHead();

// Create a global auth state flagd
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
    // Set initial auth state via the userStore's init method
    await userStore.init();
    
    authInitialized = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
    authInitialized = true; // Still mark as initialized to prevent hanging
    return false;
  }
}
app.use(VueToastify, {
  position: "top-center",
  duration: 3000,
  theme: "light",
});
app.use(PrimeVue, {
  ripple: true,
  unstyled: false
});
app.component('DatePicker', DatePicker);

// Initialize auth and then mount the app
initializeAuth().then(() => {
  // Add router after auth is initialized
  app.use(router);
  
  // Mount the app
  app.mount('#app');
});
