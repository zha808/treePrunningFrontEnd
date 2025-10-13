<template>
  <div class="container mt-4">
    <h4 class="mb-3">Administracion de informacion</h4>

    <!-- Selector de entidad -->
    <select v-model="selectedEntity" class="form-select mb-3">
      <option value="usuarios">Usuarios</option>
      <option value="productos">Productos</option>
      <option value="pedidos">Pedidos</option>
    </select>

    <!-- Tabla -->
    <table class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="col in columns" :key="col">
            {{ row[col] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Entidad seleccionada
const selectedEntity = ref('usuarios')

// Datos simulados (mock)
const mockData = {
  usuarios: [
    { id: 1, nombre: 'Ana', email: 'ana@mail.com' },
    { id: 2, nombre: 'Luis', email: 'luis@mail.com' },
    { id: 3, nombre: 'Marta', email: 'marta@mail.com' },
  ],
  productos: [
    { id: 10, nombre: 'Laptop', precio: 1200 },
    { id: 11, nombre: 'Mouse', precio: 25 },
    { id: 12, nombre: 'Teclado', precio: 45 },
  ],
  pedidos: [
    { id: 100, cliente: 'Ana', total: 1300, fecha: '2025-10-09' },
    { id: 101, cliente: 'Luis', total: 25, fecha: '2025-10-08' },
  ],
}

// Columnas y filas reactivas
const columns = ref([])
const data = ref([])

// Función para cargar datos según la entidad seleccionada
const loadData = () => {
  data.value = mockData[selectedEntity.value]
  columns.value = Object.keys(data.value[0])
}

// Cargar datos iniciales
loadData()

// Actualizar cuando cambie la entidad seleccionada
watch(selectedEntity, loadData)
</script>
