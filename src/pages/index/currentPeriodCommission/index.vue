<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import Big from 'big.js'
import API from '@/apis'
import InfoDialog from '@/components/InfoDialog/index.vue'

const router = useRouter()

// 是否为多层代理
const isMultiLevelAgent = ref(true)

// 显示说明弹窗
const showInfo = ref(false)

// 当前月份
const currentMonth = computed(() => dayjs().format('YYYY-MM'))

// 格式化数字（大于等于10000显示K，保留2位小数）
const formatNumber = (value: string): string => {
  if (new Big(value).abs().gte(10000)) return new Big(value).div(1000).toFixed(2) + 'K'
  return new Big(value).toFixed(2)
}

// 格式化带符号的数字
const formatSignedNumber = (value: string): { text: string; color: string } => {
  const formatted = formatNumber(value)
  // 大于0为红色，小于0为绿色，等于0为黑色
  if (new Big(value).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(value).lt(0)) {
    return { text: formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral-basic' }
  }
}

const fetchCompareCommission = async () => {
  const res = await API.admin.getCompareCommission()
  if (res.data.Code !== 200) return

  commissionData.value.commissionRate = new Big(res.data.Data.CurrentMonth.CommissionRate).div(100).toFixed(2)

  commissionData.value.totalProfit.current = new Big(res.data.Data.CurrentMonth.BetWinTotal).div(100).toFixed(2)
  commissionData.value.estimatedMemberCommission.current = new Big(res.data.Data.CurrentMonth.CommissionTotal).div(100).toFixed(2)
  commissionData.value.estimatedSubordinateContribution.current = new Big(res.data.Data.CurrentMonth.CommissionChildTotal).div(100).toFixed(2)
  commissionData.value.estimatedDepositRebate.current = new Big(res.data.Data.CurrentMonth.AdminChargeMoneyFee).div(100).toFixed(2)

  commissionData.value.totalProfit.last = new Big(res.data.Data.LastMonth.BetWinTotal).div(100).toFixed(2)
  commissionData.value.estimatedMemberCommission.last = new Big(res.data.Data.LastMonth.CommissionTotal).div(100).toFixed(2)
  commissionData.value.estimatedSubordinateContribution.last = new Big(res.data.Data.LastMonth.CommissionChildTotal).div(100).toFixed(2)
  commissionData.value.estimatedDepositRebate.last = new Big(res.data.Data.LastMonth.AdminChargeMoneyFee).div(100).toFixed(2)
}

fetchCompareCommission()

// 佣金数据
const commissionData = ref({
  commissionRate: '0',
  totalProfit: { current: '0', last: '0' },
  estimatedMemberCommission: { current: '0', last: '0' },
  estimatedSubordinateContribution: { current: '0', last: '0' },
  estimatedDepositRebate: { current: '0', last: '0' },
})

// 指标列表
const indicators = computed(() => {
  const base = [
    {
      label: '总盈利',
      current: commissionData.value.totalProfit.current,
      last: commissionData.value.totalProfit.last,
      isSigned: true,
    },
    {
      label: '预计会员佣金',
      current: commissionData.value.estimatedMemberCommission.current,
      last: commissionData.value.estimatedMemberCommission.last,
      isSigned: false,
    },
  ]

  // 如果是多层代理，添加下级贡献
  if (isMultiLevelAgent.value) {
    base.push({
      label: '预计下级贡献',
      current: commissionData.value.estimatedSubordinateContribution.current,
      last: commissionData.value.estimatedSubordinateContribution.last,
      isSigned: false,
    })
  }

  base.push({
    label: '预计代存回馈',
    current: commissionData.value.estimatedDepositRebate.current,
    last: commissionData.value.estimatedDepositRebate.last,
    isSigned: false,
  })

  return base
})

// 跳转到佣金详情页面
const handleViewMore = () => router.push({ name: 'commission-detail' })
</script>

<template>
  <div class="current-period-commission">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-neutral2-basic">{{ currentMonth }}</h2>
      <button @click="showInfo = true" class="p-2 rounded-full">
        <van-icon name="question-o" size="16" :style="{ fontWeight: 'bold' }" />
      </button>
    </div>

    <!-- 佣金比例 -->
    <div class="flex items-center justify-between h-[4.0625rem] bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-2 gap-3">
      <div class="w-[7.5rem] text-primary-normal text-sm font-semibold">佣金比例</div>
      <van-divider vertical :style="{ height: '1.25rem', color: 'var(--color-primary-10)' }" />
      <div class="flex items-center justify-center flex-1 bg-primary-5 text-primary-normal rounded-2xl p-1">
        <div class="text-2xl font-semibold">{{ commissionData.commissionRate }}</div>
        <div class="text-lg self-end font-semibold">%</div>
      </div>
    </div>

    <!-- 指标卡片 -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in indicators"
        :key="index"
        class="flex items-center justify-between h-[4.375rem] gap-3 bg-bg-floor-1-2 rounded-2xl px-3 py-2"
      >
        <div class="w-[7.5rem] text-neutral2-secondary text-sm">{{ item.label }}</div>

        <van-divider vertical :style="{ height: '1.25rem', color: 'var(--color-neutral2-seventh)' }" />

        <div class="flex-1">
          <!-- 本月 -->
          <div class="flex items-baseline justify-between mb-1">
            <div class="text-xs text-neutral2-basic font-semibold">本月</div>
            <div
              class="text-base font-semibold"
              :class="item.isSigned ? formatSignedNumber(item.current).color : 'text-neutral2-basic'"
            >
              {{ item.isSigned ? formatSignedNumber(item.current).text : formatNumber(item.current) }}
            </div>
          </div>

          <!-- 上月 -->
          <div class="flex items-center justify-between">
            <div class="text-xs text-neutral2-basic">上月</div>
            <div
              class="text-sm"
              :class="item.isSigned ? formatSignedNumber(item.last).color : 'text-neutral2-basic'"
            >
              {{ item.isSigned ? formatSignedNumber(item.last).text : formatNumber(item.last) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看更多按钮 -->
    <button
      class="w-full mt-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
      @click="handleViewMore"
    >
      <span class="text-primary-normal font-semibold">查看更多数据</span>
      <svg class="w-4 h-4 text-primary-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- 说明弹窗 -->
    <InfoDialog v-model:show="showInfo" title="本期佣金说明">
      <p><strong>1. 数据更新频率：</strong>每半点（例如：00:30、01:00、01:30...）</p>
      <p><strong>2. 总盈利：</strong>会员投注产生的公司盈亏。</p>
      <p><strong>3. 预计下级贡献：</strong>从下级代理获得的佣金分润。</p>
      <p><strong>4. 预计代存回馈：</strong>代理为会员代存后可获得的返利金额。</p>
      <p><strong>5.</strong> 红色正数代表公司盈利，绿色负数代表公司成本。</p>
    </InfoDialog>
  </div>
</template>

<style scoped>
.current-period-commission {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
