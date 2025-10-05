<template>
  <div class="login">
    <h2>Tree Pruning</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Usuario:</label>
        <input id="username" v-model="username" type="text" required />
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit">Entrar</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
defineOptions({ name: 'UserLogin' })
import { ref } from 'vue'
const emit = defineEmits(['login-success'])

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  if (username.value === '' || password.value === '') {
    error.value = 'Por favor, completa todos los campos.'
    return
  }
  // Aquí iría la lógica real de autenticación
  error.value = ''
  emit('login-success')
}
</script>

<style scoped>
.login {
  max-width: 350px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #222;
  border-radius: 8px;
  background: #111;
  color: #fff;
}
.login h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
}
.login label {
  display: block;
  margin-bottom: 6px;
  color: #fff;
}
.login input {
  width: 100%;
  padding: 8px;
  margin-bottom: 14px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #222;
  color: #fff;
}
.login input:focus {
  outline: none;
  border-color: #42b983;
}
.login button {
  width: 100%;
  padding: 10px;
  background: #222;
  color: #42b983;
  border: 1px solid #42b983;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.login button:hover {
  background: #42b983;
  color: #111;
}
.login .error {
  color: #ff5252;
  margin-top: 10px;
  text-align: center;
}
</style>
