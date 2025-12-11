<script setup lang="ts">
import { ref } from 'vue'
import { watchOnce } from '@vueuse/core'

const filtersBox = ref<HTMLDivElement>()

watchOnce(filtersBox, (el) => {
  el?.addEventListener('touchstart', (e) => {
    e.stopPropagation()
  }, { passive: true })
})
</script>

<template>
  <div class="flex px-4 my-2 overflow-x-auto space-x-2" ref="filtersBox">
    <slot />
  </div>
</template>