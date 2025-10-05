<script setup>
import { ref } from 'vue'
import MainDashboard from './components/MainDashboard.vue'
import Login from './components/Login.vue'

const isAuthenticated = ref(false)

function onLoginSuccess() {
  isAuthenticated.value = true
}
</script>

<template>
    <header v-if="!isAuthenticated">
      <div class="wrapper">
        <HelloWorld msg="Michi!" />
      </div>
    </header>

  <main>
    <Login v-if="!isAuthenticated" @login-success="onLoginSuccess" />
    <MainDashboard v-else />
  </main>
</template>

<style scoped>

</style>
