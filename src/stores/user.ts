import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import { setHeaderToken } from '@/apis/api-client'
import { useGlobalStore } from '@/stores/global'
import { useGameStore } from '@/stores/game'

export const useUserStore = defineStore('user', () => {
  const globalStore = useGlobalStore()
  const gameStore = useGameStore()

  const token = ref<string | null>(localStorage.getItem('userToken') || null)
  const userInfo = ref<Record<string, any> | null>(null)

  /** 是否為單層代理（AccountType: 1=单层代理,2=多层代理-单费率,3=多层代理-多费率(目前無3)） */
  const isSingleAgent = computed(() => userInfo.value?.AccountType === 1)

  watch(userInfo, (newVal) => {
    if (!newVal) return

    const t = newVal.Token
    if (!t) return

    setToken(t)
    setHeaderToken(t)

    // 登入後需要的初始化
    globalStore.fetchConfigInfo()
    gameStore.fetchSolidConfig()
  })

  const setToken = (t: string | null) => {
    token.value = t
    if (t) {
      localStorage.setItem('userToken', t)
      setHeaderToken(t)
    } else {
      localStorage.removeItem('userToken')
      setHeaderToken('')
    }
  }

  // 登出
  const logout = () => {
    setToken(null)
    userInfo.value = null
  }

  const fetchIsLogin = async () => {
    const res = await API.system.isLogin()
    if (res.data.Code !== 200) {
      throw new Error('isLogin failed')
    }
    userInfo.value = res.data.Data
    return res.data.Data
  }

  const ensureUser = async () => {
    const storedToken = token.value || localStorage.getItem('userToken')
    if (!storedToken) return null

    if (!token.value) {
      setToken(storedToken)
    }

    if (userInfo.value) {
      return userInfo.value
    }

    return await fetchIsLogin()
  }

  return {
    token,
    userInfo,
    isSingleAgent,
    setToken,
    logout,
    fetchIsLogin,
    ensureUser,
  }
})
