import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';

import CreateGroup from '../pages/CreateGroup.vue';
import Groups from '../pages/Groups.vue';
import Group from '../pages/Group.vue';
import UpdateGroup from '../pages/UpdateGroup.vue';
import CreateGameweek from '../pages/CreateGameweek.vue';
import Gameweek from '../pages/Gameweek.vue';
import GameweekPredictions from '../pages/GameweekPredictions.vue';
import AdminUserPredictions from '../pages/AdminUserPredictions.vue';
import AddGameweekMatches from '../pages/AddGameweekMatches.vue';
import AppInfo from '../pages/AppInfo.vue';
import UserStats from '../pages/UserStats.vue';
import GroupStats from '../pages/GroupStats.vue';
import GroupNotifications from '../pages/GroupNotifications.vue';
import GroupAdminView from '../pages/GroupAdminView.vue';

import Predictions from '../pages/Predictions.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import ResetPassword from '../pages/ResetPassword.vue';
import Profile from '../pages/Profile.vue';
import MyUserProfile from '../pages/MyUserProfile.vue';
import AuthTest from '../pages/AuthTest.vue';
import Leaderboards from '../pages/Leaderboards.vue';
import GroupLeaderboards from '../pages/GroupLeaderboards.vue';
import MatchPredictions from '../pages/MatchPredictions.vue';
import UserGameweekPredictions from '../pages/UserGameweekPredictions.vue';
import GroupUserProfile from '../pages/GroupUserProfile.vue';
import CreateSeason from '../pages/CreateSeason.vue';
import UserNotifications from '../pages/UserNotifications.vue';

import Season from '../pages/Season.vue';

import PrivacyPolicy from '../pages/PrivacyPolicy.vue';

import NotFound from '../views/NotFound.vue';

import { userStore } from '../store/userStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: 'Login',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: {
        title: 'Register',
        requiresAuth: false
      }
    },
    {
      path: '/reset-password',
      name: 'Reset Password',
      component: ResetPassword,
      meta: {
        title: 'Reset Password',
        requiresAuth: false
      }
    },
    {
      path: '/privacy-policy',
      name: 'Privacy Policy',
      component: PrivacyPolicy,
      meta: {
        title: 'Privacy Policy',
        requiresAuth: false
      }
    },
    {
      path: '/app-info',
      name: 'App Info',
      component: AppInfo,
      meta: {
        title: 'App Info',
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
        title: 'Groups',
        requiresAuth: true
      }
    },
    {
      path: '/group/:id',
      name: 'Group',
      component: Group,
      meta: {
        title: 'Group',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/leaderboards',
      name: 'GroupLeaderboards',
      component: GroupLeaderboards,
      meta: {
        title: 'Group Leaderboards',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/create-season',
      name: 'GroupCreateSeason',
      component: CreateSeason,
      meta: {
        title: 'Create Season',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/stats',
      name: 'GroupStats',
      component: GroupStats,
      meta: {
        title: 'Group Stats',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/update-group',
      name: 'UpdateGroup',
      component: UpdateGroup,
      meta: {
        title: 'Update Group',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/notifications',
      name: 'GroupNotifications',
      component: GroupNotifications,
      meta: {
        title: 'Group Notifications',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/admin-view',
      name: 'GroupAdminView',
      component: GroupAdminView,
      meta: {
        title: 'Group Admin View',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/season/:id',
      name: 'Season',
      component: Season,
      meta: {
        title: 'Season',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/group/:id/create-gameweek',
      name: 'CreateGameweek',
      component: CreateGameweek,
      meta: {
        title: 'Create Gameweek',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/gameweek/:id',
      name: 'Gameweek',
      component: Gameweek,
      meta: {
        title: 'Gameweek',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/gameweek/:id/add-matches',
      name: 'Gameweek Add Matches',
      component: AddGameweekMatches,
      meta: {
        title: 'Gameweek Add Matches',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/gameweek-predictions/:id',
      name: 'Gameweek Predictions',
      component: GameweekPredictions,
      meta: {
        title: 'Gameweek Predictions',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/match/:id',
      name: 'Match Predictions',
      component: MatchPredictions,
      meta: {
        title: 'Match Predictions',
        requiresAuth: true,
        isGroupContext: true
      }
    },
    {
      path: '/admin-gameweek-predictions/:gameweek_id/:user_id',
      name: 'Admin Gameweek Predictions',
      component: AdminUserPredictions,
      meta: {
        title: 'Admin Gameweek Predictions',
        requiresAuth: true,
        isGroupContext: true
      }
    }, 
    {
      path: '/user-gameweek-predictions/:gameweek_id/:user_id',
      name: 'User Gameweek Predictions',
      component: UserGameweekPredictions,
      meta: {
        title: 'User Gameweek Predictions',
        requiresAuth: true,
        isGroupContext: true
      }
    }, 
    {
      path: '/user-group-profile/:group_id/:user_id',
      name: 'User Group Profile',
      component: GroupUserProfile,
      meta: {
        title: 'User Group Profile',
        requiresAuth: true,
        isGroupContext: true
      }
    }, 
    {
      path: '/predictions',
      name: 'Predictions',
      component: Predictions,
      meta: {
        title: 'Predictions',
        requiresAuth: true
      }
    },
    {
      path: '/leaderboards',
      name: 'Leaderboards',
      component: Leaderboards,
      meta: {
        title: 'Leaderboards',
        requiresAuth: true
      }
    },
    {
      path: '/create-group',
      name: 'Create Group',
      component: CreateGroup,
      meta: {
        title: 'Create Group',
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: MyUserProfile,
      meta: {
        title: 'My Profile',
        requiresAuth: true
      }
    },
    {
      path: '/user-stats',
      name: 'User Stats',
      component: UserStats,
      meta: {
        title: 'User Stats',
        requiresAuth: true
      }
    },
    {
      path: '/auth-test',
      name: 'AuthTest',
      component: AuthTest,
      meta: {
        title: 'Auth Test',
        requiresAuth: true
      }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: UserNotifications,
      meta: {
        title: 'Notifications',
        requiresAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*', // MUST be last in list
      name: 'NotFound',
      component: NotFound,
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

router.beforeEach((to, from, next) => {
  // SEO
  document.title = to.meta.title || 'Footie Predictors'

  // Allow router to render while auth initializes
  if (!userStore.authReady) {
    return next()
  }

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  const isAuthenticated = userStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (
    (to.path === '/login' || to.path === '/register') &&
    isAuthenticated
  ) {
    return next('/')
  }

  next()
})

export default router
