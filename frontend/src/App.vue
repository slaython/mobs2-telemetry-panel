<template>
  <header class="topbar">
    <label class="toggle">
      <input type="checkbox" v-model="showHistory" />
      <span>Mostrar histórico</span>
    </label>
  </header>
  <VehicleList
    :vehicles="vehicles"
    :activePlate="activePlate"
    @select="handleSelectVehicle"
    @refuel="refuelVehicle"
  />
  <MapView
    :query="query"
    :showHistory="showHistory"
    :activePlate="activePlate"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MapView from './components/MapView.vue'
import VehicleList from './components/VehicleList.vue'
import { useVehicles } from './composables/useVehicles'

const query = ref('')
const showHistory = ref(true)
const activePlate = ref<string | null>(null)

const { items, fetchVehicles } = useVehicles(() => query.value)
const vehicles = items

watch(query, () => {
  fetchVehicles()
})

function handleSelectVehicle(plate: string) {
  activePlate.value = plate
}

async function refuelVehicle(plate: string) {
  console.log('Abastecer veículo', plate)

  await fetch(`${import.meta.env.VITE_API_URL}/vehicles/${plate}/refuel`, {
    method: 'POST',
  })

  await fetchVehicles()
}
</script>

<style scoped>
.topbar {
  background: #0f1b3d;
  color: #fff;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 14px;
}

.search {
  background: #0f1b3d;
  border: 1px solid #2a3a6a;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
}

.toggle {
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
