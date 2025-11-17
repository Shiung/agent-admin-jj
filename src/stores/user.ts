import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { setHeaderToken } from '@/apis/api-client'
import { useGlobalStore } from '@/stores/global'
import { useGameStore } from '@/stores/game'

export const useUserStore = defineStore('user', () => {
  const globalStore = useGlobalStore()
  const gameStore = useGameStore()

  const token = ref(localStorage.getItem('userToken') || null)
  const userInfo = ref<Record<string, any> | null>(null)

  // 是否正在登出 → 避免 logout 時 userInfo = null 觸發 watch 的邏輯
  const isLoggingOut = ref(false)

  watch(userInfo, (newVal) => {
    if (isLoggingOut.value) return
    if (!newVal) return

    const token = newVal.Token
    if (!token) return

    setToken(token)
    setHeaderToken(token)

    globalStore.fetchConfigInfo()
    gameStore.fetchSolidConfig()
  })

  const setToken = (t: string | null) => {
    token.value = t
    if (t) localStorage.setItem('userToken', t)
    else localStorage.removeItem('userToken')
  }

  const logout = () => {
    isLoggingOut.value = true

    setToken(null)
    setHeaderToken('')

    userInfo.value = null

    isLoggingOut.value = false
  }

  return { token, userInfo, setToken, logout }
})
