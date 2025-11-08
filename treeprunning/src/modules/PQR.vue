<template>
  <div class="pqr-module">
    <h2>PQR - Gestión de Solicitudes y Árboles</h2>

    <section class="pqr-form card mb-3">
      <h3>Crear nueva solicitud / evidencia</h3>
      <div class="form-row">
        <label>Título</label>
        <input v-model="form.title" />
      </div>
      <div class="form-row">
        <label>Descripción / Observaciones</label>
        <textarea v-model="form.description"></textarea>
      </div>

      <div class="form-row">
        <label>Fotos (evidencia)</label>
        <input type="file" @change="onPhotoChange" accept="image/*" multiple />
        <div class="thumbs">
          <img v-for="(p,i) in form.photos" :key="i" :src="p" class="thumb" />
        </div>
      </div>

      <div class="form-row">
        <label>Firma (dibuje)</label>
        <div class="signature">
          <canvas ref="sigCanvas" width="300" height="120" @mousedown="sigStart" @mousemove="sigMove" @mouseup="sigEnd" @mouseleave="sigEnd" @touchstart.prevent="sigStartTouch" @touchmove.prevent="sigMoveTouch" @touchend.prevent="sigEnd"></canvas>
          <div class="sig-actions">
            <button @click="clearSignature">Borrar</button>
          </div>
        </div>
      </div>

      <div class="form-row">
        <label>Lat</label>
        <input v-model="form.lat" placeholder="e.g. 4.710989" />
        <label>Lng</label>
        <input v-model="form.lng" placeholder="e.g. -74.072092" />
        <button @click="useCurrentLocation">Usar ubicación actual</button>
        <button @click="openMapForForm">Ver en mapa</button>
        <button @click="openDrawPolygons">Delimitar sector</button>
      </div>

      <div class="form-actions">
        <button @click="savePQR">Guardar solicitud</button>
      </div>
    </section>

    <section class="pqr-templates card mb-3">
      <h3>Plantillas de Informes (HU_21)</h3>
      <div class="template-form">
        <label>Nombre de plantilla</label>
        <input v-model="newTemplate.name" placeholder="Informe de poda - zona norte" />

        <label>Campos (agrega nombre de campo y presiona +)</label>
        <div class="add-field">
          <input v-model="newField" placeholder="Ej: observaciones" />
          <button @click="addField">+</button>
        </div>

        <ul class="fields-list">
          <li v-for="(f,i) in newTemplate.fields" :key="i">{{ f }}</li>
        </ul>

        <div class="template-actions">
          <button @click="saveTemplate">Guardar plantilla</button>
          <button @click="clearNewTemplate">Limpiar</button>
        </div>
      </div>

      <div class="templates-list mt-2">
        <h4>Plantillas guardadas</h4>
        <ul>
          <li v-for="t in templates" :key="t.id">
            <strong>{{ t.name }}</strong>
            <small>({{ t.fields.length }} campos)</small>
            <div class="tpl-actions">
              <button @click="previewTemplate(t)">Previsualizar</button>
              <button @click="exportTemplateJSON(t)">Exportar JSON</button>
              <button @click="exportTemplatePDF(t)">Exportar PDF</button>
              <button @click="deleteTemplate(t)">Eliminar</button>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="pqr-list card mb-3">
      <h3>Solicitudes</h3>
      <div class="filters">
        <label>Filtro estado:</label>
        <select v-model="filterStatus">
          <option value="">Todos</option>
          <option value="en proceso">En proceso</option>
          <option value="realizado">Realizado</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button @click="showPlanningOnMap">Ver planificación (mapa)</button>
      </div>

      <ul class="list">
        <li v-for="p in filteredList" :key="p.id" class="list-item">
          <div class="meta">
            <strong>{{ p.title }}</strong>
            <small>{{ p.date }}</small>
            <span class="status" :class="p.status">{{ p.status }}</span>
          </div>
          <div class="actions">
            <button @click="openMapForPQR(p)">Ver en mapa</button>
            <button @click="cycleStatus(p)">Cambiar estado</button>
          </div>
        </li>
      </ul>
    </section>

    <MapModal v-if="showMap"
      :markers="mapMarkers"
      :polygons="mapPolygons"
      :title="mapTitle"
      :allow-select="mapAllowSelect"
      :allow-draw="mapAllowDraw"
      @select="onMapSelect"
      @polygons-changed="onPolygonsChanged"
      @close="closeMap"
    ></MapModal>
  </div>

</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MapModal from '@/components/MapModal.vue'

// simple id generator
let nextId = 100

const form = reactive({ title: '', description: '', photos: [], lat: '', lng: '', signature: null })
const pqrList = ref([
  { id: 1, title: 'Poda en calle 1', description: 'Árbol obstruye paso', lat: 4.710989, lng: -74.072092, status: 'en proceso', date: '2025-11-01', photos: [], signature: null },
  { id: 2, title: 'Inspección árbol parque', description: 'Se solicita revisión', lat: 4.715, lng: -74.08, status: 'realizado', date: '2025-11-05', photos: [], signature: null }
])

const showMap = ref(false)
const mapMarkers = ref([])
const mapPolygons = ref([])
const mapTitle = ref('Ubicaciones')
const mapAllowSelect = ref(false)
const mapAllowDraw = ref(false)
const savedPolygons = ref([])
// --- templates (HU_21) ---
const templates = ref([])
const newTemplate = reactive({ id: null, name: '', fields: [] })
const newField = ref('')

// load templates from localStorage
onMounted(() => {
  try {
    const raw = localStorage.getItem('pqr_templates')
    if (raw) templates.value = JSON.parse(raw)
  } catch (e) { templates.value = [] }
})

function persistTemplates(){
  try { localStorage.setItem('pqr_templates', JSON.stringify(templates.value)) } catch(e){}
}

function addField(){
  const v = (newField.value || '').trim()
  if (!v) return
  newTemplate.fields.push(v)
  newField.value = ''
}

function clearNewTemplate(){
  newTemplate.name = ''
  newTemplate.fields = []
  newField.value = ''
}

function saveTemplate(){
  if (!newTemplate.name || !newTemplate.fields.length) return alert('Nombre y al menos un campo son requeridos')
  const id = Date.now()
  templates.value.push({ id, name: newTemplate.name, fields: [...newTemplate.fields] })
  persistTemplates()
  clearNewTemplate()
  alert('Plantilla guardada localmente')
}

function deleteTemplate(t){
  templates.value = templates.value.filter(x => x.id !== t.id)
  persistTemplates()
}

function previewTemplate(t){
  // open a new window with a simple HTML preview
  const html = `<!doctype html><html><head><meta charset='utf-8'><title>Preview ${t.name}</title><style>body{font-family:Arial;padding:16px}h2{margin-top:0}label{display:block;font-weight:600;margin-top:8px}input,textarea{width:100%;padding:6px;margin-top:4px}</style></head><body><h2>${t.name}</h2>${t.fields.map(f=>`<label>${f}</label><div><input placeholder='${f}'/></div>`).join('')}<p style='margin-top:12px;color:#666'>Previsualización - imprimir si desea guardar como PDF.</p></body></html>`
  const w = window.open('about:blank','_blank')
  if (!w) return alert('El navegador bloqueó la apertura de ventanas. Permita popups para previsualizar.')
  w.document.write(html)
  w.document.close()
}

function exportTemplateJSON(t){
  const data = JSON.stringify(t, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${t.name.replace(/\s+/g,'_')}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function exportTemplatePDF(t){
  // simple printable HTML that user can print to PDF
  const html = `<!doctype html><html><head><meta charset='utf-8'><title>${t.name}</title><style>body{font-family:Arial;padding:16px}h2{margin-top:0}label{display:block;font-weight:600;margin-top:8px}input,textarea{width:100%;padding:6px;margin-top:4px}</style></head><body><h2>${t.name}</h2>${t.fields.map(f=>`<label>${f}</label><div style='border-bottom:1px solid #ddd;height:28px;margin-bottom:6px'></div>`).join('')}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`
  const w = window.open('about:blank','_blank')
  if (!w) return alert('El navegador bloqueó la apertura de ventanas. Permita popups para exportar PDF.')
  w.document.write(html)
  w.document.close()
}

const filterStatus = ref('')

const filteredList = computed(() => {
  if (!filterStatus.value) return pqrList.value
  return pqrList.value.filter(p => p.status === filterStatus.value)
})

function onPhotoChange(ev) {
  const files = ev.target.files || []
  for (const f of files) {
    const reader = new FileReader()
    reader.onload = (e) => { form.photos.push(e.target.result) }
    reader.readAsDataURL(f)
  }
}

// --- signature canvas ---
const sigCanvas = ref(null)
let drawing = false
let ctx = null

onMounted(() => {
  if (sigCanvas.value) ctx = sigCanvas.value.getContext('2d')
})

function sigStart(e) { drawing = true; drawPoint(e.offsetX, e.offsetY) }
function sigMove(e) { if (!drawing) return; drawPoint(e.offsetX, e.offsetY) }
function sigStartTouch(e) { drawing = true; const t = e.touches[0]; const r = sigCanvas.value.getBoundingClientRect(); drawPoint(t.clientX - r.left, t.clientY - r.top) }
function sigMoveTouch(e) { if (!drawing) return; const t = e.touches[0]; const r = sigCanvas.value.getBoundingClientRect(); drawPoint(t.clientX - r.left, t.clientY - r.top) }
function sigEnd() { drawing = false; saveSignature() }

function drawPoint(x,y){ if(!ctx)return; ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); }
function clearSignature(){ if(!ctx) return; ctx.clearRect(0,0,sigCanvas.value.width, sigCanvas.value.height); form.signature = null }
function saveSignature(){ if(!sigCanvas.value) return; form.signature = sigCanvas.value.toDataURL('image/png') }

// --- location helpers ---
function useCurrentLocation(){
  if (!navigator.geolocation) return alert('Geolocalización no disponible')
  navigator.geolocation.getCurrentPosition(pos => {
    form.lat = pos.coords.latitude
    form.lng = pos.coords.longitude
  }, err => { alert('Error al obtener ubicación: ' + err.message) })
}

function openMapForForm(){
  const mk = []
  if (form.lat && form.lng) mk.push({ lat: form.lat, lng: form.lng, title: form.title || 'Ubicación' })
  mapMarkers.value = mk
  mapTitle.value = 'Ubicación del formulario'
  mapAllowSelect.value = true
  mapAllowDraw.value = false
  showMap.value = true
}

function openMapForPQR(p){
  mapMarkers.value = [{ lat: p.lat, lng: p.lng, title: p.title, status: p.status }]
  mapTitle.value = `PQR: ${p.title}`
  mapAllowSelect.value = false
  mapAllowDraw.value = false
  showMap.value = true
}

function openDrawPolygons(){
  // present existing saved polygons and enable drawing
  mapPolygons.value = savedPolygons.value.length ? savedPolygons.value : []
  mapTitle.value = 'Delimitar sector'
  mapAllowSelect.value = false
  mapAllowDraw.value = true
  showMap.value = true
}

function onMapSelect(pos){
  if (!pos) return
  form.lat = pos.lat
  form.lng = pos.lng
  mapAllowSelect.value = false
  showMap.value = false
}

function onPolygonsChanged(polys){
  if (!polys || !polys.length) return
  // append new polygons to saved list
  for (const p of polys) {
    savedPolygons.value.push(p)
  }
  mapPolygons.value = savedPolygons.value
  mapAllowDraw.value = false
  showMap.value = false
  alert('Polígono(s) guardado(s) localmente (simulación)')
}

function closeMap(){
  showMap.value = false
  mapAllowSelect.value = false
  mapAllowDraw.value = false
}

function showPlanningOnMap(){
  // show all PQRs as planning markers
  mapMarkers.value = pqrList.value.map(p => ({ lat: p.lat, lng: p.lng, title: `${p.title} (${p.date})`, status: p.status }))
  mapTitle.value = 'Planificación de podas'
  showMap.value = true
}

function savePQR(){
  const lat = Number(form.lat)
  const lng = Number(form.lng)
  const item = { id: nextId++, title: form.title || 'Sin título', description: form.description, lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null, status: 'en proceso', date: new Date().toISOString().slice(0,10), photos: [...form.photos], signature: form.signature }
  pqrList.value.unshift(item)
  // reset form
  form.title = ''
  form.description = ''
  form.photos = []
  form.lat = ''
  form.lng = ''
  clearSignature()
  alert('Solicitud guardada localmente (simulación)')
}

function cycleStatus(p){
  const order = ['en proceso','realizado','cerrado']
  const idx = order.indexOf(p.status)
  p.status = order[(idx+1) % order.length]
}
</script>