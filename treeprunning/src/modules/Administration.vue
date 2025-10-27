<script setup>
import { ref, watch, reactive, nextTick } from 'vue'
import MapModal from '../components/MapModal.vue'
import { findAllPersons } from '../services/personAPI.js'

const entityList = [
  'Persona',
  'Familia',
  'Arbol',
  'Pais',
  'Departamento',
  'Municipio',
  'Sector',
  'Herramienta',
  'Programacion'
]

const selectedEntity = ref('Persona')

// Atributos (ordenados) por entidad
const entityAttributes = {
  Persona: [
    'id',
    'nombreUno',
    'nombreDos',
    'apellidoUno',
    'apellidoDos'
  ],
  Familia: ['id', 'nombreCientifico', 'nombreComun'],
  Arbol: ['id', 'Longitud', 'Latitud', 'Especie', 'Sector'],
  Pais: ['id', 'nombre'],
  Departamento: ['id', 'nombre', 'pais'],
  Municipio: ['id', 'nombre', 'departamento'],
  Sector: ['id', 'nombre', 'municipio'],
  Herramienta: ['id', 'nombre', 'descripcion'],
  Programacion: ['id', 'fechaInicial', 'frecienciameses', 'cantidad']
}

// Datos de prueba organizados por entidad
const mockData = {
  Persona: [
    {
      id: 1,
      nombreUno: 'Ana',
      nombreDos: 'María',
      apellidoUno: 'García',
      apellidoDos: 'López',
      Documento: 'CC',
      numeroDocumento: '1001122334',
      fechaNacimiento: '1990-05-12',
      direccion: 'Calle 10 #20-30',
      email: 'ana.garcia@example.com',
      correoConfirmado: true,
      telefono: '+57 3001234567',
      telefonoConfirmado: true,
      edad: 35
    },
    {
      id: 2,
      nombreUno: 'Luis',
      nombreDos: '',
      apellidoUno: 'Martínez',
      apellidoDos: 'Ruiz',
      Documento: 'CC',
      numeroDocumento: '1002233445',
      fechaNacimiento: '1985-11-02',
      direccion: 'Carrera 5 #12-45',
      email: 'luis.martinez@example.com',
      correoConfirmado: false,
      telefono: '+57 3129876543',
      telefonoConfirmado: false,
      edad: 40
    },
    {
      id: 3,
      nombreUno: 'Marta',
      nombreDos: 'Isabel',
      apellidoUno: 'Pérez',
      apellidoDos: '',
      Documento: 'TI',
      numeroDocumento: '5012233',
      fechaNacimiento: '2000-07-21',
      direccion: 'Av. Siempre Viva 742',
      email: 'marta.perez@example.com',
      correoConfirmado: true,
      telefono: '+57 3201112222',
      telefonoConfirmado: true,
      edad: 25
    }
  ],
  Familia: [
    { id: 1, nombreCientifico: 'Pinus sylvestris', nombreComun: 'Pino' },
    { id: 2, nombreCientifico: 'Quercus robur', nombreComun: 'Roble' },
    { id: 3, nombreCientifico: 'Salix alba', nombreComun: 'Sauce' }
  ],
  Arbol: [
    { id: 1, Longitud: -75.382563, Latitud: 6.145493, Especie: 'Araucaria heterophylla', Sector: 'El porvenir comuna 4 villa manuela-Rionegro-Antioquia-Colombia' },
    { id: 2, Longitud: -75.382687, Latitud: 6.145493, Especie: 'Syzygium paniculata', Sector: 'El porvenir comuna 4 villa manuela-Rionegro-Antioquia-Colombia' },
    { id: 3, Longitud: -75.382467, Latitud: 6.145503, Especie: 'Archontophoenix cunninghamiana', Sector: 'El porvenir comuna 4 villa manuela-Rionegro-Antioquia-Colombia' },
    { id: 4, Longitud: -75.375115, Latitud: 6.148721, Especie: 'Inga sp', Sector: 'El centro comuna 3 avenida galan-Rionegro-Antioquia-Colombia' },
    { id: 5, Longitud: -75.375177, Latitud: 6.148722, Especie: 'Handroanthus chrysanthus', Sector: 'El centro comuna 3 avenida galan-Rionegro-Antioquia-Colombia' },
    { id: 6, Longitud: -75.375353, Latitud: 6.148725, Especie: 'Prunus serotine', Sector: 'El centro comuna 3 avenida galan-Rionegro-Antioquia-Colombia' },
    { id: 7, Longitud: -75.383343, Latitud: 6.127223, Especie: 'Citrus spp', Sector: 'San Antonio comuna 1 san bartolo-Rionegro-Antioquia-Colombia' },
    { id: 8, Longitud: -75.383347, Latitud: 6.127257, Especie: 'Persea americana', Sector: 'San Antonio comuna 1 san bartolo-Rionegro-Antioquia-Colombia' },
    { id: 9, Longitud: -75.383295, Latitud: 6.127282, Especie: 'Acca sellowiana', Sector: 'San Antonio comuna 1 san bartolo-Rionegro-Antioquia-Colombia' },
    { id: 10, Longitud: -75.374468, Latitud: 6.142899, Especie: 'Yucca gigantea', Sector: 'Santa ana comuna 2 altos de la Pereira-Rionegro-Antioquia-Colombia' }
  ],
  Pais: [
    { id: 1, nombre: 'Colombia' }
  ],
  Departamento: [
    { id: 1, nombre: 'Antioquia', pais: 'Colombia' }
  ],
  Municipio: [
    { id: 1, nombre: 'Rionegro', departamento: 'Antioquia-Colombia' },
  ],
  Sector: [
    { id: 1, nombre: 'Porvenir Tercera Etapa', municipio: 'Rionegro-Antioquia-Colombia' },
    { id: 2, nombre: 'El porvenir comuna 4 villa manuela', municipio: 'Rionegro-Antioquia-Colombia' }
  ],
  Herramienta: [
    { id: 1, nombre: 'Podadora', descripcion: 'Podadora de mano, 40cm' },
    { id: 2, nombre: 'Sierra', descripcion: 'Sierra para poda, 20 dientes' }
  ],
  Programacion: [
    { id: 1, fechaInicial: '1/1/2025', frecienciameses: '6', cantidad: '2' },
    { id: 2, fechaInicial: '1/2/2025', frecienciameses: '4', cantidad: '3' },
    { id: 3, fechaInicial: '1/3/2025', frecienciameses: '3', cantidad: '4' }
  ]
}

// Reactivos
const columns = ref([])
const data = ref([])

// Editor (modal)
const showEditor = ref(false)
const editorRow = reactive({})
const originalIndex = ref(-1)

// Map single punto
const showMap = ref(false)
const mapCoords = reactive({ lat: null, lng: null })

// Map para todos los árboles
const showMapAll = ref(false)
const mapMarkers = ref([])

// Cargar datos según entidad seleccionada
const loadData = () => {
  const items = mockData[selectedEntity.value] ?? []
  // Clone to avoid mutating original mockData directly
  data.value = items.map(i => ({ ...i }))
  columns.value = entityAttributes[selectedEntity.value] ?? (data.value[0] ? Object.keys(data.value[0]) : [])
}

loadData()
watch(selectedEntity, () => {
  loadData()
})

// Abrir editor con la fila seleccionada
function openEditor(row) {
  // buscar índice en data
  originalIndex.value = data.value.findIndex(r => r.id === row.id)
  // copiar en editorRow
  Object.keys(editorRow).forEach(k => delete editorRow[k])
  const src = data.value[originalIndex.value] ?? row
  for (const k of columns.value) {
    editorRow[k] = src[k]
  }
  showEditor.value = true
}

// Cerrar editor
function closeEditor() {
  showEditor.value = false
}

// Guardar cambios (actualiza la tabla; en app real harías llamada al backend)
function saveEdit() {
  const idx = originalIndex.value
  const payload = {}
  for (const k of columns.value) payload[k] = editorRow[k]
  if (idx >= 0) {
    data.value[idx] = { ...payload }
  } else {
    // nuevo registro
    payload.id = (Math.max(0, ...data.value.map(d => d.id ?? 0)) + 1)
    data.value.push(payload)
  }
  showEditor.value = false
}

// Tipo de campo simple para inputs (puedes expandir según nombres)
function fieldType(col) {
  const lc = col.toLowerCase()
  if (lc.includes('fecha') || lc.includes('date')) return 'date'
  if (lc.includes('email') || lc.includes('correo')) return 'email'
  if (lc.includes('telefono') || lc.includes('numero') || lc === 'edad') return 'text'
  if (lc === 'longitud' || lc === 'latitud') return 'number'
  return 'text'
}

function openMap(row) {
  const lat = Number(String(row.Latitud ?? row.lat ?? '').trim().replace(',', '.'))
  const lng = Number(String(row.Longitud ?? row.lng ?? '').trim().replace(',', '.'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    alert('Coordenadas inválidas para este registro.')
    return
  }
  mapCoords.lat = lat
  mapCoords.lng = lng
  // abrir en siguiente tick para asegurar props actualizadas
  nextTick(() => { showMap.value = true })
}

function openAllTrees() {
  // intenta usar datos actuales (data) si la entidad mostrada es Arbol; fallback a mockData.Arbol
  const list = (selectedEntity.value === 'Arbol' && Array.isArray(data.value) && data.value.length) ? data.value : (mockData.Arbol ?? [])
  const markers = []
  for (const r of list) {
    const lat = Number(String(r.Latitud ?? r.lat ?? r.Lat ?? '').trim().replace(',', '.'))
    const lng = Number(String(r.Longitud ?? r.lng ?? r.Lng ?? '').trim().replace(',', '.'))
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    markers.push({ lat, lng, title: r.Especie ?? r.nombre ?? `Árbol ${r.id ?? ''}` })
  }
  if (!markers.length) {
    alert('No hay coordenadas válidas para los árboles.')
    return
  }
  mapMarkers.value = markers
  nextTick(() => { showMapAll.value = true })
}
</script>

<template>
  <div class="container mt-4">
    <h4 class="mb-3">Administración de información</h4>

    <button @click="findAllPersons()">Obtener Personas</button>

    <!-- Selector de entidad y botón ver todos árboles -->
    <div class="mb-3 d-flex align-items-center gap-3">
      <div style="flex:1">
        <label class="form-label">Entidad</label>
        <select v-model="selectedEntity" class="form-select">
          <option v-for="e in entityList" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>

      <!-- Botón que aparece solo cuando se selecciona Arbol -->
      <div v-if="selectedEntity === 'Arbol'">
        <button class="btn btn-outline-primary mt-4" @click="openAllTrees">Ver todos los árboles</button>
      </div>
    </div>

    <!-- Tabla -->
    <table class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="row.id ?? index">
          <td v-for="col in columns" :key="col">
            {{ row[col] }}
          </td>
          <td>
            <button class="btn btn-sm btn-primary me-2" @click="openEditor(row)">Editar</button>
            <button class="btn btn-sm btn-info me-2" v-if="selectedEntity === 'Arbol'" @click="openMap(row)">Mapa</button>
          </td>

        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + 1" class="text-center">No hay datos</td>
        </tr>
      </tbody>
    </table>

    <!-- Editor modal (ventana encima de la página principal) -->
    <div v-if="showEditor" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header d-flex justify-content-between align-items-center mb-2">
          <h5 class="m-0">Editar {{ selectedEntity }}</h5>
          <button class="btn-close" @click="closeEditor"></button>
        </div>

        <form @submit.prevent="saveEdit">
          <div class="mb-2" v-for="col in columns" :key="col">
            <label class="form-label">{{ col }}</label>
            <input
              v-model="editorRow[col]"
              class="form-control"
              :type="fieldType(col)"
              :readonly="col === 'id'"
            />
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button type="button" class="btn btn-secondary me-2" @click="closeEditor">Cancelar</button>
            <button type="submit" class="btn btn-success">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Map modal para un punto -->
    <MapModal v-if="showMap" :lat="mapCoords.lat" :lng="mapCoords.lng" @close="showMap=false" />

    <!-- Map modal para múltiples marcadores -->
    <MapModal v-if="showMapAll" :markers="mapMarkers" title="Todos los árboles" @close="showMapAll=false" />
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
  max-width: 600px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}
</style>
