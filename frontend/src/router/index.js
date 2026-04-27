import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: () => import('../views/WatchlistView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/movies',
      name: 'movies',
      component: () => import('../views/MoviesView.vue'),
    },
    {
      path: '/movies/:id',
      name: 'movie-detail',
      component: () => import('../views/MovieDetailView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('watchlist_token')
  if (to.meta.requiresAuth && !token) return '/login'
  if ((to.name === 'login' || to.name === 'register') && token) return '/watchlist'
})

export default router
