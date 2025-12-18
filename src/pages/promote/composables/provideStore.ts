import { provide, reactive, onMounted, computed, readonly } from 'vue'
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
  /** 初始化資料完成 */
  isReady: boolean
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
    isReady: false,
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
    const agentLs = JSON.parse(JSON.stringify(states.dataLs.agent ?? []))
    const exclusiveLs =  JSON.parse(JSON.stringify(states.dataLs.exclusive ?? []))
    const ls = [...agentLs, ...exclusiveLs].reduce<{ [key in number]: Array<PromotionlinkListV2ResponseData> }>((sum, cur) => {
      const packageId = cur.PackageId
      const hasDataLs = sum?.[packageId] ?? []

      /** 代理以及專屬 依照channel id 合併 */
      const hasSameChannelId = hasDataLs.find((l) => l.ChannelId === cur.ChannelId)
      if (hasSameChannelId) {
        hasSameChannelId.AppDomains.push(...cur.AppDomains)
        hasSameChannelId.H5Domains.push(...cur.H5Domains)
        return sum
      }

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
        const rebindDomain = res1.value.data.Data.Items.map((d) => {
          const cloneChannelId = d.CloneChanelId
          const channelId = d.ChannelId
          const appDomainsRebind = d.AppDomains.map((a) => ({ ...a, Domain: `${a.Domain}/${cloneChannelId ? `${cloneChannelId}/?ref=${channelId}` : channelId + '/'}`, originDomain: a.Domain }))
          const h5Domains = d.H5Domains.map((h) => ({ ...h, Domain: `${h.Domain}/?channelId=${channelId}`, originDomain: h.Domain }))
          return {
            ...d,
            AppDomains: appDomainsRebind,
            H5Domains: h5Domains
          }
        })
        states.dataLs.agent = rebindDomain
        // states.dataLs.agent = res1.value.data.Data.Items
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
    states.isReady = true
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

  return {
    states: readonly(states)
  }
}