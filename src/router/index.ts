import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { pinia } from '../stores/pinia'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/HomeView.vue'),
    },
    {
      path: '/post/:id',
      name: 'post-detail',
      component: () => import('../views/post/PostDetailView.vue'),
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('../views/games/GamesView.vue'),
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/messages/MessagesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('../views/publish/PublishView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  const authStore = useAuthStore(pinia)
  if (authStore.isAuthenticated) {
    return true
  }

  authStore.openAuthModal({
    name: to.name,
    params: to.params,
    query: to.query,
  })

  return false
})

export default router
