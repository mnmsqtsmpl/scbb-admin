import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import MainLayout from '../layouts/MainLayout.vue'
import Operators from '../pages/Operators.vue'
import OperatorDetail from '../pages/OperatorDetail.vue' 
import Users from '../pages/Users.vue'
import Settings from '../pages/Settings.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/operators' },
      { path: 'operators', component: Operators },
      { path: 'operators/:uid', component: OperatorDetail },
      { path: 'users', component: Users },
      { path: 'settings', component: Settings },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  // check parent meta as well
  const requiresAuth = to.matched.some((m) => m.meta && m.meta.requiresAuth)
  if (requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }
  next()
})

export default router
