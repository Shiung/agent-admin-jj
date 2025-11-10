import { ref } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import type{ ConfigInfoData } from '@/apis/codegen/data-contracts'

export const useGlobalStore = defineStore('global', () => {
  const tabbarHeight = ref(0)
  const configInfo = ref<ConfigInfoData>({
    BankList: [],
    RealPackageIdNameMap: [],
  })

  const fetchConfigInfo = async () => {
    const res = await API.admin.getConfigInfo()
    if (res.data.Code !== 200) return
    configInfo.value = res.data.Data
  }

  return {
    tabbarHeight,
    configInfo,
    fetchConfigInfo,
  }
})
