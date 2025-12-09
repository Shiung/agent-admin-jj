<script setup lang="ts">
import { ref, inject, defineComponent, h, computed } from 'vue'
import { cn } from '@/utils/className'
import dayjs from 'dayjs'
import { formatSignedMoney, formatMoney } from '@/utils/formatNumber'
import { ProviderActionSymbol, ProviderStateSymbol } from '../composables/useProvider'

const refreshing = ref(false)

const state = inject(ProviderStateSymbol)!
const { fetchPlayerDetail } = inject(ProviderActionSymbol)!

const ls = computed(() => ([
  { id: 'TotalWinLose',title: '总盈利', value: state.playerInfo?.Total.TotalWinGold ?? 0 },
  { id: 'TotalBetGold', title: '投注金额', value: state.playerInfo?.Total.TotalBetGold ?? 0 },
  { id: 'TotalValidBet', title: '有效投注', value: state.playerInfo?.Total.TotalValidBet ?? 0 },
  { id: 'AgentApplyGold', title: '代存金额', value: state.playerInfo?.Total.TotalAgentApplyGold ?? 0 },
  { id: 'FirstPayMoney', title: '首存金额', value: state.playerInfo?.PlayerInfo.FirstPayMoney ?? 0 },
  { id: 'FirstPayTime', title: '首存时间', value: state.playerInfo?.PlayerInfo.FirstPayTime ?? 0 },
  { id: 'TotalRecharged', title: '充值金额', value: state.playerInfo?.Total.TotalRecharged ?? 0 },
  { id: 'TotalWithdraw', title: '提现金额', value: state.playerInfo?.Total.TotalWithdraw ?? 0 },
  { id: 'TotalRedGold', title: '红利', value: state.playerInfo?.Total.TotalRedGold ?? 0 },
  { id: 'TotalBackWater', title: '返水', value: state.playerInfo?.Total.TotalBackWater ?? 0 },
]))

const UnitBlock = defineComponent(
  (props : { type: string, val: number }, { attrs }) => {
    const showDate = (ts: number | string | null | undefined) => {
      if (!ts) return null
      const num = Number(ts)
      if (isNaN(num)) return null
      return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
    }

    const returnVal = computed(() => {
      let returnText, returnColor
      if (props.type === 'FirstPayTime') {
        returnText = showDate(props.val)
      } else if (props.type === 'TotalWinLose'){
        const { text, color } = formatSignedMoney(props.val ?? 0, 0, false)
        returnText = text
        returnColor = color
      } else {
        returnText = formatMoney(props.val ?? 0, 0, true)
      }
      return {
        text: returnText,
        color: returnColor
      }
    })

    return () => h('div', { class: cn(attrs?.class ?? '', returnVal.value.color)}, returnVal.value.text ?? '')
  }, {
    props: ['type', 'val'],
    inheritAttrs: false
  }
)

const onRefresh = async () => {
  if (typeof fetchPlayerDetail !== 'function') return
  await fetchPlayerDetail()
  refreshing.value = false
}

</script>

<template>
  <div class="px-4">
    <div class="flex items-center justify-between">
      <div>filters</div>
      <AppTooltip content-side="bottom" >
        <van-icon name="info" class="text-primary-normal" />
        <template #content>
          <span>数据仅统计「已结算」、「充值完成」、「已出款」的订单</span>
        </template>
      </AppTooltip>
    </div>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="mt-1 rounded-2xl border px-3 [&>div:not(:first-of-type)]:border-t [&>div:not(:first-of-type)]:border-neutral2-sixth">
        <div v-for="l in ls" :key="l.id" class="flex items-center justify-between py-2">
          <div class="text-sm text-neutral2-basic leading-6">{{ l.title }}</div>
          <UnitBlock class="text-sm font-semibold text-neutral2-basic" :type="l.id" :val="l.value" />
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>