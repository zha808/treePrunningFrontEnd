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
  { name: 'Administration', submodules: []},
  { name: 'PruningManagement', submodules: ['SchedulePruning']},
  { name: 'PQR', submodules: []},
  { name: 'Statistics', submodules: []}
])
const router = useRouter()

function logout() {
  router.push('/login')
}

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? null : name
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
          {{ module.name }}
          <span class="float-end">
            <i :class="openMenu === module.name ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </span>
        </button>

        <ul v-if="module.submodules && openMenu === module.name"
        class="nav flex-column ms-3 mt-2">
          <li
            v-for="submodule in module.submodules"
            :key="submodule"
          >
            <button
              class="nav-link text-white fw-normal"
              :class="selected === submodule ? 'btn bg-success w-100' : ' btn bg-secondary w-100'"
              @click="emit('navigate', submodule)"
            >
              {{ submodule }}
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
