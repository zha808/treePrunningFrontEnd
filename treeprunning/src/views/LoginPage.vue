<template>
  <Login @login-success="onLoginSuccess" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import Login from '../components/Login.vue'

const router = useRouter()
function onLoginSuccess() {
  router.push('/main')
}
</script>
