import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue';
import About from '../pages/About.vue';
import Contact from '../pages/Contact.vue';

import Shirts from '../pages/categories/Shirts.vue';
import Sweats from '../pages/categories/Sweats.vue';
import Accessories from '../pages/categories/Accessories.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'Irrelevant Clothing'
      }
    },
    {
      path: '/about',
      name: 'About',
      component: About,
      meta: {
        title: 'About Us - Freelance Web Pro'
      }
    },
    {
      path: '/shirts',
      name: 'T-Shirts',
      component: Shirts,
      meta: {
        title: 'T-Shirts - Irrelevant Clothing'
      }
    },
    {
      path: '/sweats',
      component: Sweats,
      meta: {
        title: 'Sweatshirts - Irrelevant Clothing'
      }
    },
    {
      path: '/accessories',
      component: Accessories,
      meta: {
        title: 'Accessories - Irrelevant Clothing'
      }
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact,
      meta: {
        title: 'Contact Us - Freelance Web Pro'
      }
    }
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
