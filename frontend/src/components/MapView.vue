<template>
  <div ref="mapEl" class="map"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useVehicles } from '../composables/useVehicles'
import { useWebsocket } from '../composables/useWebsocket'

const props = defineProps<{
  query: string
  showHistory: boolean
  activePlate: string | null
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: google.maps.Map | null = null

const vehicleState = new Map<
  string,
  { lat: number; lng: number; speed: number; fuel: number; timestamp: string }
>()

const snappedTail = new Map<string, { lat: number; lng: number }>()

const markers = new Map<string, google.maps.Marker>()

const polylines = new Map<string, google.maps.Polyline>()

const { items, fetchVehicles } = useVehicles(() => props.query)

function injectGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

async function loadGoogleMapsLibraries() {
  await google.maps.importLibrary('maps')
  await google.maps.importLibrary('marker')
}

async function fetchSnappedHistory(plate: string) {
  const resp = await fetch(
    `${import.meta.env.VITE_API_URL}/vehicles/${plate}/history/snapped`,
  )
  const hist = await resp.json()
  return hist as { lat: number; lng: number }[]
}

async function drawHistory(plate: string) {
  const snappedPoints = await fetchSnappedHistory(plate)

  let pl = polylines.get(plate)
  if (!pl) {
    pl = new google.maps.Polyline({
      path: snappedPoints,
      map: props.showHistory && map ? map : null,
      strokeWeight: 3,
      strokeColor: '#1a73e8',
    })
    polylines.set(plate, pl)
  } else {
    pl.setPath(snappedPoints)
    pl.setMap(props.showHistory && map ? map : null)
  }

  if (snappedPoints.length > 0) {
    const lastSnap = snappedPoints[snappedPoints.length - 1]
    snappedTail.set(plate, { lat: lastSnap.lat, lng: lastSnap.lng })

    const st = vehicleState.get(plate)
    if (st) {
      upsertMarker({
        plate,
        lat: lastSnap.lat,
        lng: lastSnap.lng,
        speed: st.speed,
        fuel: st.fuel,
        timestamp: st.timestamp,
      })
    }
  }
}

function makeIcon(isActive: boolean) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: isActive ? 10 : 8,
    fillColor: isActive ? '#ff4444' : '#1a73e8',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
  } as google.maps.Symbol
}

function upsertMarker(v: {
  plate: string
  lat: number
  lng: number
  speed: number
  fuel: number
  timestamp: string
}) {
  vehicleState.set(v.plate, {
    lat: v.lat,
    lng: v.lng,
    speed: v.speed,
    fuel: v.fuel,
    timestamp: v.timestamp,
  })

  const snappedPos = snappedTail.get(v.plate)
  const finalLat = snappedPos ? snappedPos.lat : v.lat
  const finalLng = snappedPos ? snappedPos.lng : v.lng

  const isActive = props.activePlate === v.plate
  const pos = { lat: finalLat, lng: finalLng }

  let m = markers.get(v.plate)

  if (!m) {
    m = new google.maps.Marker({
      position: pos,
      map: map!,
      title: v.plate,
      icon: makeIcon(isActive),
    })

    m.addListener('click', async () => {
      await focusMapOnPlate(v.plate, true)
    })

    markers.set(v.plate, m)
  } else {
    m.setPosition(pos)
    m.setIcon(makeIcon(isActive))
  }
}
async function focusMapOnPlate(plate: string, alsoDrawHistory = false) {
  if (!map) return
  const snap = snappedTail.get(plate)
  const raw = vehicleState.get(plate)
  const centerLat = snap?.lat ?? raw?.lat
  const centerLng = snap?.lng ?? raw?.lng
  if (centerLat == null || centerLng == null) return

  map.panTo({ lat: centerLat, lng: centerLng })
  map.setZoom(15)

  if (alsoDrawHistory) {
    await drawHistory(plate)
  }

  markers.forEach((marker, otherPlate) => {
    marker.setIcon(makeIcon(otherPlate === plate))
  })
}

useWebsocket(async (p) => {
  upsertMarker(p)

  if (props.showHistory) {
    await drawHistory(p.plate)
  }
})

watch(
  () => props.showHistory,
  (show) => {
    polylines.forEach((pl) => {
      pl.setMap(show && map ? map : null)
    })
  },
)

watch(
  () => props.activePlate,
  async (plate) => {
    if (!plate) return
    await focusMapOnPlate(plate, true)
  },
)

function syncMarkersWithList() {
  const visiblePlates = new Set(items.value.map((v) => v.plate))
  markers.forEach((marker, plate) => {
    if (!visiblePlates.has(plate)) {
      marker.setMap(null)
      markers.delete(plate)
    }
  })
}

watch(
  () => props.query,
  () => {
    syncMarkersWithList()
  },
)

onMounted(async () => {
  await injectGoogleMapsScript()
  await loadGoogleMapsLibraries()

  map = new google.maps.Map(mapEl.value as HTMLElement, {
    center: { lat: -8.05428, lng: -34.8813 },
    zoom: 12,
    streetViewControl: false,
    mapTypeControl: false,
  })

  await fetchVehicles()

  for (const v of items.value) {
    upsertMarker(v)

    if (props.showHistory) {
      await drawHistory(v.plate)
    }
  }

  syncMarkersWithList()

  if (props.activePlate) {
    await focusMapOnPlate(props.activePlate, true)
  }
})
</script>

<style scoped>
.map {
  width: 100%;
  height: calc(100vh - 130px);
}
</style>
