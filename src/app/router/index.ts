import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Feed',
    component: () => import('@/pages/home/FeedPage.vue')
  },
  {
    path: '/shorts',
    name: 'ShortForm',
    component: () => import('@/pages/short-form/ShortFormPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
