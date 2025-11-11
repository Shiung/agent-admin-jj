import { provide, reactive, onMounted, computed, watchEffect } from 'vue'
import type { ComputedRef, InjectionKey } from 'vue'
import API from '@/apis'
import type {
  PromotionlinkListV2ResponseData,
  PromotionmaterialsListallResponseData,
  PromotionmaterialsListallRequest,
  PromotionconfListallResponseData,
  PromotionconfListallRequest,
  DomainType
} from '@/apis/codegen/data-contracts'

type State = {
  dataLs: {
    /** 代理清單 */
    agent: Array<PromotionlinkListV2ResponseData>
    /** 專屬清單 */
    exclusive: Array<PromotionlinkListV2ResponseData>
  }
  materialLs: Array<PromotionmaterialsListallResponseData>
  confList: {
    size: Array<PromotionconfListallResponseData>
    theme: Array<PromotionconfListallResponseData>
  }
  domainType: DomainType
}

type Computeds = {
  packageIdGroupByLs: ComputedRef<(pid: number) => Array<PromotionlinkListV2ResponseData>>
  materialLsSelectByPid: ComputedRef<(pid: number) => Array<PromotionmaterialsListallResponseData>> // 
}

export const PromoteStateSymbol: InjectionKey<Readonly<State>> = Symbol('promoteState')
export const PromoteComputeSymbol: InjectionKey<Readonly<Computeds>> = Symbol('promoteComputed')
export const PromoteActionSymbol: InjectionKey<{
  updateDomainType: (v: DomainType) => void
  fetchMaterialLs: (params: PromotionmaterialsListallRequest) => Promise<void>
}> = Symbol('promoteAction')

export const usePromote = () => {
  const states = reactive<State>({
    dataLs: {
      agent: [],
      exclusive: []
    },
    materialLs: [],
    confList: {
      size: [],
      theme: []
    },
    domainType: 0
  })

  const packageIdGroupByLs = computed(() => {
    const ls = [...states.dataLs.agent ?? [], ...states.dataLs.exclusive ?? []].reduce<{ [key in number]: Array<PromotionlinkListV2ResponseData> }>((sum, cur) => {
      const packageId = cur.PackageId
      const hasDataLs = sum?.[packageId] ?? []      
      return {
          ...sum,
          [packageId]: hasDataLs.concat(cur)
        }

    }, {})
    return (pid: number = 0) => ls[pid] ?? []
  })

  const materialLsSelectByPid = computed(() => {
    const ls = states.materialLs
    return (pid: number) => {
      return ls.filter((m) => m.PackageId === pid)
    }
  })

  const fetchPromotConf = async (Type: PromotionconfListallRequest['Type']) => {
    return await API.admin.getPromotionconfListall({ Type })
  }

  const fetchPromoteList = async () => {
    await Promise.allSettled([
      API.admin.getPromoteListV2({ NetCashDomainType: 0 }),
      API.admin.getPromoteListV2({ NetCashDomainType: 1 }),
      fetchPromotConf(1),
      fetchPromotConf(2),
    ]).then(([res1, res2, res3, res4]) => {
      if (res1.status === 'fulfilled') {
        states.dataLs.agent = res1.value.data.Data.Items
      }
      if (res2.status === 'fulfilled') {
        states.dataLs.exclusive = res2.value.data.Data.Items
      }
      if (res3.status === 'fulfilled') {
        states.confList.size = res3.value.data.Data.Items
      }
      if (res4.status === 'fulfilled') {
        states.confList.theme = res4.value.data.Data.Items
      }
    })

  }

  const fetchMaterialLs = async (params: PromotionmaterialsListallRequest) => {
    try {
      const res = await API.admin.getPromotionmaterialsListall(params)
      if (res.data.Code === 200) {
        states.materialLs = res.data.Data.Items
      } else {
        throw res
      }
    } catch (e) {
      console.warn('[fetchMaterialLs error]:', e)
    }

  }

  provide(PromoteStateSymbol, states)
  provide(PromoteComputeSymbol, {
    packageIdGroupByLs,
    materialLsSelectByPid,
  })
  provide(PromoteActionSymbol, {
    updateDomainType: (v) => states.domainType = v,
    fetchMaterialLs
  })

  onMounted(() => {
    fetchPromoteList()
  })
}