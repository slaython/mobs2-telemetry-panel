<template><input type="text" v-model="model" placeholder="Buscar por placa..."/></template>
<script setup lang="ts">
const model = defineModel<string>()
</script>

