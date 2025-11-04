import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
  const tabbarHeight = ref(0)

  return { tabbarHeight }
})
