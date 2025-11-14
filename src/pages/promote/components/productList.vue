<script setup lang="ts">
import { inject, computed } from 'vue'
import { PromoteStateSymbol } from '../composables/provideStore'
import productCard from './productCard.vue'

const state = inject(PromoteStateSymbol)!

const data = computed(() => {
  return state.domainType === 1 ? state.dataLs.exclusive : state.dataLs.agent
})

</script>

<template>
  <div v-if="data.length > 0" class="space-y-4">
    <product-card v-for="d in data" :product="d" :key="d.PackageId" />  
  </div>
  <empty v-else class="flex-1" />
</template>