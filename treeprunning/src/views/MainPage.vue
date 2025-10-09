<template>
  <div class="main-layout">
    <Sidebar :selected="currentModule" @navigate="currentModule = $event" />
    <component :is="currentModuleComponent" class="module-content" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Administration from '../modules/Administration.vue'
import PruningManagement from '../modules/PruningManagement.vue'
import PQR from '../modules/PQR.vue'
import Statistics from '../modules/Statistics.vue'

const currentModule = ref('Administration')

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
  min-width: 100%;
  display: flex;
  height: 100vh;
}
.module-content {
  flex: 1;
  padding: 24px;
}
</style>
