<script setup lang="ts">
import { ref } from 'vue'
import Dropdown from '@/components/Dropdown/index.vue'

const options = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
]

const selectedValue = ref(1)
</script>

<template>
  <div>
    <h1>运营数据 {{ selectedValue }}</h1>
    <Dropdown v-model="selectedValue" :options="options" />
  </div>
</template>

<style scoped></style>