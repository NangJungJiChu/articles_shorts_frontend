import { createRouter, createWebHistory } from 'vue-router'
import { HomePage } from '@/pages/home/ui'
import { ShortsPage } from '@/pages/shorts/ui'
import { ProfilePage } from '@/pages/profile/ui'
import { LoginPage } from '@/pages/login/ui'
import { SignupPage } from '@/pages/signup/ui'
import { CreatePage } from '@/pages/create/ui'
import { SearchPage } from '@/pages/search/ui'

// ============================================
// Routes
// ============================================

const routes = [
  // Public
  { path: '/login', name: 'login', component: LoginPage, meta: { requiresAuth: false } },
  { path: '/signup', name: 'signup', component: SignupPage, meta: { requiresAuth: false } },
  // Protected
  { path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/shorts', name: 'shorts', component: ShortsPage, meta: { requiresAuth: true } },
  { path: '/create', name: 'create', component: CreatePage, meta: { requiresAuth: true } },
  { path: '/search', name: 'search', component: SearchPage, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/posts/:id', name: 'post-detail', component: () => import('@/pages/post-detail/ui').then(m => m.PostDetailPage), meta: { requiresAuth: true } },
]

// ============================================
// Router
// ============================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ============================================
// Auth Utilities
// ============================================

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
} as const

const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS)
  return !!accessToken
}

// Auth Guard
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false
  const authenticated = isAuthenticated()

  if (requiresAuth && !authenticated) {
    return next('/login')
  }

  if (!requiresAuth && authenticated) {
    return next('/')
  }

  next()
})

export default router
