<template>
  <div class="main-layout">

    <div class="">
      <div class=" flex-grow-1">
        <Navbar @toggleSidebar="toggleSidebar" />
        <div class="">
          <router-view />
        </div>
      </div>
      <Sidebar class="d-flex" :selected="currentModule" :show="isSidebarVisible" @navigate="currentModule = $event" />

    </div>
    <component :is="currentModuleComponent" class="module-content" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import Administration from '../modules/Administration.vue'
import PruningManagement from '../modules/PruningManagement.vue'
import PQR from '../modules/PQR.vue'
import Statistics from '../modules/Statistics.vue'

const currentModule = ref('Administration')
const isSidebarVisible = ref(true)
function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

const modules = {
  Administration,
  PruningManagement,
  PQR,
  Statistics
}

const currentModuleComponent = computed(() => modules[currentModule.value])
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
}
.module-content {
  flex: 1;
  padding: 24px;
}
.flex-grow-1 {
  height: 4%;
}
</style>
