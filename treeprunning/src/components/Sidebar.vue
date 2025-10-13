<script setup>
import { useRouter } from 'vue-router'

defineProps({
  show: Boolean,
  selected: String
})

const emit = defineEmits(['navigate'])

const modules = ['Administration', 'PruningManagement', 'PQR', 'Statistics']
const router = useRouter()

function logout() {
  // Aquí va tu lógica de logout (limpiar token, etc.)
  router.push('/login')
}
</script>

<template>

  <div class="d-flex flex-column bg-dark text-white p-3" :class="['sidebar', { 'd-none': !show }]" style="width: 250px;">
    <!-- Logo -->

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
        :key="module"
        class="nav-item"
      >
        <button
          :class="[
            'nav-link text-white fw-bold',
            selected === module ? 'btn bg-success w-100' : ' btn bg-secondary w-100'
          ]"
          @click="emit('navigate', module)"
        >
          {{ module }}
        </button>
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
