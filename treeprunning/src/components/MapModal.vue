<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header d-flex justify-content-between align-items-center mb-2">
        <h5 class="m-0">{{ title }}</h5>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div ref="mapHost" class="map-host" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  // si se pasa markers, se dibujan todos; si no, usa lat/lng único
  lat: { type: [Number, String], required: false },
  lng: { type: [Number, String], required: false },
  title: { type: String, default: 'Ubicación' },
  markers: { type: Array, default: () => [] }, // [{ lat, lng, title, status?, color? }]
  polygons: { type: Array, default: () => [] }, // [{ paths: [{lat,lng},...], title, color }]
  // interactivity
  allowSelect: { type: Boolean, default: false },
  allowDraw: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'select', 'polygons-changed'])

const mapHost = ref(null)
let map = null
let currentMarkers = [] // google.maps.Marker instances
let currentPolygons = [] // google.maps.Polygon instances
let scriptEl = null
let drawingManager = null
let mapClickListener = null

function parseNum(v) {
  if (v === null || v === undefined) return NaN
  if (typeof v === 'string') v = v.trim().replace(',', '.')
  return Number(v)
}

function coordsValid(latV, lngV) {
  const lat = parseNum(latV)
  const lng = parseNum(lngV)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

function waitForGlobalGoogle(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    if (window.google && window.google.maps) return resolve()
    const iv = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(iv)
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(iv)
        reject(new Error('Google Maps did not initialize in time'))
      }
    }, 50)
  })
}

async function loadGoogleMapsScript() {
  const key = "AIzaSyDyzsZnyyzjArVZcB0njhQZI8cjbkoaWZE"
  if (!key) throw new Error('VITE_GOOGLE_MAPS_API_KEY not defined')

  if (window.google && window.google.maps) return

  if (!document.querySelector(`script[data-gmp="true"]`)) {
    const cbName = '__gmp_init_' + Math.random().toString(36).slice(2)
    window[cbName] = () => {}
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${cbName}&v=beta&libraries=maps,drawing`
    scriptEl = document.createElement('script')
    scriptEl.src = src
    scriptEl.async = true
    scriptEl.defer = true
    scriptEl.setAttribute('data-gmp', 'true')
    document.head.appendChild(scriptEl)
    setTimeout(() => { try { delete window[cbName] } catch(_) {} }, 1000)
  }

  await waitForGlobalGoogle()
}

function clearMarkers() {
  for (const m of currentMarkers) {
    try { m.setMap(null) } catch {}
  }
  currentMarkers = []
}

function createMarkersFromArray(arr) {
  clearMarkers()
  // clear polygons when creating markers
  clearPolygons()
  if (!map || !Array.isArray(arr)) return
  const bounds = new google.maps.LatLngBounds()
  for (const it of arr) {
    const lat = parseNum(it.lat)
    const lng = parseNum(it.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    // determine icon by status/color
    const icon = makeMarkerIcon(it)
    // @ts-ignore
    const mk = new google.maps.Marker({ position: { lat, lng }, map, title: it.title ?? '', icon })
    currentMarkers.push(mk)
    bounds.extend({ lat, lng })
  }
  if (currentMarkers.length === 1) {
    map.setCenter(currentMarkers[0].getPosition())
    map.setZoom(16)
  } else if (currentMarkers.length > 1) {
    map.fitBounds(bounds, 40)
  }
}

function makeMarkerIcon(it) {
  // allow explicit color or infer from status
  const statusColor = it && (it.color || (it.status === 'realizado' ? '#28a745' : it.status === 'en proceso' ? '#ffc107' : it.status === 'cerrado' ? '#6c757d' : '#1976d2'))
  if (!statusColor) return undefined
  // create a simple SVG circle as data URL to allow color markers
  const svg = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='8' fill='${statusColor}' stroke='#ffffff' stroke-width='2'/></svg>`)
  return { url: `data:image/svg+xml;utf8,${svg}`, scaledSize: new google.maps.Size(24,24) }
}

function clearPolygons() {
  for (const p of currentPolygons) {
    try { p.setMap(null) } catch {}
  }
  currentPolygons = []
}

function createPolygonsFromArray(arr) {
  clearPolygons()
  if (!map || !Array.isArray(arr)) return
  for (const poly of arr) {
    if (!Array.isArray(poly.paths) || !poly.paths.length) continue
    const paths = poly.paths.map(pt => ({ lat: parseNum(pt.lat), lng: parseNum(pt.lng) })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    if (!paths.length) continue
    // @ts-ignore
    const gpoly = new google.maps.Polygon({ paths, strokeColor: poly.color || '#1976d2', strokeOpacity: 0.8, strokeWeight: 2, fillColor: poly.color || '#1976d2', fillOpacity: 0.15 })
    gpoly.setMap(map)
    currentPolygons.push(gpoly)
  }
}

function enableInteractivity() {
  if (!map) return

  // map click selection
  try {
    if (props.allowSelect) {
      mapClickListener = map.addListener('click', (ev) => {
        const lat = ev.latLng.lat(), lng = ev.latLng.lng()
        clearMarkers()
        // @ts-ignore
        const mk = new google.maps.Marker({ position: { lat, lng }, map, title: props.title })
        currentMarkers.push(mk)
        try { emit('select', { lat, lng }) } catch (e) { /* noop */ }
      })
    }
  } catch (err) { console.warn('map click listener failed', err) }

  // drawing polygons using DrawingManager
  try {
    if (props.allowDraw && window.google && window.google.maps && window.google.maps.drawing) {
      drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: { position: google.maps.ControlPosition.TOP_CENTER, drawingModes: [google.maps.drawing.OverlayType.POLYGON] },
        polygonOptions: { strokeWeight: 2, fillOpacity: 0.15 }
      })
      drawingManager.setMap(map)
      google.maps.event.addListener(drawingManager, 'overlaycomplete', (e) => {
        if (e.type === 'polygon') {
          const paths = e.overlay.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }))
          // keep overlay so it remains on map
          currentPolygons.push(e.overlay)
          try { emit('polygons-changed', [{ paths }]) } catch (e) { /* noop */ }
        }
      })
    }
  } catch (err) { console.warn('drawing manager init failed', err) }
}

async function initMap(markersArr) {
  try {
    await loadGoogleMapsScript()
  } catch (err) {
    console.error('Failed to load Google Maps script:', err)
    return
  }

  try {
    if (!map) {
      // @ts-ignore
      map = new google.maps.Map(mapHost.value, { center: { lat: 0, lng: 0 }, zoom: 2 })
    }

    // enable interactions if requested
    enableInteractivity()

    if (Array.isArray(markersArr) && markersArr.length) {
      createMarkersFromArray(markersArr)
      return
    }

    // single marker fallback using props.lat/props.lng
    if (coordsValid(props.lat, props.lng)) {
      const lat = parseNum(props.lat)
      const lng = parseNum(props.lng)
      // @ts-ignore
      map.setCenter({ lat, lng })
      map.setZoom(16)
      clearMarkers()
      // @ts-ignore
      const mk = new google.maps.Marker({ position: { lat, lng }, map, title: props.title })
      currentMarkers.push(mk)
    } else {
      // no valid coords: keep world view
      clearMarkers()
      map.setCenter({ lat: 0, lng: 0 })
      map.setZoom(2)
    }
  } catch (err) {
    console.error('Map init error:', err)
  }
}

onMounted(async () => {
  // if markers prop already present, init with those; otherwise single coords
  const markersProp = props.markers && props.markers.length ? props.markers : null
  await initMap(markersProp)
})

// react to changes
watch(() => props.markers, (m) => {
  if (!m || !m.length) return
  // if map not ready, initMap will load and draw
  if (!map) initMap(m)
  else createMarkersFromArray(m)
}, { immediate: true })

watch(() => [props.lat, props.lng], async () => {
  // only handle single marker mode (no markers array)
  if (props.markers && props.markers.length) return
  if (!map) await initMap(null)
  else {
    if (coordsValid(props.lat, props.lng)) {
      const lat = parseNum(props.lat), lng = parseNum(props.lng)
      try { map.setCenter({ lat, lng }) } catch {}
      map.setZoom(16)
      clearMarkers()
      // @ts-ignore
      const mk = new google.maps.Marker({ position: { lat, lng }, map, title: props.title })
      currentMarkers.push(mk)
    }
  }
}, { immediate: true })

onBeforeUnmount(() => {
  clearMarkers()
  clearPolygons()
  try {
    if (mapClickListener && window.google && window.google.maps) {
      google.maps.event.removeListener(mapClickListener)
      mapClickListener = null
    }
  } catch(_) {}
  try {
    if (drawingManager && window.google && window.google.maps) {
      google.maps.event.clearInstanceListeners(drawingManager)
      drawingManager.setMap(null)
      drawingManager = null
    }
  } catch(_) {}
  map = null
})
</script>

<style scoped>
.map-host { width:100%; height:420px; border-radius:6px; overflow:hidden; }
.modal-backdrop { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:1050; padding:16px; }
.modal-card { background:#fff; border-radius:8px; padding:12px; width:100%; max-width:900px; box-shadow:0 8px 24px rgba(0,0,0,0.2); }
.btn-close { background:transparent; border:none; font-size:1.25rem; cursor:pointer; }
</style>
