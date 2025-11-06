<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import MapModal from '../components/MapModal.vue'
import { findAllTypes } from '../services/typeAPI.js'
import { findAllStatus } from '../services/statusAPI.js'

const attributes = [
  'Tipo',
  'Estado',
  'FechaPlaneado',
  'Arbol',
  'Cuadrilla',
  'PQR'
]

const types = ref([]);
const typeSelected = ref('');

const loading = ref(true);

const columns = ref([...attributes])

// Editor modal
const showEditor = ref(false)
const editorRow = reactive({})
const originalIndex = ref(-1)

watch(showEditor, (v) => {
  // ensure editorRow has keys when modal opens
  if (v && Object.keys(editorRow).length === 0) {
    for (const k of columns.value) editorRow[k] = ''
  }
})

async function loadTypes() {
  try {
    const response = await findAllStatus();

    types.value  = response.data;
    console.log('Loaded types:', types.value);
  } catch (error) {
    console.error('Error loading statuses:', error);
  } finally {
    loading.value = false;
  }
}

function openEditor(row) {
  if (row) {
    //originalIndex.value = data.value.findIndex(r => r.id === row.id)
    //const src = data.value[originalIndex.value] ?? row
    // copy values
    //for (const k of columns.value) editorRow[k] = src[k] ?? ''
  } else {
    originalIndex.value = -1
    for (const k of columns.value) editorRow[k] = (k === 'id' ? null : '')
  }
  showEditor.value = true
}

function closeEditor() {
  showEditor.value = false
}

function saveEdit() {
  // prepare payload
  const payload = {}
  for (const k of columns.value) payload[k] = editorRow[k]

  if (originalIndex.value >= 0) {
    // update
    //data.value[originalIndex.value] = { ...payload }
  } else {
    // create new id
    //payload.id = (Math.max(0, ...data.value.map(d => d.id ?? 0)) + 1)
    //data.value.push(payload)
  }
  showEditor.value = false
}

function fieldType(col) {
  const lc = col.toLowerCase()
  if (lc.includes('fecha')) return 'date'
  if (lc.includes('foto') || lc.includes('registro')) return 'url'
  if (lc === 'id') return 'number'
  return 'text'
}

// Tree modal state
const showTreeModal = ref(false)
const treeModal = reactive({ id: null, species: '', sector: '', lat: null, lng: null })


function closeTreeModal() {
  showTreeModal.value = false
}

onMounted(() => {
  loadTypes();
})
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4 class="m-0">Administración de podas</h4>
      <div class="mb-3 d-flex align-items-center gap-3">
        <div style="flex:1">
          <label class="form-label">Tipos</label>
          <select v-model="typeSelected" class="form-select">
            <option value="" disabled selected hidden>Seleccione un tipo</option>
            <option v-for="type in types" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
      </div>

      <div>
        <button class="btn btn-success me-2" @click="openEditor(null)">Programar poda</button>
      </div>
    </div>

    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
          <th style="width:200px">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in data" :key="row.id ?? idx">
          <td v-for="col in columns" :key="col">
            <template v-if="col === 'arbol'">
              <button class="link-button" @click="openTree(row)">{{ row[col] }}</button>
            </template>
            <template v-else>
              {{ row[col] }}
            </template>
          </td>
          <td>
            <button class="btn btn-sm btn-primary me-2" @click="openEditor(row)">Editar</button>
            <button class="btn btn-sm btn-danger" @click="deleteRow(row)">Borrar</button>
          </td>
        </tr>

      </tbody>
    </table>

    <!-- Editor modal (overlay) -->
    <div v-if="showEditor" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header d-flex justify-content-between align-items-center mb-2">
          <h5 class="m-0">{{ originalIndex >= 0 ? 'Editar poda' : 'Programar poda' }}</h5>
          <button class="btn-close" @click="closeEditor"></button>
        </div>

        <form @submit.prevent="saveEdit">
          <div class="row g-2">
            <div class="col-12 col-md-6" v-for="col in columns" :key="col">
              <label class="form-label">{{ col }}</label>
              <input
                v-model="editorRow[col]"
                :type="fieldType(col)"
                class="form-control"
                :readonly="col === 'id'"
              />
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button type="button" class="btn btn-secondary me-2" @click="closeEditor">Cancelar</button>
            <button type="submit" class="btn btn-success">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tree info + map modal (replaced to show full info then map below) -->
    <div v-if="showTreeModal" class="modal-backdrop" @click.self="closeTreeModal">
      <div class="modal-card" style="max-width:900px; width:100%;">
        <div class="modal-header d-flex justify-content-between align-items-center mb-2">
          <h5 class="m-0">Detalle del árbol</h5>
          <button class="btn-close" @click="closeTreeModal"></button>
        </div>

        <!-- Full information block -->
        <div class="tree-info mb-3">
          <div class="row">
            <div class="col-12 col-md-6 mb-2">
              <strong>ID:</strong>
              <div>{{ treeModal.id ?? '-' }}</div>
            </div>
            <div class="col-12 col-md-6 mb-2">
              <strong>Especie:</strong>
              <div>{{ treeModal.species || '-' }}</div>
            </div>
            <div class="col-12 col-md-6 mb-2">
              <strong>Sector:</strong>
              <div style="white-space:pre-wrap;">{{ treeModal.sector || '-' }}</div>
            </div>
            <div class="col-12 col-md-6 mb-2">
              <strong>Longitud:</strong>
              <div>{{ treeModal.lng ?? '-' }}</div>
            </div>
            <div class="col-12 col-md-6 mb-2">
              <strong>Latitud:</strong>
              <div>{{ treeModal.lat ?? '-' }}</div>
            </div>
          </div>

          <!-- Si tienes más propiedades en el objeto tree, muestra dinámicamente -->
          <div v-if="treeModal.extra && Object.keys(treeModal.extra).length" class="mt-2">
            <h6>Otros atributos</h6>
            <dl>
              <template v-for="(v,k) in treeModal.extra" :key="k">
                <dt style="font-weight:600">{{ k }}</dt>
                <dd style="margin-left:0">{{ v }}</dd>
              </template>
            </dl>
          </div>
        </div>

        <!-- Mapa debajo -->
        <div>
          <MapModal :lat="treeModal.lat" :lng="treeModal.lng" :title="treeModal.species" />
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-secondary" @click="closeTreeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  z-index: 1050;
  padding: 16px;
}

.modal-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}
.link-button {
  background: none;
  border: none;
  color: #0d6efd;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1em;
}
.link-button:hover {
  color: #0b5ed7;
}
.tree-info dt { font-size: 0.95rem; margin-top: .5rem; }
.tree-info dd { margin: 0 0 0.5rem 0; color: #333; }
</style>
