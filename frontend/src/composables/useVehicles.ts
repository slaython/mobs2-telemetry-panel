import { ref, watchEffect } from 'vue'
export function useVehicles(queryRef: any) {
  const items = ref<any[]>([])
  const api = import.meta.env.VITE_API_URL
  async function fetchVehicles() {
    const url = new URL('/vehicles', api)
    if (queryRef.value) url.searchParams.set('plate', queryRef.value)
    items.value = await (await fetch(url)).json()
  }
  watchEffect(fetchVehicles)
  return { items, fetchVehicles }
}
