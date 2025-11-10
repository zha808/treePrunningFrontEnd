<script setup>
import { ref, onMounted, watch } from 'vue'
import { findAllTypes } from '../services/typeAPI.js'
import { findAllStatus } from '../services/statusAPI.js'
import { findAllTrees } from '../services/treeAPI.js'
import { findAllPqrs } from '../services/PQRAPI.js'
import { VueDatePicker } from '@vuepic/vue-datepicker';
import {schedulePruning} from '../services/pruningAPI.js'
import '@vuepic/vue-datepicker/dist/main.css';

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
        id: null,
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
const pruningResponse = ref(null);

function subtractOneDay(dateStr) {
  if (!dateStr) return dateStr
  const parts = String(dateStr).split('-').map(Number)
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  // usar UTC para evitar problemas de zona horaria
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

async function schedulePruningfunction() {

  pruningSelectect();
  applyDefaults();

  errors.value = {}

  if (!correctivePruning.value.type.id) {
    errors.value.type = 'Debe seleccionar un tipo de poda.'
  }
  if (correctivePruning.value.type.name !== 'Correctiva') {
    errors.value.typeName = 'Debe seleccionar un tipo de poda correctiva.'
  }
  if (!correctivePruning.value.plannedDate) {
    errors.value.plannedDate = 'Debe seleccionar una fecha.'
  }
  if (correctivePruning.value.plannedDate < new Date().toISOString().split('T')[0]) {
    errors.value.plannedDateBefore = 'Debe seleccionar una fecha mayor o igual a la fecha actual.'
  }
  if (!correctivePruning.value.status.id) {
    errors.value.status = 'Debe seleccionar un estado.'
  }
  if (correctivePruning.value.status.name != 'Abierta') {
    errors.value.statusName = 'Debe seleccionar estado "Abierta"'
  }
  if (!correctivePruning.value.tree.id) {
    errors.value.tree = 'Debe seleccionar un árbol.'
  }
  if (!correctivePruning.value.pqr.id) {
    errors.value.pqr = 'Debe seleccionar una PQR.'
  }
  if (correctivePruning.value.pqr.status.name !== 'Abierta') {
    errors.value.pqrName = 'Debe seleccionar una con estado "Abierta".'
  }

  if (Object.keys(errors.value).length > 0) {
    //console.log('🚨 Errores encontrados:', errors.value)
    return
  }

  if (correctivePruning.value.plannedDate) {
    correctivePruning.value.plannedDate = subtractOneDay(correctivePruning.value.plannedDate)
  }


  try {

    const respo = await schedulePruning({
      ...correctivePruning.value
    })
    if (respo instanceof Error) {
      alert('Error al programar la poda.\n' + respo.response.data.messages);
      throw respo;

    } else {
      pruningResponse.value = respo;
      alert(respo.messages);
      // Reiniciar el formulario
      correctivePruning.value = {
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
      }
    }
  } catch (error) {
    pruningResponse.value = error.response
  }
}

function applyDefaults() {
  if (typeSelected.value !== 'Correctiva') return

  const t = types.value.find(x => String(x.name).toLowerCase() === ' correctiva') ||
    types.value.find(x => String(x.name).toLowerCase().includes('correctiva'))

    if (t) {
      correctivePruning.value.type.id = t.id
      correctivePruning.value.type.name = t.name
    } else {
      correctivePruning.value.type.id = null
      correctivePruning.value.type.name = 'Correctiva'
    }

    const s = statuses.value.find(x => String(x.name).toLowerCase() === 'abierta') ||
      statuses.value.find(x => String(x.name).toLowerCase().includes('abierta'))

      if (s) {
        correctivePruning.value.status.id = s.id
        correctivePruning.value.status.name = s.name
      } else {
        correctivePruning.value.status.id = null
        correctivePruning.value.status.name = 'Abierta'
      }

}


function formatDate(value) {
  if (value) {
    // Convierte el objeto Date a string AAAA-MM-DD
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate() + 1).padStart(2, '0')
    correctivePruning.value.plannedDate = `${year}-${month}-${day}`
  }
}

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

function pruningSelectect() {
  const typeInitial = statuses.value.find(s => s.name === correctivePruning.value.type.name);
    if (typeInitial) {
      correctivePruning.value.type.name = typeInitial.name;
      correctivePruning.value.type.id = typeInitial.id;
    }

    const statusInitial = statuses.value.find(s => s.name === correctivePruning.value.status.name);
    if (statusInitial) {
      correctivePruning.value.status.name = statusInitial.name;
      correctivePruning.value.status.id = statusInitial.id;
    }
}

watch(typeSelected, (val) => {
  if ( val === 'Correctiva') applyDefaults();
});

onMounted(async () => {
  loadInfo();
})

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
        <label for="plannedDate" class="form-label fw-semibold">Fecha planeada</label>
        <VueDatePicker
          v-model="correctivePruning.plannedDate"
          :enable-time-picker="false"
          @update:model-value="formatDate"
          placeholder="Seleccione una fecha"/>
        <div v-if="errors.plannedDate" class="text-danger small">{{ errors.plannedDate }}</div>
        <div v-else-if="errors.plannedDateBefore" class="text-danger small">{{ errors.plannedDateBefore }}</div>
      </div>
      <div class="mb-3">
        <label for="tree" class="form-label fw-semibold">Árbol</label>
        <select id="tree" v-model="correctivePruning.tree.id" class="form-select">
          <option
            v-for="tree in trees"
            :key="tree.id"
            :value="tree.id"
          >
            {{ tree.family.scientificName }} - {{ tree.sector.name }} - ({{ tree.latitude }}, {{ tree.longitude }})
          </option>
        </select>
        <div v-if="errors.tree" class="text-danger small">{{ errors.tree }}</div>
      </div>

      <div class="mb-3">
        <label for="pqr" class="form-label fw-semibold">PQR</label>
        <select id="pqr" v-model="correctivePruning.pqr" class="form-select">
          <option v-for="pqr in pqrs" :key="pqr.id" :value="pqr">
            {{ pqr.date }} - {{ pqr.sector.name }} - {{ pqr.status.name }}
          </option>
        </select>
        <div v-if="errors.pqr" class="text-danger small">{{ errors.pqr }}</div>
        <div v-else-if="errors.pqrName" class="text-danger small">{{ errors.pqrName }}</div>
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
          Programar
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
