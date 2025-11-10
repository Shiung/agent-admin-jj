import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { setHeaderToken } from '@/apis/api-client'
import { useGlobalStore } from '@/stores/global'
import { useGameStore } from '@/stores/game'

export const useUserStore = defineStore('user', () => {
  const globalStore = useGlobalStore()
  const gameStore = useGameStore()

  const userInfo = ref<Record<string, any> | null>(null)

  watch(userInfo, (newVal) => {
    if (!newVal) return
    localStorage.setItem('userToken', newVal.Token)
    setHeaderToken(newVal.Token)
  
    globalStore.fetchConfigInfo()
    gameStore.fetchSolidConfig()
  })

  return { userInfo }
})
