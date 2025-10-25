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
  markers: { type: Array, default: () => [] } // [{ lat, lng, title }]
})

const mapHost = ref(null)
let map = null
let currentMarkers = [] // google.maps.Marker instances
let scriptEl = null

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
    const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${cbName}&v=beta&libraries=maps`
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
  if (!map || !Array.isArray(arr)) return
  const bounds = new google.maps.LatLngBounds()
  for (const it of arr) {
    const lat = parseNum(it.lat)
    const lng = parseNum(it.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    // @ts-ignore
    const mk = new google.maps.Marker({ position: { lat, lng }, map, title: it.title ?? '' })
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
  map = null
})
</script>

<style scoped>
.map-host { width:100%; height:420px; border-radius:6px; overflow:hidden; }
.modal-backdrop { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:1050; padding:16px; }
.modal-card { background:#fff; border-radius:8px; padding:12px; width:100%; max-width:900px; box-shadow:0 8px 24px rgba(0,0,0,0.2); }
.btn-close { background:transparent; border:none; font-size:1.25rem; cursor:pointer; }
</style>
