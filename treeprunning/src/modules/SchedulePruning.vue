<script setup>
import { ref, onMounted } from 'vue'
import { findAllTypes } from '../services/typeAPI.js'
import { findAllStatus } from '../services/statusAPI.js'
import { findAllTrees } from '../services/treeAPI.js'
import { findAllPqrs } from '../services/PQRAPI.js'
import { VueDatePicker } from '@vuepic/vue-datepicker';
import {schedulePruning} from '../services/pruningAPI.js'
import '@vuepic/vue-datepicker/dist/main.css';

onMounted(async () => {
  loadInfo();
})

async function loadInfo() {
  try {
    const typesResponse = await findAllTypes();
    types.value  = typesResponse.data;

    const statusesResponse = await findAllStatus();
    statuses.value  = statusesResponse.data;

    const treesResponse = await findAllTrees();
    trees.value  = treesResponse.data;

    const pqrsResponse = await findAllPqrs();
    pqrs.value  = pqrsResponse.data;

  } catch (error) {
    console.error('Error loading info:', error);
  }
}

const attributes = [
  'Tipo',
  'Estado',
  'FechaPlaneado',
  'Arbol',
  'PQR'
]

const correctivePruning = ref({
  status: {
    id: null,
    name: null
  },
  plannedDate: null,
  tree: {
    id: null
  },
  type: {
    id: null,
    name: null
  },
  pqr: {
    id: null,
    status: {
        name: null
      },
  },
  observations: ""
});

const types = ref([]);
const typeSelected = ref('');
const statuses = ref([]);
const trees = ref([]);
const pqrs = ref([]);
const errors = ref([]);

async function schedulePruningfunction() {

  errors.value = {} // Reinicia errores


  if (!correctivePruning.value.type.id) {
    errors.value.type = 'Debe seleccionar un tipo de poda.'
  }
  if (correctivePruning.value.type.name === 'Preventiva') {
    errors.value.type = 'Debe seleccionar un tipo de poda correctiva.'
  }
  if (!correctivePruning.value.plannedDate) {
    errors.value.plannedDate = 'Debe seleccionar una fecha.'
  }
  if (correctivePruning.value.plannedDate < new Date().toISOString().split('T')[0]) {
    errors.value.plannedDate = 'Debe seleccionar una fecha mayor o igual a la fecha actual.'
  }
  if (!correctivePruning.value.status.id) {
    errors.value.status = 'Debe seleccionar un estado.'
  }
  if (correctivePruning.value.status.name !== 'Abierta') {
    errors.value.status = 'Debe seleccionar estado "Abierta".'
  }
  if (!correctivePruning.value.tree.id) {
    errors.value.tree = 'Debe seleccionar un árbol.'
  }
  if (!correctivePruning.value.pqr.id) {
    errors.value.pqr = 'Debe seleccionar una PQR.'
  }
  if (!correctivePruning.value.pqr.status.name !== 'Abierta') {
    errors.value.pqr = 'Debe seleccionar una con estado "Abierta".'
  }


  if (Object.keys(errors.value).length > 0) {
    return
  }

  const formattedDate = new Date(correctivePruning.value.plannedDate)
    .toISOString()
    .split('T')[0]

  console.log('✅ Datos válidos, enviando:', {
    ...correctivePruning.value,
    plannedDate: formattedDate
  })
  console.log('📤 Datos enviados al backend:', correctivePruning.value)
  console.log(schedulePruning(correctivePruning.value));
}




function formatDate(value) {
  if (value) {
    // Convierte el objeto Date a string AAAA-MM-DD
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate())
    correctivePruning.value.plannedDate = `${year}-${month}-${day}`
  }
}


</script>
<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4 fw-bold">Programar Poda</h2>

    <!-- Botones de selección de tipo -->
    <div class="d-flex justify-content-center mb-4 gap-3">
      <button
        class="btn"
        :class="typeSelected === 'Correctiva' ? 'btn-success' : 'btn-outline-success'"
        @click="typeSelected = 'Correctiva'"


      >
        Correctiva
      </button>
      <button
        class="btn"
        :class="typeSelected === 'Preventiva' ? 'btn-success' : 'btn-outline-success'"
        @click="typeSelected = 'Preventiva'"
      >
        Preventiva
      </button>
    </div>

    <!-- Formulario -->
    <div
      v-if="typeSelected === 'Correctiva'"
      class="card shadow-sm border-0 p-4 mx-auto"
      style="max-width: 600px;"
    >

      <div class="mb-3">
        <label for="status" class="form-label fw-semibold">Tipo de poda</label>
        <select id="status" v-model="correctivePruning.type.id" class="form-select">
          <option v-for="type in types" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        <div v-if="errors.type" class="text-danger small">{{ errors.type }}</div>
      </div>

      <div class="mb-3">
        <label for="plannedDate" class="form-label fw-semibold">Fecha planeada</label>
        <VueDatePicker
          v-model="correctivePruning.plannedDate"
          :enable-time-picker="false"
          @update:model-value="formatDate"
          placeholder="Seleccione una fecha"/>
        <div v-if="errors.plannedDate" class="text-danger small">{{ errors.plannedDate }}</div>
      </div>

      <div class="mb-3">
        <label for="status" class="form-label fw-semibold">Estado</label>
        <select id="status" v-model="correctivePruning.status.id" class="form-select">
          <option v-for="status in statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
        <div v-if="errors.status" class="text-danger small">{{ errors.status }}</div>
      </div>

      <div class="mb-3">
        <label for="tree" class="form-label fw-semibold">Árbol</label>
        <select id="tree" v-model="correctivePruning.tree.id" class="form-select">
          <option
            v-for="tree in trees"
            :key="tree.id"
            :value="tree.id"
          >
            {{ tree.family.scientificName }} - ({{ tree.family.commonName }}) - {{ tree.sector.name }}
          </option>
        </select>
        <div v-if="errors.tree" class="text-danger small">{{ errors.tree }}</div>
      </div>

      <div class="mb-3">
        <label for="pqr" class="form-label fw-semibold">PQR</label>
        <select id="pqr" v-model="correctivePruning.pqr.id" class="form-select">
          <option v-for="pqr in pqrs" :key="pqr.id" :value="pqr.id">
            {{ pqr.date }} - {{ pqr.sector.name }}
          </option>
        </select>
        <div v-if="errors.pqr" class="text-danger small">{{ errors.pqr }}</div>
      </div>

      <div class="mb-3">
        <label for="observations" class="form-label fw-semibold">Observaciones</label>
        <textarea
          id="observations"
          v-model="correctivePruning.observations"
          class="form-control"
          rows="3"
          placeholder="Escriba observaciones adicionales..."
        ></textarea>
      </div>

      <div class="text-end mt-4">
        <button class="btn btn-success px-4 fw-bold" @click="schedulePruningfunction">
          Programar Poda Correctiva
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  color: #2f4f4f;
  letter-spacing: 0.5px;
}
.card {
  background-color: #f8f9fa;
  border-radius: 15px;
}
button {
  transition: all 0.3s ease;
}
button:hover {
  transform: scale(1.03);
}
</style>
