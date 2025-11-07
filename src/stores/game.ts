import { ref,computed } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import type{ SolidConfigData } from '@/apis/codegen/data-contracts'

export const useGameStore = defineStore('game', () => {
  const solidConfig = ref<SolidConfigData>({ GameSetting: [] })

  const allGameTypeMapping = computed(() => {
    const allGameType = solidConfig.value.GameSetting.find((item) => item.Type === 'allGameType')
    return JSON.parse(allGameType?.Value ?? '{}') as Record<string, string>
  })

  const fetchSolidConfig = async () => {
    const res = await API.game.getSolidConfig()
    if (res.data.Code !== 200) return
    solidConfig.value = res.data.Data
  }

  return {
    solidConfig,
    allGameTypeMapping,
  
    fetchSolidConfig,
  }
})
