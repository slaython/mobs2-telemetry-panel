<template><label><input type="checkbox" v-model="model"> Mostrar histórico</label></template>
<script setup lang="ts">
const model = defineModel<boolean>({ default: true })
</script>
