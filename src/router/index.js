import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';
import CreateGroup from '../pages/CreateGroup.vue';
import Groups from '../pages/Groups.vue';
import Group from '../pages/Group.vue';
import Predictions from '../pages/Predictions.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'Footie Predictors'
      }
    },
    {
      path: '/groups',
      name: 'Groups',
      component: Groups,
      meta: {
        title: 'Groups - Footie Predictors'
      }
    },
    {
      path: '/group',
      name: 'Group',
      component: Group,
      meta: {
        title: 'Group - Footie Predictors'
      }
    },
    {
      path: '/predictions',
      name: 'Predictions',
      component: Predictions,
      meta: {
        title: 'Predictions - Footie Predictors'
      }
    },
    {
      path: '/create-group',
      name: 'Create Group',
      component: CreateGroup,
      meta: {
        title: 'Create Group - Footie Predictors'
      }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'smooth' }; // Scrolls to top with smooth animation
  }
})

// Update page title for SEO
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Freelance Web Pro'
  next()
})

export default router
