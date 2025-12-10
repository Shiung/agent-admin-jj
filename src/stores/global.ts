import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import type { ConfigInfoData, SystemConfigData, BankList } from '@/apis/codegen/data-contracts'

export const useGlobalStore = defineStore('global', () => {
  const configInfo = ref<ConfigInfoData>({
    BankList: [],
    RealPackageIdNameMap: [],
  })

  const fetchConfigInfo = async () => {
    const res = await API.admin.getConfigInfo()
    if (res.data.Code !== 200) return
    configInfo.value = res.data.Data
  }

  const systemConfig = ref<SystemConfigData>({
    PhoneRegister: 0,
    PhoneVerify: 0,
    PhoneBind: 0,
    EmailRegister: 0,
    EmailVerify: 0,
    EmailBind: 0,
    GoogleVerify: 0,
    GoogleBind: 0,
    PupUp: 0,
    Tips: '',
    AgentId: 0,
  })

  const fetchSystemConfig = async () => {
    const target = import.meta.env.VITE_PROXY_TARGET
    const Domain = new URL(target).hostname
    const res = await API.admin.getSystemConfig({ Domain })
    if (res.data.Code !== 200) return
    systemConfig.value = res.data.Data
  }

  const bankMapping = computed<Record<string, BankList>>(() => {
    const list = configInfo?.value.BankList
    if (!list) return {}
    return list.reduce((acc, cur) => {
      acc[cur.BankCode] = cur
      return acc
    }, {} as Record<string, BankList>)
  })

  return {
    configInfo,
    fetchConfigInfo,
    systemConfig,
    fetchSystemConfig,
    bankMapping
  }
})
