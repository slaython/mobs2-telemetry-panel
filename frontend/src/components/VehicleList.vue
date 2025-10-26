<template>
  <div class="list-wrapper">
    <div
      v-for="v in vehicles"
      :key="v.plate"
      class="vehicle-row"
      :class="{ active: v.plate === activePlate }"
    >
      <div class="row-main" @click="$emit('select', v.plate)">
        <div class="plate">{{ v.plate }}</div>
        <div class="meta">
          <span class="speed">{{ v.speed?.toFixed(0) }} km/h</span>

          <span
            class="fuel"
            :class="{ low: v.fuel <= 5 }"
          >
            {{ v.fuel?.toFixed(0) }}% combustível
          </span>

          <span class="time">{{ formatTs(v.timestamp) }}</span>
        </div>
      </div>

      <button
        class="refuel-btn"
        @click.stop="$emit('refuel', v.plate)"
      >
        Abastecer
      </button>
    </div>

    <div v-if="vehicles.length === 0" class="empty">
      Nenhum veículo encontrado
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  vehicles: any[]
  activePlate: string | null
}>()

function formatTs(ts: string) {
  return new Date(ts).toLocaleString()
}
</script>

<style scoped>
.list-wrapper {
  background: #0f1b3d;
  color: #fff;
  font-size: 13px;
  border-bottom: 1px solid #1f2c55;
  max-height: 160px;
  overflow-y: auto;
}

.vehicle-row {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  transition: background 0.12s;
  cursor: pointer;
}

.vehicle-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

.vehicle-row.active {
  background: rgba(33,150,243,0.18);
}

.row-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plate {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

.refuel-btn {
  align-self: flex-end;
  background: #43a047;
  border: none;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.refuel-btn:hover {
  background: #2e7d32;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #9bb1ff;
  line-height: 1.2;
  font-size: 12px;
}

.speed {
  color: #4dd0e1;
}

.fuel {
  color: #aed581;
}

.fuel.low {
  color: #ff7043;
  font-weight: 600;
}

.time {
  color: #fff9c4;
}

.empty {
  text-align: center;
  padding: 16px;
  color: #8a93c7;
}
</style>
