<script setup lang="ts">
import { ref, computed, defineComponent, h, watch, useAttrs, onMounted, watchEffect } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import API from '@/apis/index'
import type { GamedetailRequest } from '@/apis/codegen/NetCashPlayerGame/types'
import dayjs from 'dayjs'
import { cn } from '@/utils/className'
import { formatSignedMoney, formatMoney } from '@/utils/formatNumber'

import type AdvancedBottomSheet from '@/components/AdvancedBottomSheet/index.vue'
import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'
import { useGameStore } from '@/stores/game'
import { useClipboard } from '@vueuse/core'
import FilterBox from '../../components/FilterBox.vue'

defineProps<{
  /** 注单记录 page: /mine/betRecord */
  betRecordMode?: boolean
}>()

const advanceKeyMap = {
  timeRange: 'TimeRange',
  selectTimeType: 'SelectTimeType',
  gameType: 'GameType'
}

const selectTimeTypeMap = {
  1: '下注时间',
  2: '结算时间',
  3: '开赛时间'
}

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const playerId = computed<number | undefined>(() => attrs.playerId as number)
const gameStore = useGameStore()

const gameListConf = ref<Awaited<ReturnType<typeof API.game.getGameListConfig>>['data']['Data']>([])

const infinityRef = ref<InfinityExposeType>()
const moreItems = ref<Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['MoreItems'] | null>(null)
const selectTimeType = ref<GamedetailRequest['SelectTimeType']>(2)
const selectBetStatus = ref<0 | 1 | 2 | -1>(0)

const showTimeAdvanced = ref<boolean>(false)
const showGameTypeAdvanced = ref<boolean>(false)
const timeRange = ref<{ startTime: number; endTime: number; label?: string } >({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix(),
  label: '本月'
})

const gameTypeLs = ref<Array<string>>([])

const showTimeRangeTitle = computed(() => {
  const selectTimeTypeName = selectTimeTypeMap[selectTimeType.value]
  const { startTime, endTime, label } = timeRange.value
  const formatTime = (ts: number) => dayjs.unix(ts).format('YYYY-MM-DD')
  return `${selectTimeTypeName} | ${label ? label : `${formatTime(startTime)} 至 ${formatTime(endTime)}`}`
})

const showProductFilterTitle = computed(() => {
  const productLs = gameTypeLs.value
  return productLs.length > 0 ? `場館(${productLs.length})` : '全部場館'
})


const advancedTimeLs = computed<InstanceType<typeof AdvancedBottomSheet>['$props']['ls']>(() => {
  return [
    {
      key: advanceKeyMap.selectTimeType,
      title: '计算方式',
      type: 'radio',
      list: [
        { label: '结算时间', value: 2 },
        { label: '下注时间', value: 1 },
        { label: '开赛时间', value: 3 },
      ],
      defaultSelected: 2
    },
    { key: advanceKeyMap.timeRange, title: '时间区间', type: 'time', timeDisableAll: true, defaultSelected: 'thisMonth' },
  ]
})

const advancedGameType = computed<InstanceType<typeof AdvancedBottomSheet>['$props']['ls']>(() => {
  return gameListConf.value.map((g, idx) => {
    return { key: `${advanceKeyMap.gameType}-${idx}`, title: g.PlatformName, type: 'checkbox', list: g.Games.map((i) => ({
      label: i.Name,
      value: i.GameCode
    })) }
  })
})

const BetStatus = [
  { label: '全部状态', value: 0 },
  { label: '已结算', value: 1 },
  { label: '已取消', value: 2 },
  { label: '未结算', value: -1 }
]

const sortOptions = ref([
  { value: '-SettlementTime', label: '结算时间降序' },
  { value: '+SettlementTime', label: '结算时间升序' },
  { value: '-CompanyWinLose', label: '盈利降序' },
  { value: '+CompanyWinLose', label: '盈利升序' },
])

const selectedSort = ref(sortOptions.value[0]?.value ?? '-SettlementTime')

const sum = computed(() => ([
  { id: 'sumBet', title: '投注金额', amount: moreItems.value?.SumBetGold ?? 0 },
  { id: 'sumValid', title: '有效投注', amount: moreItems.value?.SumValidWater ?? 0 },
  { id: 'winLose', title: '总盈利', amount: moreItems.value?.SumProfitGold ?? 0 },
]))

const SumAmount = defineComponent(
  (props: { val: number, useColor?: boolean }, { attrs }) => {
    const returnVal = computed(() => {
      let returnText, returnColor
      if (props.useColor) {
        const { text, color } = formatSignedMoney(props.val ?? 0, 2, false)
        returnText = text
        returnColor = color
      } else {
        returnText = formatMoney(props.val ?? 0, 2, true)
      }

      return {
        text: returnText,
        color: returnColor
      }
    })

    return () => h('div', { class: cn(attrs.class ?? '', props.useColor && returnVal.value.color)}, returnVal.value.text ?? '')
  },
  {
    props: ['useColor', 'val'],
    inheritAttrs: false
  }
)

const SumBlock = defineComponent(
  (props: { item: Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['Items'][number] }, { attrs }) => {
    const ls = computed(() => {
      const { Status, BetGold, TotalBetGold, ValidWater, CompanyWinLose } = props.item
      let showBet: number
      switch (Status) {
        case -1:
        case 1:
          showBet = BetGold
          break
        case 2:
          showBet = TotalBetGold
        break
        default: {}
      }

      const showValue = (type: string) => {
        if (type === 'sumBet') return showBet
        if (type === 'sumValid') return ValidWater
        if (type === 'winLose') return CompanyWinLose
        return 0
      }

      return ['sumBet', 'sumValid', 'winLose'].map((t) => ({
        id: t,
        title: t === 'winLose' ? '盈利' : sum.value.find(s => s.id === t)?.title,
        value: showValue(t)
      }))
    })

    return () => ls.value.map((l) => {
      return h('div', { class: 'flex-1 flex flex-col items-center justify-center' }, [
        h('div', { class: 'text-xs text-neutral2-secondary' }, l.title),
        h(SumAmount, { class: 'text-sm font-semibold text-neutral2-basic', val: l.value, ...(l.id === 'winLose' && { useColor: true }) }, )
      ])
    })
  },
  {
    props: ['item'],
    inheritAttrs: false
  }
)

const Status = defineComponent(
  (props: { status: number }, { attrs }) => {
    const returnVal = computed(() => {
      let color
      switch (props.status) {
        /** 已结算 */
        case 1: {
          color = 'text-success-normal border-success-normal/50 bg-success-normal/10'
          break
        }
        /** 已取消  */
        case 2: {
          color = 'text-error-normal border-error-normal/50 bg-error-normal/10'
          break
        }
        /** 未结算 */
        case -1: {
          color = 'text-neutral2-secondary border-neutral2-secondary/50 bg-neutral2-secondary/10'
          break
        }
        default: {}
      }
      return {
        text: BetStatus.find(s => s.value === props.status)?.label ?? '',
        color
      }
    })
    return () => h('div', { class: cn(attrs.class ?? '', returnVal.value.color) }, returnVal.value?.text)
  },
  {
    props: ['status'],
    inheritAttrs: false
  }
)

const ShowTime = defineComponent(
  (props: { item: Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['Items'][number] }, { attrs }) => {
    const dateTransfer = (ts: number | string | null | undefined) => {
      if (!ts) return '-'
      const num = Number(ts)
      if (isNaN(num)) return '-'
      return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
    }
    const timeTransfer = computed(() => {
      const { TransactionTime, SettlementTime, SportDetails, LiveDetails, GameLiveDetails} = props.item
      let selectTime
      switch (selectTimeType.value) {
        /** 1:下注时间 */
        case 1:
          selectTime = TransactionTime
          break
        /** 2:结算时间  */
        case 2:
          selectTime = SettlementTime
          break
        /** 3:开赛时间 (依照体育、直播、真人取不同的资料) */
        case 3:
          // @ts-expect-error: GameLiveDetails[] LiveDetails[] spec 沒有定義 GameStartTime 
          selectTime = SportDetails?.[0]?.GameStartTime || GameLiveDetails?.[0]?.GameStartTime || LiveDetails?.[0]?.GameStartTime
          break
        default: {}
      }

      return dateTransfer(selectTime)
    })
    return () => h('div', { class: attrs.class }, timeTransfer.value)
  },
  {
    props: ['item'],
    inheritAttrs: false
  }
)

const fetchGameListConfig = async () => {
  try {
    const res = await API.game.getGameListConfig({ AgentVisible: true })
    gameListConf.value = res.data.Data ?? []
  } catch (e) {
    console.warn('fetchGameListConfig [error]:', e)
  }
}

const fetchData = async (page: number = 0) => {
  try {
    const res = await API.netCashPlayerGame.getGameDetail({
      BeginTime: timeRange.value.startTime,
      EndTime: timeRange.value.endTime,
      ...(playerId.value && { PlayerId: playerId.value }),
      ...(gameTypeLs.value.length > 0 && { GameType: gameTypeLs.value.join() }),
      ...(selectBetStatus.value && { Status: selectBetStatus.value }),
      Sort: selectedSort.value,
      SelectTimeType: selectTimeType.value,
      Page: page,
      PageSize: 10
    })

    moreItems.value = res.data.Data.MoreItems
    return {
      data: res.data.Data.Items,
      paging: res.data.Data.Pagination
    }
  } catch (e) {
    console.warn('fetchData outside', e)
    return { data: [], paging: null }
  }
}

const timeFilterHandler = (ls: Map<string, any>) => {
  advancedTimeLs.value.forEach((l) => {
    const getVal = ls.get(l.key)
    switch (l.key) {
      case advanceKeyMap.selectTimeType: {
        selectTimeType.value = getVal
        break
      }
      case advanceKeyMap.timeRange: {
        timeRange.value  = getVal
        break
      }
    }
  })
}

const gameTypeHandler = (ls: Map<string, any>) => {
  gameTypeLs.value = [...ls.values()].flat()
}

const showDetail = ref<boolean>(false)
const detailRaw = ref<Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['Items'][number] | null>(null)

const showDetailHandler = (item: Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['Items'][number]) => {
  detailRaw.value = item
  showDetail.value = true
}

const copyHadandler = (c: string) => {
  useClipboard().copy(c)
  showToast({ message: '复制成功' })
}

const emit = defineEmits<{
  (e: 'sumInfo', value: Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['MoreItems'] | null): void 
}>()

watchEffect(() => {
  emit('sumInfo', moreItems.value)
})

watch([selectTimeType, timeRange, gameTypeLs, selectBetStatus, playerId, selectedSort], () => {
  infinityRef.value?.fetchData()
})

onMounted(() => {
  fetchGameListConfig()
})

</script>

<template>
  <div class="flex-1 flex flex-col">
    <FilterBox>
      <AdvancedBottomSheet v-model:show="showTimeAdvanced" :title="showTimeRangeTitle" sheet-title="时间筛选" :ls="advancedTimeLs" @change="timeFilterHandler" />
      <AdvancedBottomSheet v-model:show="showGameTypeAdvanced" :title="showProductFilterTitle" :ls="advancedGameType" @change="gameTypeHandler" />
      <Filled v-model:model-value="selectBetStatus" :options="BetStatus" />
      <Filled v-model:model-value="selectedSort" :options="sortOptions" />
    </FilterBox>

    <InfinityScroll
      ref="infinityRef"
      :fetch-action="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-3">
          <UnitCard v-if="!betRecordMode" class=" border border-primary-50 shadow-none">
            <template #header>
              <div class="flex items-center space-x-1">
                <span class="text-sm font-semibold text-neutral2-basic">场馆总计</span>
                <AppTooltip content-side="bottom" >
                  <van-icon name="info" class="text-primary-normal" />
                  <template #content>
                    <span>数据仅统计「已结算」的订单</span>
                  </template>
                </AppTooltip>
              </div>
            </template>
            <div class="flex items-center justify-between py-3">
              <div v-for="(d) in sum" :key="d.id" class="flex-1 flex flex-col items-center justify-center">
                <div class="text-xs text-neutral2-secondary">{{ d.title }}</div>
                <SumAmount class="text-sm font-semibold text-neutral2-basic" :val="d.amount" v-bind="{ useColor: d.id === 'winLose' }" />
              </div>
            </div>
          </UnitCard>
          <UnitCard v-for="l in ls" :key="l.Id" class="relative" @click="showDetailHandler(l)">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral2-secondary space-x-1 flex items-center">
                  <div v-if="betRecordMode" class="text-sm font-semibold text-neutral2-basic">{{ gameStore.allGameTypeMapping[l.GameType] ?? '' }}</div>
                  <span>订单号</span>
                  <span>{{ l.TransactionId }}</span>
                  <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" @click.stop="copyHadandler(l.TransactionId)"/>
                </div>
                <Status class="text-xs px-2 border rounded-xl leading-5" :status="l.Status"/>
              </div>
            </template>
            <div class="flex items-center justify-between py-3">
              <SumBlock :item="l" />
            </div>
            <van-button round plain size="small" class="absolute! top-1/2 -right-1 shadow-[-1px_1px_6px_0px_rgba(0,0,0,0.15)] -translate-y-1/2">
              <van-icon name="arrow" class="w-3 text-neutral2-tertiary" />
            </van-button>

            <template #footer>
              <div class="flex justify-between items-center">
                <div v-if="betRecordMode" class="space-x-1 flex items-center">
                  <span class="text-sm font-semibold text-neutral2-basic">{{ l.LoginAccount }}</span>
                  <span class="text-xs font-normal text-neutral2-secondary">VIP{{ l.VipLevel ?? 0}}</span>
                </div>
                <div v-else class="text-xs text-neutral2-basic">{{ gameStore.allGameTypeMapping[l.GameType] ?? '' }}</div>
                <ShowTime class="text-xs text-neutral2-basic" :item="l" />
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
  <OrderDetailSheet v-model:show="showDetail" :raw-data="detailRaw" />
</template>