import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import { setHeaderToken } from '@/apis/api-client'
import { useGlobalStore } from '@/stores/global'
import { useGameStore } from '@/stores/game'
import { type AccountInfoData } from '@/apis/codegen/data-contracts'

export const useUserStore = defineStore('user', () => {
  const globalStore = useGlobalStore()
  const gameStore = useGameStore()

  const token = ref<string | null>(localStorage.getItem('userToken') || null)
  const userInfo = ref<Record<string, any> | null>(null)
  const accountInfo = ref<AccountInfoData | null>(null)
  const googleSecretCode = ref<{ Secret?: string; QrCode?: string } | null>(null)

  /** 是否為單層代理（AccountType: 1=单层代理,2=多层代理-单费率,3=多层代理-多费率(目前無3)） */
  const isSingleAgent = computed(() => userInfo.value?.NetCashAccount.AccountType === 1)
  /** 有無團隊 (單層代理而且TeamId > 0) */
  const hasTeam = computed(() => isSingleAgent.value && userInfo.value?.NetCashAccount.TeamId > 0)
  /** 代理底下的產品包 */
  const productPackages = computed(() => {
    const packageIds = userInfo.value?.Admin.PackageId || ''
    const allPackageList = globalStore.configInfo?.RealPackageIdNameMap || []
    if (packageIds === '-1') return allPackageList
    const packageIdsList = packageIds.split(',')
    return allPackageList.filter((item) => packageIdsList.includes(String(item.PackageId)))
  })
  /**
   * 權限開關
   * api response 欄位 userInfo -> Admin -> `PlayerInfoPermission`
   * 會員資料顯示權限(位置1: 手機號 位置2: 銀行卡;0: 無權限 1: 有權限)(在雲平台 代理管理>记录查询>權限設置>會員資料顯示 設置)
   */
  const playerInfoPermission = computed(() => {
    const PlayerInfoPermission = (userInfo.value?.Admin.PlayerInfoPermission || '').split(',')
    return {
      phone: PlayerInfoPermission[0] === '1',
      card: PlayerInfoPermission[1] === '1',
    }
  })

  watch(userInfo, (newVal) => {
    if (!newVal) return

    const t = newVal.Token
    if (!t) return

    setToken(t)
    setHeaderToken(t)

    // 登入後需要的初始化
    globalStore.fetchConfigInfo()
    gameStore.fetchSolidConfig()
    fetchAccountInfo()
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

  const fetchAccountInfo = async () => {
    const res = await API.admin.getAccountInfo()
    if (res.data.Code !== 200) return
    accountInfo.value = res.data.Data
    return res.data.Data
  }

  return {
    token,
    userInfo,
    accountInfo,
    isSingleAgent,
    hasTeam,
    productPackages,
    playerInfoPermission,
    googleSecretCode,
    setToken,
    logout,
    fetchIsLogin,
    ensureUser,
    fetchAccountInfo
  }
})
