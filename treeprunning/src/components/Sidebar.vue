<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  selected: String
})
const modules = ['Administration', 'PruningManagement', 'PQR', 'Statistics']
const router = useRouter()

function logout() {
  // Add your logout logic here (e.g., clear tokens, etc.)
  router.push('/login')
}
</script>

<template>
  <nav class="sidebar">
    <ul>
      <li class="logo">
        <router-link to="/main">
          <img src="@/assets/main_icon.png" alt="Tree Prunning Logo" width="150" />
        </router-link>
      </li>
      <li
        v-for="module in modules"
        :key="module"
        :class="{ active: selected === module }"
        @click="$emit('navigate', module)"
      >
        {{ module }}
      </li>
    </ul>
    <button class="logout-btn" @click="logout">Cerrar sesion</button>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #2c3e50;
  color: #fff;
  padding: 24px 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  padding: 16px 24px;
  cursor: pointer;
  transition: background 0.2s;
}
.sidebar li.logo {
  padding: 0 24px 24px 24px;
  text-align: center;
  cursor: default;
}
.sidebar li.logo img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 10%;
  transition: transform 0.3s ease;
}
.sidebar li.logo img:hover {
  transform: scale(1.05);
}
.sidebar li:hover:not(.logo) {
  background: #34495e;
}
.sidebar li.active {
  background: #1abc9c;
  color: #fff;
  font-weight: bold;
}
.logout-btn {
  margin: 24px;
  padding: 12px 0;
  width: calc(100% - 48px);
  background: #b81f0e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #e02c18;
}
</style>
