import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { setHeaderToken } from '@/apis/api-client'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<Record<string, any> | null>(null)

  watch(userInfo, (newVal) => {
    if (!newVal) return
    localStorage.setItem('userToken', newVal.Token)
    setHeaderToken(newVal.Token)
  })

  return { userInfo }
})
