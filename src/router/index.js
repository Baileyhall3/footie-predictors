import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';
import CreateGroup from '../pages/CreateGroup.vue';
import Groups from '../pages/Groups.vue';
import Group from '../pages/Group.vue';
import Predictions from '../pages/Predictions.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Profile from '../pages/Profile.vue';
import AuthTest from '../pages/AuthTest.vue';
import { userStore } from '../store/userStore';
import { hasAuthState } from '../utils/authPersistence';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: 'Login - Footie Predictors',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: {
        title: 'Register - Footie Predictors',
        requiresAuth: false
      }
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'Footie Predictors',
        requiresAuth: true
      }
    },
    {
      path: '/groups',
      name: 'Groups',
      component: Groups,
      meta: {
        title: 'Groups - Footie Predictors',
        requiresAuth: true
      }
    },
    {
      path: '/group/:id',
      name: 'Group',
      component: Group,
      meta: {
        title: 'Group - Footie Predictors',
        requiresAuth: true
      }
    },    
    {
      path: '/predictions',
      name: 'Predictions',
      component: Predictions,
      meta: {
        title: 'Predictions - Footie Predictors',
        requiresAuth: true
      }
    },
    {
      path: '/create-group',
      name: 'Create Group',
      component: CreateGroup,
      meta: {
        title: 'Create Group - Footie Predictors',
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        title: 'My Profile - Footie Predictors',
        requiresAuth: true
      }
    },
    {
      path: '/auth-test',
      name: 'AuthTest',
      component: AuthTest,
      meta: {
        title: 'Auth Test - Footie Predictors',
        requiresAuth: true
      }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'smooth' }; // Scrolls to top with smooth animation
  }
})

// Global navigation guard for authentication and SEO
router.beforeEach(async (to, from, next) => {
  // Update page title for SEO
  document.title = to.meta.title || 'Footie Predictors'
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = userStore.isAuthenticated
  
  // Handle authentication requirements
  if (requiresAuth && !isAuthenticated) {
    // If the user is not authenticated and the route requires auth, redirect to login
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // If the user is authenticated and tries to access login/register pages, redirect to home
    next('/')
  } else {
    // Otherwise proceed as normal
    next()
  }
})

// Handle page reloads and direct URL access
// This ensures the auth state is properly restored from localStorage/cookies
router.beforeResolve((to, from, next) => {
  // If this is an initial page load (from is an empty route)
  if (from.name === null && to.name !== null) {
    // Check if we have a session in localStorage
    const hasSession = hasAuthState()
    
    // If we have a session but the user is not loaded yet, wait for auth to initialize
    if (hasSession && !userStore.user) {
      console.log('Waiting for auth to initialize...')
      
      // Poll for auth initialization
      const checkAuth = () => {
        if (userStore.user) {
          // Auth is initialized and user is loaded
          console.log('Auth initialized, proceeding with navigation')
          next()
        } else {
          // Check again in a short while
          setTimeout(checkAuth, 50)
        }
      }
      
      checkAuth()
    } else {
      // Either no session or user is already loaded, proceed normally
      next()
    }
  } else {
    // Not an initial page load, proceed normally
    next()
  }
})

export default router
