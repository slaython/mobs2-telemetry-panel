<template>
  <div ref="mapEl" class="map"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useVehicles } from '../composables/useVehicles'
import { useWebsocket } from '../composables/useWebsocket'

const props = defineProps<{ query: string; showHistory: boolean }>()
const mapEl = ref<HTMLDivElement | null>(null)
let map: L.Map
const markers = new Map<string, L.Marker>()
const polylines = new Map<string, L.Polyline>()
const { items, fetchVehicles } = useVehicles(() => props.query)

function upsertMarker(v: any) {
  const pos: [number, number] = [v.lat, v.lng]
  let m = markers.get(v.plate)
  if (!m) {
    m = L.marker(pos).addTo(map).bindPopup(`<b>${v.plate}</b><br/>Vel: ${v.speed?.toFixed(1)} km/h<br/>Comb: ${v.fuel?.toFixed(1)}%<br/>${new Date(v.timestamp).toLocaleString()}`)
    m.on('click', async () => {
      const hist = await (await fetch(`${import.meta.env.VITE_API_URL}/vehicles/${v.plate}/history`)).json()
      drawHistory(v.plate, hist)
      m!.openPopup()
    })
    markers.set(v.plate, m)
  } else {
    m.setLatLng(pos)
    m.setPopupContent(`<b>${v.plate}</b><br/>Vel: ${v.speed?.toFixed(1)} km/h<br/>Comb: ${v.fuel?.toFixed(1)}%<br/>${new Date(v.timestamp).toLocaleString()}`)
  }
}

function drawHistory(plate: string, points: { lat: number; lng: number }[]) {
  const latlngs = points.map(p => [p.lat, p.lng] as [number, number])
  let pl = polylines.get(plate)
  if (!pl) {
    pl = L.polyline(latlngs, { weight: 3 }).addTo(map)
    polylines.set(plate, pl)
  } else {
    pl.setLatLngs(latlngs)
  }
  if (!props.showHistory) pl.remove()
}

useWebsocket((p) => {
  upsertMarker(p)
  if (props.showHistory) {
    fetch(`${import.meta.env.VITE_API_URL}/vehicles/${p.plate}/history`).then(r => r.json()).then(hist => drawHistory(p.plate, hist))
  }
})

watch(() => props.showHistory, () => {
  polylines.forEach(pl => {
    if (props.showHistory) pl.addTo(map)
    else pl.remove()
  })
})

onMounted(async () => {
  map = L.map(mapEl.value!).setView([-8.05428, -34.8813], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  await fetchVehicles()
  items.value.forEach(upsertMarker)
})
</script>

<style scoped>
.map { width: 100%; height: calc(100vh - 120px); }
</style>
