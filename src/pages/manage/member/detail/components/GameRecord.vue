<script setup lang="ts">
import { ref, inject, computed, defineComponent, h } from 'vue'
import UnitCard from '../../../components/UnitCard.vue'
import API from '@/apis/index'
import type { GamedetailRequest } from '@/apis/codegen/NetCashPlayerGame/types'
import dayjs from 'dayjs'
import { cn } from '@/utils/className'
import { formatSignedMoney, formatMoney } from '@/utils/formatNumber'

import { ProviderStateSymbol } from '../composables/useProvider'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const state = inject(ProviderStateSymbol)!
const moreItems = ref<Awaited<ReturnType<typeof API.netCashPlayerGame.getGameDetail>>['data']['Data']['MoreItems'] | null>(null)
const selectTimeType = ref<GamedetailRequest['SelectTimeType']>(2)

const BetStatus = [
  { label: '全部状态', value: 0 },
  { label: '已结算', value: 1 },
  { label: '已取消', value: 2 },
  { label: '未结算', value: -1 }
]

const sum = computed(() => ([
  { id: 'sumBet', title: '投注金额', amount: moreItems.value?.SumBetGold ?? 0 },
  { id: 'sumValid', title: '有效投注', amount: moreItems.value?.SumValidWater ?? 0 },
  { id: 'winLose', title: '总盈利', amount: moreItems.value?.SumPlayerWinLose ?? 0 },
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
      const { Status, BetGold, TotalBetGold, ValidWater, PlayerWinLose } = props.item
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
        if (type === 'winLose') return PlayerWinLose
        return 0
      }

      return ['sumBet', 'sumValid', 'winLose'].map((t) => ({
        id: t,
        title: sum.value.find(s => s.id === t)?.title,
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

const fetchData = async (page: number = 0) => {
  const startTime = 1751299200
  const endTime = dayjs().endOf('day').unix()

  try {
    const res = await API.netCashPlayerGame.getGameDetail({
      BeginTime: startTime,
      EndTime: endTime,
      PlayerId: state.playerId,
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

</script>

<template>
  <div class="flex-1 flex flex-col">
    gameRecord

    <InfinityScroll
      :fetch-action="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-3">
          <UnitCard class=" border border-primary-50 shadow-none">
            <template #header>
              <div class="text-sm font-semibold text-neutral2-basic">
                场馆总计
                <van-icon name="info" class="text-primary-normal" />
              </div>
            </template>
            <div class="flex items-center justify-between py-3">
              <div v-for="(d) in sum" :key="d.id" class="flex-1 flex flex-col items-center justify-center">
                <div class="text-xs text-neutral2-secondary">{{ d.title }}</div>
                <SumAmount class="text-sm font-semibold text-neutral2-basic" :val="d.amount" v-bind="{ useColor: d.id === 'winLose' }" />
              </div>
            </div>
          </UnitCard>
          <UnitCard v-for="l in ls" :key="l.Id" class="relative">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral2-secondary space-x-1">
                  <span>订单号</span>
                  <span>{{ l.TransactionId }}</span>
                </div>
                <Status class="text-xs px-2 border rounded-xl leading-5" :status="l.Status"/>
              </div>
            </template>
            <div class="flex items-center justify-between py-3">
              <SumBlock :item="l" />
            </div>
            <van-button round plain size="small" class="absolute! top-1/2 -right-1 shadow-[-1px_1px_6px_0px_rgba(0,0,0,0.15)] -translate-y-1/2"  @click="() => console.log('next step', l)">
              <van-icon name="arrow" class="w-3 text-neutral2-tertiary" />
            </van-button>

            <template #footer>
              <div class="flex justify-between items-center">
                <div class="text-xs text-neutral2-basic">{{ gameStore.allGameTypeMapping[l.GameType] ?? '' }}</div>
                <ShowTime class="text-xs text-neutral2-basic" :item="l" />
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>