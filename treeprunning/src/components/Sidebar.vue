<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  show: Boolean
})

const emit = defineEmits(['navigate'])
const openMenu = ref(null)
const selected = ref(null)

const modules = ref([
  { name: 'Administration', label: 'Administración', submodules: []},
  { name: 'PruningManagement', label: 'Gestión de Podas', submodules: [{ name: 'SchedulePruning', label: 'Programar Poda' }]},
  { name: 'PQR', label: 'PQR', submodules: [{ name: 'PQR', label: 'Generar PQR' }]},
  { name: 'Statistics', label: 'Estadísticas', submodules: []}
])
const router = useRouter()

function logout() {
  router.push('/login')
}

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? null : name
  // marcar seleccionado cuando no hay submódulos y se quiere navegar por módulo
  const module = modules.value.find(m => m.name === name)
  if (module && (!module.submodules || module.submodules.length === 0)) {
    selected.value = name
    emit('navigate', name)
  }
}

function onSubmoduleClick(subName) {
  selected.value = subName
  emit('navigate', subName)
}
</script>

<template>

  <div class="d-flex flex-column bg-dark text-white p-3" :class="['sidebar', { 'd-none': !show }]" style="width: 250px;">

    <div class="text-center mb-4">
      <router-link to="/main">
        <img
          src="@/assets/main_icon.png"
          alt="Tree Prunning Logo"
          class="img-fluid rounded-3 mb-2"
          style="max-width: 120px;"
        />
      </router-link>
    </div>
    <!-- Navegación -->
    <ul class="nav nav-pills mb-auto flex-column d-grip gap-2 ">
      <li
        v-for="module in modules"
        :key="module.name"
        class="nav-item"
      >
        <button
          :class="[
            'nav-link text-white fw-bold',
            selected === module.name ? 'btn bg-success w-100' : ' btn bg-secondary w-100'
          ]"
          @click="toggleMenu(module.name)"
        >
          {{ module.label }}
          <span class="float-end" v-if="module.submodules && module.submodules.length">
            <i :class="openMenu === module.name ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </span>
        </button>

        <ul v-if="module.submodules && openMenu === module.name"
        class="nav flex-column ms-3 mt-2">
          <li
            v-for="submodule in module.submodules"
            :key="submodule.name"
          >
            <button
              class="nav-link text-white fw-normal"
              :class="selected === submodule.name ? 'btn bg-success w-100' : ' btn bg-secondary w-100'"
              @click="onSubmoduleClick(submodule.name)"
            >
              {{ submodule.label }}
            </button>
          </li>
          </ul>
      </li>
</ul>

  <!-- Botón de cierre de sesión -->
    <div class="mt-auto">
      <button class="btn btn-danger w-100 fw-bold" @click="logout">
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  height: 96%;
  transition: all 0.3s ease;
}
</style>
