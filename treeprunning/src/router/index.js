import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import MainPage from '../views/MainPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/main', component: MainPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
