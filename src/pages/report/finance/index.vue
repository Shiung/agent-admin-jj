<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FinanceSummary from './components/financeSummary.vue'
import FinanceCard from './components/financeCard.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import dayjs from 'dayjs'
import apis from '@/apis'
import type { ReportCenterFinancePersonalData } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas, formatNumberWithCommas } from '@/utils/formatNumber'

import { useSticky } from '@/composables/useSticky'

const router = useRouter()
const route = useRoute()

const financeContainerRef = ref<HTMLElement | null>(null)

// 提取吸顶逻辑到 composable
const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef: financeContainerRef,
  tabQueryIndex: '1' // 财务页面的 tab 索引是 '1'
})

// 财务数据
const financeData = ref<ReportCenterFinancePersonalData | null>(null)

// 总盈利数据（从 API 获取）
const totalProfit = computed(() => {
  if (!financeData.value) return 0
  return financeData.value.SumProfit
})

// 日期选择（从 URL query 初始化，实现页面间连动）
const selectedDate = ref((route.query.date as string) || '本月')

// 日期选项
const dateOptions = computed(() => {
  const options = [{ label: '本月', value: '本月' }]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    options.push({ label: value, value })
  }
  return options
})

// 根据选择的日期获取时间戳范围
const getTimeRange = (dateStr: string): { BeginTime: number; EndTime: number } => {
  let startDate: dayjs.Dayjs
  let endDate: dayjs.Dayjs

  if (dateStr === '本月') {
    // 本月：从本月1号00:00:00 到本月最后一天23:59:59
    startDate = dayjs().startOf('month')
    endDate = dayjs().endOf('month')
  } else {
    // 指定月份：从该月1号00:00:00 到该月最后一天23:59:59
    startDate = dayjs(dateStr).startOf('month')
    endDate = dayjs(dateStr).endOf('month')
  }

  return {
    BeginTime: startDate.unix(), // Unix 时间戳（秒）
    EndTime: endDate.unix(), // Unix 时间戳（秒）
  }
}

// 加载数据
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态
const fetchFinanceData = async (isRefreshing = false) => {
  try {
    // 下拉刷新时不显示 loading（顶部已有刷新动画）
    if (!isRefreshing) {
      loading.value = true
    }
    const { BeginTime, EndTime } = getTimeRange(selectedDate.value)
    const response = await apis.report.getReportCenterFinancePersonal({
      BeginTime,
      EndTime,
    })

    if (response.data.Code === 200 && response.data.Data) {
      financeData.value = response.data.Data
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取财务数据失败:', error)
    showToast({
      message: '加载失败，请稍后重试',
      position: 'bottom',
    })
  } finally {
    if (!isRefreshing) {
      loading.value = false
    }
  }
}

// 下拉刷新
const refreshing = ref(false)
const onRefresh = async () => {
  await fetchFinanceData(true) // 传入 true 表示是下拉刷新
  refreshing.value = false
}

// 监听日期变化，重新获取数据并更新 URL query
watch(selectedDate, (newDate) => {
  fetchFinanceData()
  // 更新 URL query 参数（不添加历史记录）
  router.replace({
    name: 'report',
    query: {
      tab: route.query.tab || '1',
      date: newDate
    }
  })
})

// 页面挂载时加载数据
onMounted(() => {
  fetchFinanceData()
})

// 格式化游戏记录数据
const gameRecordData = computed(() => {
  if (!financeData.value) return [[{ label: '总盈利', value: '-', highlight: true }, { label: '场馆费', value: '-' }], [{ label: '投注金额', value: '-' }, { label: '有效投注', value: '-' }]]

  const data = financeData.value
  return [
    [
      {
        label: '总盈利',
        value: data.SumProfit,
        highlight: true,
        isMoney: true
      },
      {
        label: '场馆费',
        value: formatMoneyWithCommas(data.SumApiFeeTotal, 2, true)
      }
    ],
    [
      {
        label: '投注金额',
        value: formatMoneyWithCommas(data.SumBetGold, 2, true)
      },
      {
        label: '有效投注',
        value: formatMoneyWithCommas(data.SumValidBetGold, 2, true)
      }
    ]
  ]
})

// 格式化充提记录数据
const depositWithdrawData = computed(() => {
  if (!financeData.value) return [[{ label: '充值金额', value: '-' }, { label: '充值人数', value: '-' }, { label: '充值手续费', value: '-' }], [{ label: '提现金额', value: '-' }, { label: '提现人数', value: '-' }, { label: '提现手续费', value: '-' }]]

  const data = financeData.value
  return [
    [
      {
        label: '充值金额',
        value: formatMoneyWithCommas(data.SumPayMoney, 2, true)
      },
       {
        label: '提现金额',
        value: formatMoneyWithCommas(data.SumWithdrawMoney, 2, true)
      }
    ]
  ]
})

// 格式化充提手续费数据
const depositWithdrawFeeData = computed(() => {
  if (!financeData.value) return [[{ label: '充值手续费', value: '-' }], [{ label: '提现手续费', value: '-' }]]

  const data = financeData.value
  return [
    [
      {
        label: '充值手续费',
        value: formatMoneyWithCommas(data.SumPayMoneyFee, 2, true)
      },
      {
        label: '提现手续费',
        value: formatMoneyWithCommas(data.SumWithdrawMoneyFee, 2, true)
      }
    ]
  ]
})

// 格式化红利记录数据
const bonusData = computed(() => {
  if (!financeData.value) return [[{ label: '红利金额', value: '-' }, { label: '红利人数', value: '-' }], [{ label: '返水金额', value: '-' }, { label: '返水人数', value: '-' }]]

  const data = financeData.value
  return [
    [
      {
        label: '红利金额',
        value: formatMoneyWithCommas(data.SumRedGold, 2, true)
      },
      {
        label: '红利人数',
        value: formatNumberWithCommas(data.SumRedCount, 0, true)
      }
    ],
    [
      {
        label: '返水金额',
        value: formatMoneyWithCommas(data.SumBackWaterGold, 2, true)
      },
      {
        label: '返水人数',
        value: formatNumberWithCommas(data.SumBackWaterCount, 0, true)
      }
    ]
  ]
})

// 格式化代存记录数据
const depositRecordData = computed(() => {
  if (!financeData.value) return [[{ label: '额度代存', value: '-' }, { label: '额度代存回馈', value: '-' }], [{ label: '佣金代存', value: '-' }, { label: '佣金代存回馈', value: '-' }]]

  const data = financeData.value
  return [
    [
      {
        label: '额度代存',
        value: formatMoneyWithCommas(data.SumAgentCreditPay, 2, true)
      },
      {
        label: '额度代存回馈',
        value: formatMoneyWithCommas(data.SumAgentCreditPayBonus, 2, true)
      }
    ],
    [
      {
        label: '佣金代存',
        value: formatMoneyWithCommas(data.SumAgentCommissionPay, 2, true)
      },
      {
        label: '佣金代存回馈',
        value: formatMoneyWithCommas(data.SumAgentCommissionPayBonus, 2, true)
      }
    ]
  ]
})

// 格式化输赢调整记录数据
const adjustmentRecordData = computed(() => {
  if (!financeData.value) return [[{ label: '总金额', value: '-' }, { label: '上分 / 下分 (次)', value: '-' }]]

  const data = financeData.value
  return [
    [
      {
        label: '总金额',
        value: formatMoneyWithCommas(data.SumMoneyChange, 2, true)
      },
      {
        label: '上分 / 下分 (次)',
        value: `${formatNumberWithCommas(data.SumMoneyChangeAddCount, 0, true)} / ${formatNumberWithCommas(data.SumMoneyChangeReduceCount, 0, true)}`
      }
    ]
  ]
})

// 卡片点击处理
const handleCardClick = (cardName: string) => {
  console.log('点击了卡片:', cardName)

  // 根据卡片名称跳转到对应的详情页面，传递当前选中的日期
  if (cardName === '游戏记录') {
    router.push({
      name: 'financeGameRecord',
      query: { from: 'report', tab: '1', date: selectedDate.value } // 传递日期参数实现连动
    })
  } else if (cardName === '充提记录') {
    router.push({
      name: 'financeDepositWithdrawRecord',
      query: { tab: '1', date: selectedDate.value }
    })
  } else if (cardName === '红利记录') {
    router.push({
      name: 'financeBonusRecord',
      query: { tab: '1', date: selectedDate.value }
    })
  } else if (cardName === '代存记录') {
    router.push({
      name: 'financeDepositRecord',
      query: { tab: '1', date: selectedDate.value }
    })
  } else if (cardName === '充提手续费记录') {
    router.push({
      name: 'financeDepositWithdrawFeeRecord',
      query: { tab: '1', date: selectedDate.value }
    })
  }
  // TODO: 添加其他卡片的详情页面跳转
}
</script>

<template>
  <div class="finance-container" ref="financeContainerRef">
    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="pullRefreshDisabled"
      @refresh="onRefresh"
      class="finance-pull-refresh"
    >
      <!-- 总盈利卡片 -->
      <div class="px-3 pt-1 pb-2">
        <FinanceSummary :total="totalProfit" />
      </div>

      <!-- 日期选择器（sticky 吸顶） -->
      <div>
        <!-- 占位元素（fixed 时避免内容跳动） -->
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }"></div>
        <div class="sticky-filter-bar px-3 py-1" :class="{ 'is-fixed': isFilterBarFixed }">
          <Dropdown v-model="selectedDate" :options="dateOptions" height="2.5rem" />
        </div>
      </div>

      <!-- Loading 状态 -->
      <div v-if="loading" class="finance-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!financeData" class="finance-list-empty">
        <img src="/static/images/promote/empty.png" alt="暂无数据" class="empty-icon" />
        <span class="empty-text">暂无数据</span>
      </div>

      <!-- 财务记录列表 -->
      <div v-else class="finance-list-container">
          <!-- 游戏记录 -->
          <FinanceCard
            title="游戏记录"
            :data="gameRecordData"
            @click="handleCardClick('游戏记录')"
          />

          <!-- 充提记录 -->
          <FinanceCard
            title="充提记录"
            :show-arrow="false"
            :data="depositWithdrawData"
            @click="handleCardClick('充提记录')"
          />

          <!-- 代存记录 -->
          <FinanceCard
            title="代存记录"
            :data="depositRecordData"
            @click="handleCardClick('代存记录')"
          />

           <!-- 红利记录 -->
          <FinanceCard
            title="红利记录"
            :data="bonusData"
            @click="handleCardClick('红利记录')"
          />

           <!-- 充提手续费记录 -->
          <FinanceCard
            title="充提手续费记录"
            :show-arrow="false"
            :data="depositWithdrawFeeData"
            @click="handleCardClick('充提手续费记录')"
          />

          <!-- 输赢调整记录 -->
          <FinanceCard
            title="输赢调整记录"
            :show-arrow="false"
            :data="adjustmentRecordData"
            @click="handleCardClick('输赢调整记录')"
          />
        </div>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.finance-container {
  width: 100%;
  position: relative;
  background-color: white;
}

.finance-pull-refresh {
  /* 确保 van-pull-refresh 不会阻止 sticky */
  :deep(.van-pull-refresh__track) {
    overflow: visible !important;
  }
}

/* 筛选栏固定 */
.sticky-filter-bar {
  position: relative;
  z-index: 10;
  background-color: white;

  /* 当滚动超过阈值时，切换为 fixed */
  &.is-fixed {
    position: fixed;
    top: 108px; /* Header (44px) + fixed Tab (64px) 的总和 */
    left: 0;
    right: 0;
  }
}

/* 占位元素（防止 fixed 时内容跳动，高度通过 inline style 动态设置） */
.filter-bar-placeholder {
  /* 高度由 JavaScript 动态计算并通过 :style 绑定 */
}

.finance-list-container {
  margin-top: 8px;
  padding: 0 0.75rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Loading 状态 */
.finance-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
}

/* 空状态 */
.finance-list-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
  gap: 16px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.empty-text {
  font-size: 14px;
  color: var(--color-neutral2-tertiary);
  font-weight: 400;
}
</style>
