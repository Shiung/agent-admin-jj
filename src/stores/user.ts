import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import { setHeaderToken } from '@/apis/api-client'
import { useGlobalStore } from '@/stores/global'
import { useGameStore } from '@/stores/game'
import { type AccountInfoData, type SubAgentItem, type AgentCreditLimitPermissionData } from '@/apis/codegen/data-contracts'

export const useUserStore = defineStore('user', () => {
  const globalStore = useGlobalStore()
  const gameStore = useGameStore()

  const token = ref<string | null>(localStorage.getItem('userToken') || null)
  const userInfo = ref<Record<string, any> | null>(null)
  const accountInfo = ref<AccountInfoData | null>(null)
  const agentCreditLimitPermission = ref<AgentCreditLimitPermissionData | null>(null)
  const commissionWalletBalance = ref(0)
  const creditWalletBalance = ref(0)
  const depositLimitInfo = ref<{
    minAmount: number
    maxAmount: number
    dailyAmount: number
    maxWithdrawMultiple: number
    isActive: number
    isShowMultiple: number
  } | null>(null)
  const transferLimitInfo = ref<{
    minAmount: number
    maxAmount: number
    dailyAmount: number
    isActive: number
  } | null>(null)

  /** 是否為單層代理（AccountType: 1=单层代理,2=多层代理-单费率,3=多层代理-多费率(目前無3)） */
  const isSingleAgent = computed(() => userInfo.value?.NetCashAccount.AccountType === 1)
  /** 有無團隊 (單層代理而且TeamId > 0) */
  const hasTeam = computed(() => isSingleAgent.value && userInfo.value?.NetCashAccount.TeamId > 0)
  /** 是否為主線 (IsMain: 1=主线, 2=副线, 0=其他(多层代理)) */
  const isMainLine = computed(() => userInfo.value?.NetCashAccount.IsMain !== 2)
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

  // 下级代理列表（共享数据，避免重复调用 API）
  const subAgentList = ref<SubAgentItem[]>([])
  const subAgentListLoaded = ref(false) // 是否已加载

  /** 当前登录代理的层级 */
  const currentAdminLevel = computed(() => userInfo.value?.NetCashAccount?.AccountLevel || 1)

  /** 自身的 AdminId */
  const selfAdminId = computed(() => {
    const firstAgent = subAgentList.value[0]
    return firstAgent ? firstAgent.AdminId : null
  })

  /** 下级代理的最大层级 */
  const maxSubAgentLevel = computed(() => {
    if (subAgentList.value.length === 0) return currentAdminLevel.value
    return Math.max(...subAgentList.value.map(a => a.AccountLevel))
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
    subAgentList.value = []
    subAgentListLoaded.value = false
    agentCreditLimitPermission.value = null
  }

  // 获取佣金余额
  const fetchCommissionBalance = async () => {
    try {
      const overviewRes = await API.finance.getCommissionOverview()
      if (overviewRes.data.Code === 200) {
        commissionWalletBalance.value = overviewRes.data.Data.Available || 0
      }
    } catch (error) {
      console.error("Failed to fetch commission balance:", error)
    }
  }

  // 获取额度余额和限额信息
  const fetchCreditBalanceAndLimits = async () => {
    try {
      const balanceRes = await API.finance.getAccountBalance()

      if (balanceRes.data.Code === 200) {
        creditWalletBalance.value = balanceRes.data.Data.Items.Credit || 0

        if (balanceRes.data.Data.Items3) {
          depositLimitInfo.value = {
            minAmount: (balanceRes.data.Data.Items3.MinDepositAmount || 0) / 100,
            maxAmount: (balanceRes.data.Data.Items3.MaxDepositAmount || 0) / 100,
            dailyAmount: (balanceRes.data.Data.Items3.DailyDepositAmount || 0) / 100,
            maxWithdrawMultiple: balanceRes.data.Data.Items3.WithdrawWaterMultiply || 1,
            isActive: balanceRes.data.Data.IsActiveLimit3 || 0,
            isShowMultiple: balanceRes.data.Data.IsShowMultiple || 0,
          }
        }

        if (balanceRes.data.Data.Items2) {
          transferLimitInfo.value = {
            minAmount: (balanceRes.data.Data.Items2.MinTransferAmount || 0) / 100,
            maxAmount: (balanceRes.data.Data.Items2.MaxTransferAmount || 0) / 100,
            dailyAmount: (balanceRes.data.Data.Items2.DailyTransferAmount || 0) / 100,
            isActive: balanceRes.data.Data.IsActiveTransfer || 0,
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch credit balance and limits:", error)
    }
  }

  // 同时获取佣金和额度余额及限额信息（便捷方法）
  const fetchUserBalancesAndLimits = async () => {
    try {
      await Promise.all([
        fetchCommissionBalance(),
        fetchCreditBalanceAndLimits()
      ])
    } catch (error) {
      console.error("Failed to fetch user balances and limits:", error)
    }
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

  // 获取下级代理列表（只在第一次调用时请求 API）
  const fetchSubAgentList = async (forceRefresh = false) => {
    // 如果已加载且不强制刷新，直接返回
    if (subAgentListLoaded.value && !forceRefresh) {
      return subAgentList.value
    }

    try {
      const response = await API.admin.getSubAgentList()
      if (response.data.Code === 200) {
        subAgentList.value = response.data.Data || []
        subAgentListLoaded.value = true
        return subAgentList.value
      }
    } catch (err) {
      console.error('获取下级代理列表失败:', err)
    }
    return []
  }

  // 获取代存权限
  const fetchAgentCreditLimitPermission = async () => {
    try {
      const response = await API.system.agentCreditLimitPermission()
      if (response.data.Code === 200) {
        agentCreditLimitPermission.value = response.data.Data
        return response.data.Data
      }
    } catch (err) {
      console.error('获取代存权限失败:', err)
    }
    return null
  }

  return {
    token,
    userInfo,
    accountInfo,
    agentCreditLimitPermission,
    commissionWalletBalance,
    creditWalletBalance,
    depositLimitInfo,
    transferLimitInfo,
    isSingleAgent,
    hasTeam,
    isMainLine,
    productPackages,
    playerInfoPermission,
    subAgentList,
    subAgentListLoaded,
    currentAdminLevel,
    selfAdminId,
    maxSubAgentLevel,
    setToken,
    logout,
    fetchIsLogin,
    ensureUser,
    fetchAccountInfo,
    fetchSubAgentList,
    fetchAgentCreditLimitPermission,
    fetchCommissionBalance,
    fetchCreditBalanceAndLimits,
    fetchUserBalancesAndLimits,
  }
})
