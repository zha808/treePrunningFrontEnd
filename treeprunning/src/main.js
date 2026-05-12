import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap-icons/font/bootstrap-icons.css'
import authService from './services/authService'

authService.init({ onLoad: 'login-required', checkLoginIframe: false }).then((authenticated) => {
  console.log('Authenticated:', authenticated)

  const app = createApp(App)

  app.use(router)
  app.use(BootstrapVue3)

  // Expose both the raw keycloak instance (for compatibility) and the auth service
  app.config.globalProperties.$keycloak = authService.rawKeycloak
  app.config.globalProperties.$auth = authService

  // opcional usando provide/inject
  app.provide('keycloak', authService.rawKeycloak)
  app.provide('auth', authService)

  app.mount('#app')

}).catch((error) => {
  console.error('Auth init error', error)
})