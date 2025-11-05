<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import NavBar from '@/components/NavBar/index.vue'
import InfoDialog from '@/components/InfoDialog/index.vue'

// 獲取路由參數 ID (後續可用於 API 調用)
// import { useRoute } from 'vue-router'
// const route = useRoute()
// const commissionId = computed(() => route.params.id)

// 是否为多层代理
const isMultiLevelAgent = ref(true)
const agentLevel = ref(3) // 代理层级数

// 显示说明弹窗
const showInfo = ref(false)

// 当前月份
const currentMonth = computed(() => dayjs().format('YYYY-MM'))

// 格式化数字（大于等于10000显示K，保留2位小数）
const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 10000) {
    return new Big(value).div(1000).toFixed(2) + 'K'
  }
  return value.toFixed(2)
}

// 格式化带符号的数字
const formatSignedNumber = (value: number): { text: string; color: string } => {
  const formatted = formatNumber(value)
  if (value > 0) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (value < 0) {
    return { text: formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}

// 模拟数据 - 预计会员佣金
const memberCommissionData = ref({
  memberCommission: { current: 15680.30, last: 12450.80 },
  netProfit: { current: 98500.20, last: 85600.10 },
  totalProfit: { current: 125800.50, last: 98600.20 },
  winLossAdjustment: { current: -2300.00, last: -1800.00 },
  platformFee: { current: 8900.50, last: 7200.30 },
  depositWithdrawalFee: { current: 1200.80, last: 950.60 },
  rebate: { current: 12500.00, last: 10200.00 },
  bonus: { current: 2400.00, last: 1850.00 },
  previousBalance: { current: 500.00, last: -300.00 },
  commissionRate: 12.5, // 佣金比例%
  depositRebate: { current: 2300.00, last: 1800.00 },
  rebateRate: { current: 2.5, last: 12.03 }, // 回馈比例%
})

// 模拟数据 - 预计下级贡献
const subordinateContributionData = ref({
  total: { current: 89000.50, last: 7200.30 },
  level1: { current: 5200.30, last: 4100.20 },
  level2: { current: 2500.10, last: 2000.05 },
  level3: { current: 1200.10, last: 1100.05 },
})

// 预计会员佣金列表
const memberCommissionList = computed(() => [
  { label: '会员佣金', value: memberCommissionData.value.memberCommission, isSigned: false },
  { label: '净盈利', value: memberCommissionData.value.netProfit, isSigned: true },
  { label: '总盈利', value: memberCommissionData.value.totalProfit, isSigned: true },
  { label: '输赢调整', value: memberCommissionData.value.winLossAdjustment, isSigned: false },
  { label: '平台费', value: memberCommissionData.value.platformFee, isSigned: false },
  { label: '存提手续费', value: memberCommissionData.value.depositWithdrawalFee, isSigned: false },
  { label: '红利', value: memberCommissionData.value.bonus, isSigned: false },
  { label: '返水', value: memberCommissionData.value.rebate, isSigned: false },
  { label: '上期结余', value: memberCommissionData.value.previousBalance, isSigned: true },
  { label: '代存回馈', value: memberCommissionData.value.depositRebate, isSigned: false },
  { label: '回馈比例', value: memberCommissionData.value.rebateRate, isSigned: false, suffix: '%' },
])

// 预计下级贡献列表
const subordinateContributionList = computed(() => {
  const list = [
    { label: '代理佣金', value: subordinateContributionData.value.total },
  ]

  // 根据代理层级添加对应的贡献项
  if (isMultiLevelAgent.value) {
    if (agentLevel.value >= 1) {
      list.push({ label: '一级代理佣金', value: subordinateContributionData.value.level1 })
    }
    if (agentLevel.value >= 2) {
      list.push({ label: '二级代理佣金', value: subordinateContributionData.value.level2 })
    }
    if (agentLevel.value >= 3) {
      list.push({ label: '三级代理佣金', value: subordinateContributionData.value.level3 })
    }
  }

  return list
})
</script>

<template>
  <div class="commission-detail min-h-screen pb-6">
    <!-- 顶部导航栏 -->
    <NavBar title="佣金详情" />

    <!-- 预计会员佣金 -->
    <div class="mt-4 px-4">
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
          <div class="text-2xl font-semibold">10</div>
          <div class="text-lg self-end font-semibold">%</div>
        </div>
      </div>

      <!-- 预计佣金回馈 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between h-8 px-3 bg-bg-floor-1-2">
          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">预计佣金回馈</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">上月</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">本月</div>
        </div>
        <div
          v-for="(item, index) in memberCommissionList"
          :key="index"
          class="flex items-center justify-between h-10 mx-3 border-b border-neutral2-sixth last:border-b-0"
        >

          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">{{ item.label }}</div>
          <div
            class="flex-1 flex items-center justify-end text-sm"
            :class="[
              item.isSigned ? formatSignedNumber(item.value.last).color : 'text-neutral2-basic'
            ]"
          >
            {{ item.isSigned ? formatSignedNumber(item.value.last).text : formatNumber(item.value.last) }}{{ item.suffix }}
          </div>
          <div
            class="flex-1 flex items-center justify-end text-sm font-semibold"
            :class="[
              item.isSigned ? formatSignedNumber(item.value.current).color : 'text-neutral2-basic'
            ]"
          >
            {{ item.isSigned ? formatSignedNumber(item.value.current).text : formatNumber(item.value.current) }}{{ item.suffix }}
          </div>
        </div>
      </div>
    </div>

    <!-- 预计下级贡献 -->
    <div v-if="isMultiLevelAgent" class="mt-6 px-4">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between h-8 px-3 bg-bg-floor-1-2">
          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">预计下级贡献</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">上月</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">本月</div>
        </div>
        <div
          v-for="(item, index) in subordinateContributionList"
          :key="index"
          class="flex items-center justify-between h-10 mx-3 border-b border-neutral2-sixth last:border-b-0"
        >
          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">{{ item.label }}</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">
            {{ formatNumber(item.value.last) }}
          </div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">
            {{ formatNumber(item.value.current) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 说明弹窗 -->
    <InfoDialog v-model:show="showInfo" title="佣金详情说明">
      <p><strong>1. 数据更新频率：</strong>每半点（例如：00:30、01:00、01:30...）</p>
      <p><strong>2. 会员佣金 ＝</strong> (总盈利 - 输赢调整 - 平台费 - 存提手续费 - 返水 - 红利 + 上期结余) × 佣金比例% + 代存回馈</p>
      <p><strong>3. 代理佣金：</strong>从下级代理获得的佣金分润。</p>
      <p><strong>4.</strong> 每月1日 - 4日进行上月的总佣金结算。</p>
    </InfoDialog>
  </div>
</template>

<style scoped>
.commission-detail {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

