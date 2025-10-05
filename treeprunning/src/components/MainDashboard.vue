<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <h2 class="logo">Tree Pruning</h2>
      <nav>
        <ul>
          <li :class="{ active: activeModule === 'Administracion' }" @click="activeModule = 'Administracion'">
            Administracion
          </li>
          <li :class="{ active: activeModule === 'Podas' }" @click="activeModule = 'Podas'">
            Podas
          </li>
          <li :class="{ active: activeModule === 'PQR' }" @click="activeModule = 'PQR'">
            PQR
          </li>
          <li :class="{ active: activeModule === 'Reportes' }" @click="activeModule = 'Reportes'">
            Reportes
          </li>
        </ul>
      </nav>
    </aside>
    <main class="main-content">
      <h1>{{ activeModule }}</h1>
      <div class="module-content">
        <p>Contenido de {{ activeModule }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeModule = ref('Administracion')
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #181818;
  color: #fff;
}
.sidebar {
  width: 220px;
  background: #111;
  padding: 32px 0 0 0;
  display: flex;
  flex-direction: column;

  border-right: 1px solid #222;
  min-height: 100vh;
}
.logo {
  color: #42b983;
  font-size: 1.5rem;
  margin-bottom: 40px;
  letter-spacing: 1px;
  text-align: center;
}
nav ul {
  list-style: none;
  padding: 0;
  width: 100%;
}
nav li {
  padding: 16px 32px;
  cursor: pointer;
  color: #fff;
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s;
}
nav li.active,
nav li:hover {
  background: #222;
  color: #42b983;
}
.main-content {
  flex: 1;
  padding: 40px;
  background: #181818;
}
.main-content h1 {
  margin-bottom: 24px;
  color: #42b983;
}
.module-content {
  background: #222;
  border-radius: 8px;
  padding: 24px;
  min-height: 200px;
}
</style>
