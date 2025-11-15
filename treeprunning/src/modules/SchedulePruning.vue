<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { findAllTypes } from '../services/typeAPI.js'
import { findAllStatus } from '../services/statusAPI.js'
import { findAllTrees } from '../services/treeAPI.js'
import { findAllPqrs } from '../services/PQRAPI.js'
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { schedulePruning, schedulePreventivePruning, findAllPrunings, completePruning } from '../services/pruningAPI.js'
import { findAllQuadrilles } from '../services/quadrilleAPI.js'
import '@vuepic/vue-datepicker/dist/main.css';

const attributes = [
  'Tipo',
  'Estado',
  'FechaPlaneada',
  'LatitudÁrbol',
  'LongitudÁrbol',
  'Cuadrilla',
  'Fecha PQR',
  'Estado PQR',
  'RegistroFotográfico',
  'Observaciones'
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
const errors = ref({}) // antes era ref([])
const pruningResponse = ref(null);
const pruningsResponse = ref([]);
const quadrilles = ref([]);

// execution modal state
const showExecutionModal = ref(false)
const executionForm = reactive({
  pruningId: null,
  typeName: '',
  statusName: '',
  plannedDate: null,
  executedDate: null,
  quadrilleId: null,
  observations: '',
  existingPhotos: [], // urls/paths from pruning
  newFiles: [] // File objects
})

// usa el ref 'quadrilles' que carga loadInfo() desde findAllQuadrilles()
// (El computed anterior fue eliminado para no depender de pruningsResponse)

// open modal prefilled
function openExecution(pruning) {
  executionForm.pruningId = pruning.id
  executionForm.typeName = pruning.type?.name ?? ''
  executionForm.statusName = pruning.status?.name ?? ''
  executionForm.plannedDate = pruning.plannedDate ?? null
  executionForm.executedDate = new Date().toISOString().split('T')[0] // default today
  executionForm.quadrilleId = pruning.quadrille?.id ?? (quadrilles.value[0]?.id ?? null)
  executionForm.observations = pruning.observations ?? ''
  executionForm.existingPhotos = []
  // collect existing photo paths if present
  if (Array.isArray(pruning.photoRecords) && pruning.photoRecords.length) {
    executionForm.existingPhotos = pruning.photoRecords.map(pr => pr.url ?? pr.path).filter(Boolean)
  } else if (pruning.photographicRecordPath) {
    executionForm.existingPhotos = [pruning.photographicRecordPath]
  }
  executionForm.newFiles = []
  showExecutionModal.value = true
}

// file input handler
function onFilesSelected(ev) {
  const files = Array.from(ev.target.files || [])
  // keep files in reactive array
  executionForm.newFiles = executionForm.newFiles.concat(files)
  // reset input
  ev.target.value = ''
}

function removeNewFile(index) {
  executionForm.newFiles.splice(index, 1)
}
function removeExistingPhoto(index) {
  executionForm.existingPhotos.splice(index, 1)
}

async function loadInfo() {
  try {
    const [
      typesRes,
      statusesRes,
      treesRes,
      pqrsRes,
      quadrillesRes,
      pruningsRes
    ] = await Promise.all([
      findAllTypes(),
      findAllStatus(),
      findAllTrees(),
      findAllPqrs(),
      findAllQuadrilles(),
      findAllPrunings()
    ])

    types.value = typesRes?.data ?? typesRes ?? []
    statuses.value = statusesRes?.data ?? statusesRes ?? []
    trees.value = treesRes?.data ?? treesRes ?? []
    pqrs.value = pqrsRes?.data ?? pqrsRes ?? []
    quadrilles.value = quadrillesRes?.data ?? quadrillesRes ?? []
    pruningsResponse.value = pruningsRes?.data ?? pruningsRes ?? []
  } catch (err) {
    console.error('loadInfo error:', err)
    // opcional: mostrar alert/ui
  }
}

// submit execution (local update + placeholder for API)
async function submitExecution() {
  if (!executionForm.pruningId) return alert('Pruning id missing')
  if (!executionForm.executedDate) return alert('Seleccione la fecha de ejecución')

  // buscar el status "Cerrada" y exigir que exista (el id es lo importante)
  const statusObj = (statuses.value || []).find(s => String(s.name).toLowerCase() === 'cerrada'
    || String(s.name).toLowerCase().includes('cerr'))

  if (!statusObj || !statusObj.id) {
    console.error('No se encontró el status "Cerrada" en la lista de estados:', statuses.value)
    return alert('No se puede registrar ejecución: falta el estado "Cerrada" en la configuración.')
  }

  const payload = {
    id: executionForm.pruningId,
    executedDate: executionForm.executedDate, // AAAA-MM-DD desde el input
    status: { id: statusObj.id } // enviamos SOLO el id del status "Cerrada"
  }

  try {
    const resp = await completePruning(payload)

    if (resp && resp.error) {
      console.error('API error completing pruning:', resp)
      alert('Error al registrar ejecución.')
      return
    }

    // actualizar UI local
    const idx = (pruningsResponse.value || []).findIndex(p => p.id === executionForm.pruningId)
    if (idx >= 0) {
      const p = { ...pruningsResponse.value[idx] }
      p.executedDate = executionForm.executedDate
      p.status = { id: statusObj.id, name: statusObj.name ?? 'Cerrada' }
      p.quadrille = (quadrilles.value || []).find(q => q.id === executionForm.quadrilleId) ?? p.quadrille
      p.observations = executionForm.observations
      const newPhotoPlaceholders = executionForm.newFiles.map(f => ({ path: `uploaded:${f.name}` }))
      const existing = executionForm.existingPhotos.map(u => ({ url: u }))
      p.photoRecords = (p.photoRecords ?? []).concat(existing, newPhotoPlaceholders)
      pruningsResponse.value.splice(idx, 1, p)
    }

    showExecutionModal.value = false
    await loadInfo()
    alert('Ejecución registrada correctamente.')
  } catch (err) {
    console.error('submitExecution error', err)
    alert('Error al registrar ejecución.')
  }
}
// ...existing

function closeExecutionModal() {
  showExecutionModal.value = false
}

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

function formatDate(value) {
  if (!value) return
  // acepta Date o string; devuelve AAAA-MM-DD y asigna a correctivePruning.plannedDate
  let dateObj
  if (value instanceof Date) dateObj = value
  else dateObj = new Date(String(value))

  if (Number.isNaN(dateObj.getTime())) return

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  correctivePruning.value.plannedDate = `${year}-${month}-${day}`
}

async function schedulePruningfunction() {
  pruningSelectect();
  applyDefaults();

  errors.value = {}

  const isPreventive = String(correctivePruning.value.type?.name ?? typeSelected.value ?? '').toLowerCase().includes('prevent')

  // validaciones comunes
  if (!correctivePruning.value.type || !correctivePruning.value.type.id) {
    errors.value.type = 'Debe seleccionar un tipo de poda.'
  }
  if (!correctivePruning.value.plannedDate) {
    errors.value.plannedDate = 'Debe seleccionar una fecha.'
  }
  if (!correctivePruning.value.status || !correctivePruning.value.status.id) {
    errors.value.status = 'Debe seleccionar un estado.'
  }
  if (!correctivePruning.value.tree || !correctivePruning.value.tree.id) {
    errors.value.tree = 'Debe seleccionar un árbol.'
  }

  // validaciones solo para correctiva
  if (!isPreventive) {
    if (!correctivePruning.value.pqr || !correctivePruning.value.pqr.id) {
      errors.value.pqr = 'Debe seleccionar una PQR.'
    } else if (correctivePruning.value.pqr.status && correctivePruning.value.pqr.status.name !== 'Cerrada') {
      errors.value.pqrStatus = 'La PQR debe estar cerrada.'
    }
  }

  if (Object.keys(errors.value).length > 0) {
    console.log('Errores:', errors.value)
    return
  }

  try {
    let resp

    if (isPreventive) {
      // construir payload específico para preventivas según el esquema pedido
      const plannedDate = correctivePruning.value.plannedDate
      const statusObj = statuses.value.find(s => String(s.name).toLowerCase() === 'abierta') ?? statuses.value[0] ?? { id: null }
      const typeObj = types.value.find(t => String(t.name).toLowerCase().includes('preventiva')) ?? types.value[0] ?? { id: correctivePruning.value.type?.id ?? null }

      const payloadPreventive = {
        id: '00000000-0000-0000-0000-000000000000',
        status: { id: statusObj.id },
        plannedDate: plannedDate,
        tree: { id: correctivePruning.value.tree.id },
        type: { id: typeObj.id }
      }

      resp = await schedulePreventivePruning(payloadPreventive)
    } else {
      // payload por defecto para correctiva (puedes adaptar campos si el backend espera otra forma)
      const payload = { ...correctivePruning.value }
      resp = await schedulePruning(payload)
    }

    // manejar respuesta: si service wrapper devuelve error lanzado se captura en catch
    // si devuelve objeto con .error o status, comprobarlo
    if (resp && resp.error) {
      console.error('API error:', resp)
      alert('Error al programar la poda.')
      pruningResponse.value = resp
      return
    }

    alert('Poda programada con éxito.')
    pruningResponse.value = resp
    // reset mínimo del formulario
    correctivePruning.value = {
      status: { id: null, name: null },
      plannedDate: null,
      tree: { id: null },
      type: { id: null, name: null },
      pqr: { id: null, status: { id: null, name: null } },
      observations: ""
    }
  } catch (err) {
    console.error('Exception scheduling pruning:', err)
    pruningResponse.value = err.response ?? err
    alert('Error al programar la poda.')
  }
}

function applyDefaults() {
  const sel = String(typeSelected.value ?? '').trim().toLowerCase()

  // Preventiva: setear tipo Preventiva y estado por defecto
  if (sel.includes('prevent')) {
    const t = types.value.find(x => String(x.name).toLowerCase() === 'preventiva') ||
              types.value.find(x => String(x.name).toLowerCase().includes('preventiva'))
    if (t) correctivePruning.value.type = { id: t.id, name: t.name }
    else correctivePruning.value.type = { id: null, name: 'Preventiva' }

    const s = statuses.value.find(x => String(x.name).toLowerCase() === 'abierta') ||
              statuses.value.find(x => String(x.name).toLowerCase().includes('abierta'))
    if (s) correctivePruning.value.status = { id: s.id, name: s.name }
    else correctivePruning.value.status = { id: null, name: 'Abierta' }

    return
  }

  // Correctiva (mantener lógica previa)
  if (sel.includes('correct')) {
    const t = types.value.find(x => String(x.name).toLowerCase() === 'correctiva') ||
              types.value.find(x => String(x.name).toLowerCase().includes('correctiva'))
    if (t) correctivePruning.value.type = { id: t.id, name: t.name }
    else correctivePruning.value.type = { id: null, name: 'Correctiva' }

    const s = statuses.value.find(x => String(x.name).toLowerCase() === 'abierta') ||
              statuses.value.find(x => String(x.name).toLowerCase().includes('abierta'))
    if (s) correctivePruning.value.status = { id: s.id, name: s.name }
    else correctivePruning.value.status = { id: null, name: 'Abierta' }

    return
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
    <h2 class="text-center mb-4 fw-bold">Gestion de Poda</h2>

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
       <button
        class="btn"
        :class="typeSelected === 'Visualizar' ? 'btn-success' : 'btn-outline-success'"
        @click="typeSelected = 'Visualizar'"
      >
        Visualizar podas programadas
      </button>
    </div>

    <!-- Formulario podas correctivas-->
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

    <!-- Formulario podas preventivas-->
    <div
      v-if="typeSelected === 'Preventiva'"
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

    <!-- Visualizar podas programadas-->
    <div
      v-if="typeSelected === 'Visualizar'"
      class="card shadow-sm border-0 p-3 mx-auto prunings-card"
      style="max-width: 1000px;"
    >
      <div class="prunings-table-wrapper">
        <table class="table prunings-table">
          <thead>
            <tr>
              <th v-for="attr in attributes" :key="attr">{{ attr }}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pruning, index) in pruningsResponse" :key="pruning.id ?? index">
              <td class="nowrap ellipsis" :title="pruning.type?.name">{{ pruning.type?.name ?? '-' }}</td>
              <td class="nowrap ellipsis" :title="pruning.status?.name">{{ pruning.status?.name ?? '-' }}</td>
              <td class="nowrap">{{ pruning.plannedDate ?? pruning.planneddate ?? '-' }}</td>
              <td class="nowrap ellipsis" :title="pruning.tree?.latitude">{{ pruning.tree?.latitude ?? '-' }}</td>
              <td class="nowrap ellipsis" :title="pruning.tree?.longitude">{{ pruning.tree?.longitude ?? '-' }}</td>
              <td class="ellipsis" :title="pruning.quadrille?.name">{{ pruning.quadrille?.name ?? pruning.quadrille ?? '-' }}</td>
              <td class="nowrap">{{ pruning.pqr?.date ?? '-' }}</td>
              <td class="nowrap ellipsis" :title="pruning.pqr?.status?.name">{{ pruning.pqr?.status?.name ?? '-' }}</td>
              <td class="photo-cell">
                <div v-if="pruning.photoRecords && pruning.photoRecords.length">
                  <a v-for="(photo, idx) in pruning.photoRecords" :key="idx" :href="photo.url ?? photo.path" target="_blank" class="me-1">Foto {{ idx + 1 }}</a>
                </div>
                <div v-else-if="pruning.photographicRecordPath">
                  <a :href="pruning.photographicRecordPath" target="_blank">Foto</a>
                </div>
                <div v-else class="muted">—</div>
              </td>
              <td class="observations ellipsis" :title="pruning.observations ?? pruning.executedDate">{{ pruning.observations ?? pruning.executedDate ?? '-' }}</td>
              <td class="actions-col">
                <button v-if="pruning.status?.name !== 'Cerrada'" class="btn btn-sm btn-primary me-2" @click="openExecution(pruning)">Registrar ejecucion</button>
                <button v-else class="btn btn-sm btn-secondary" disabled>Ejecutada</button>
              </td>
            </tr>

            <tr v-if="!(pruningsResponse && pruningsResponse.length)">
              <td :colspan="attributes.length + 1" class="text-center">No hay podas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Execution modal -->
    <div v-if="showExecutionModal" class="modal-backdrop" @click.self="closeExecutionModal">
  <div class="modal-card" style="max-width:800px; width:100%;">
    <div class="modal-header d-flex justify-content-between align-items-center mb-2">
      <h5 class="m-0">Registrar ejecución - {{ executionForm.typeName || executionForm.pruningId }}</h5>
      <button class="btn-close" @click="closeExecutionModal"></button>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Tipo / Estado</label>
        <div class="form-control-plaintext">{{ executionForm.typeName }} / {{ executionForm.statusName }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label">Fecha planeada</label>
        <div class="form-control-plaintext">{{ executionForm.plannedDate ?? '-' }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label">Fecha de ejecución</label>
        <input type="date" v-model="executionForm.executedDate" class="form-control" />
      </div>

      <div class="col-md-6">
        <label class="form-label">Cuadrilla</label>
        <select v-model="executionForm.quadrilleId" class="form-select">
          <option v-for="q in quadrilles" :key="q.id" :value="q.id">{{ q.name || q.id }}</option>
        </select>
      </div>

      <div class="col-md-12">
        <label class="form-label">Fotos (subir)</label>
        <input type="file" multiple accept="image/*" @change="onFilesSelected" class="form-control" />
        <div class="d-flex flex-wrap gap-2 mt-2">
          <div v-for="(f, idx) in executionForm.newFiles" :key="idx" class="badge bg-light text-truncate" style="max-width:160px;">
            {{ f.name }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeNewFile(idx)"></button>
          </div>
          <div v-for="(u, idx) in executionForm.existingPhotos" :key="'e'+idx" class="badge bg-secondary text-truncate" style="max-width:160px;">
            <a :href="u" target="_blank" style="color:#fff; text-decoration:underline;">Ver</a>
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeExistingPhoto(idx)"></button>
          </div>
        </div>
      </div>

      <div class="col-12">
        <label class="form-label">Observaciones</label>
        <textarea v-model="executionForm.observations" class="form-control" rows="3"></textarea>
      </div>

      <div class="col-12 text-end">
        <button class="btn btn-secondary me-2" @click="closeExecutionModal">Cancelar</button>
        <button class="btn btn-primary" @click="submitExecution">Confirmar Ejecución</button>
      </div>
    </div>
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

/* Card adjustments */
.prunings-card {
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 12px;
}

/* Table container: fixed header + scroll body */
.prunings-table-wrapper {
  max-height: 420px;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);
}

/* Table base */
.prunings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

/* Sticky header */
.prunings-table thead th {
  position: sticky;
  top: 0;
  background: #f1f3f5;
  z-index: 2;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

/* Row styling */
.prunings-table tbody tr {
  border-bottom: 1px solid rgba(0,0,0,0.04);
  background: linear-gradient(0deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9));
}

.prunings-table tbody tr:nth-child(odd) {
  background-color: #fff;
}

.prunings-table td {
  padding: 10px 12px;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 0.92rem;
  color: #333;
}

/* Responsive and wrapping cells */
.ellipsis {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nowrap {
  white-space: nowrap;
}

/* Observations can be wider */
.observations {
  max-width: 260px;
}

/* Photo cell smaller */
.photo-cell {
  max-width: 140px;
}

/* Actions column fixed width */
.actions-col {
  width: 130px;
  text-align: center;
  white-space: normal;
}

/* Small screens adjustments */
@media (max-width: 768px) {
  .prunings-card { padding: 0.5rem; }
  .prunings-table thead th { font-size: 0.85rem; padding: 8px; }
  .prunings-table td { font-size: 0.85rem; padding: 8px; }
  .ellipsis { max-width: 110px; }
  .observations { max-width: 140px; }
  .photo-cell { max-width: 90px; }
  .actions-col { width: 110px; }
}

/* subtle link style for photos */
.prunings-table a { color: #0d6efd; text-decoration: none; }
.prunings-table a:hover { text-decoration: underline; }

/* muted fallback */
.muted { color: rgba(0,0,0,0.45); }

/* Modal styles */
.modal-content {
  border-radius: 12px;
  overflow: hidden;
}
.modal-header {
  background-color: #f1f3f5;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 500;
}
.btn-close {
  opacity: 0.7;
}
.btn-close:hover {
  opacity: 1;
}

/* Form styles */
.form-label {
  font-weight: 500;
}
input[readonly], select[readonly] {
  background-color: #e9ecef;
}
.thumbnail-preview {
  display: inline-block;
  margin-right: 0.5rem;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}
.thumbnail-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

/* reuse existing modal styles; ensure modal-backdrop/modal-card are present in file */
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
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
</style>
