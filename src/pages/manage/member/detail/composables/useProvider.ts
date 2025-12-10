import { computed, onMounted, provide, reactive, readonly } from 'vue'
import type { InjectionKey, ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import API from '@/apis/index'
import dayjs from 'dayjs'

type State = {
  playerInfoLoading: boolean
  playerInfo: Awaited<ReturnType<typeof API.playerManage.getPlayerdetailv2>>['data']['Data'] | null
  playerId: number
  rechargeTypeList: Awaited<ReturnType<typeof API.apiConfig.getRechargetypelist>>['data']['Data']
}

type Computeds = {
  rechargeTypeMapping: ComputedRef<Map<number, State['rechargeTypeList'][number]>>
  playerInfoPermission: ComputedRef<ReturnType<typeof useUserStore>['playerInfoPermission']>
}

const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })

export const ProviderStateSymbol: InjectionKey<Readonly<State>> = Symbol('detailState')
export const ProvideComputedSymbol: InjectionKey<Readonly<Computeds>> = Symbol('detailComputed')
export const ProviderActionSymbol: InjectionKey<{
  fetchPlayerDetail: (startTime?: number, endTime?: number) => void
}> = Symbol('detailAction')

export default function useProvider() {
  const route = useRoute()
  const userStore = useUserStore()

  const states = reactive<State>({
    playerInfoLoading: false,
    playerInfo: null,
    playerId: Number(route.params.id),
    rechargeTypeList: []
  })

  const playerInfoPermission = computed(() => userStore.playerInfoPermission)

  const rechargeTypeMapping = computed(() => {
    const ls = new Map()
    states.rechargeTypeList.forEach((r) => {
      if (ls.has(r.Key)) return
      ls.set(r.Key, r)
    })

    /** 其他Key copy from 1.0  */ 
    const otherKey = [
      { Key: 111, Name: "充值调整" },
      { Key: 137, Name: "佣金代存" },
      { Key: 138, Name: "額度代存" },
      { Key: 22, Name: "代客充值" },
      { Key: -2, Name: "代客充值" },
      { Key: -10, Name: "充值调整" },
    ]

    otherKey.forEach((o) => {
      if (ls.has(o.Key)) return
      ls.set(o.Key, o)
    })

    return ls
  })

  const fetchRechargeTypeLs = async () => {
    try {
      const res = await API.apiConfig.getRechargetypelist()
      states.rechargeTypeList = res.data.Data
    } catch (e) {
      console.warn('[error]: fetchRechargeTypeLs =>', e)
    }
  }

  const fetchPlayerDetail = async (
    startTime: number = dayjs().startOf('month').unix(),
    endTime: number = dayjs().endOf('month').unix()
  ) => {
    const playerId = route.params.id
    if (!playerId) return
    states.playerInfoLoading = true
    try {
      const res = await API.playerManage.getPlayerdetailv2({ PlayerId: Number(playerId), ReportTimeBegin: startTime,ReportTimeEnd: endTime })
      states.playerInfo = res.data.Data
    } catch (e) {
      console.warn('[error]: fetchPlayerDetail =>', e)
    } finally {
      states.playerInfoLoading = false
    }
  }
  
  provide(ProviderStateSymbol, states)
  provide(ProvideComputedSymbol, {
    rechargeTypeMapping,
    playerInfoPermission
  })
  provide(ProviderActionSymbol, {
    fetchPlayerDetail
  })

  const initFetch = async () => {
    await Promise.allSettled([fetchPlayerDetail(), fetchRechargeTypeLs()]).then(() => {
      loading.close()
    })
  }

  onMounted(() => {
    initFetch()
  })

  return {
    states: readonly(states),
    playerInfoPermission,
    fetchPlayerDetail
  }
}