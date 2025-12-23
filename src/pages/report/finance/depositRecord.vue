<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Big from 'big.js'
import FinanceCard from './components/financeCard.vue'
import DepositCard from './components/depositCard.vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import dayjs from 'dayjs'
import apis from '@/apis'
import type { AgentApplyGoldItem } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas } from '@/utils/formatNumber'

const router = useRouter()
const route = useRoute()

// API Data
const depositSummary = ref({
  CommissionAmount: 0,
  CommissionFeedback: 0,
  CreditAmount: 0,
  CreditFeedback: 0
})
const depositRecords = ref<AgentApplyGoldItem[]>([])

// Pagination and Loading
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)

// Error Handling
const error = ref(false)

// Tab 切换
const activeTab = ref(0)
const tabs = ['额度代存', '佣金代存']

// 会员账号搜索
const searchKeyword = ref('')

// 账变时间选择
const timestampToSecond = (timestamp: number) => +new Big(timestamp).div(1000).toFixed(0)

// 从 URL query 初始化时间范围（实现页面间时间同步）
const initTimeRange = () => {
  const startTimeFromQuery = route.query.startTime as string
  const endTimeFromQuery = route.query.endTime as string

  if (startTimeFromQuery && endTimeFromQuery) {
    return {
      startTime: parseInt(startTimeFromQuery),
      endTime: parseInt(endTimeFromQuery)
    }
  }

  return {
    startTime: timestampToSecond(dayjs().startOf('month').valueOf()),
    endTime: timestampToSecond(dayjs().endOf('month').valueOf())
  }
}

const selectTimeRange = ref(initTimeRange())
const showCalendar = ref(false)

const getTimeRange = (): { BeginTime: number; EndTime: number } => {
  return {
    BeginTime: selectTimeRange.value.startTime,
    EndTime: selectTimeRange.value.endTime
  }
}

// 排序选择
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  { label: '代存金额降序', value: '代存金额降序' },
  { label: '代存金额升序', value: '代存金额升序' }
]

// 映射排序类型到 API 参数
const currentSortType = computed(() => {
  switch (sortType.value) {
    case '账变时间降序':
      return '-update_time'
    case '账变时间升序':
      return 'update_time'
    case '代存金额降序':
      return '-amount'
    case '代存金额升序':
      return 'amount'
    default:
      return '-update_time'
  }
})

// 映射 tab 到 WalletType
const currentWalletType = computed(() => activeTab.value === 0 ? 2 : 1) // 0: 额度代存 (WalletType 2), 1: 佣金代存 (WalletType 1)

import { useSticky } from '@/composables/useSticky'

const containerRef = ref<HTMLElement | null>(null)

const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none',
  stickyTop: 44
})

// 综合判断是否禁用下拉刷新（sticky 固定时或 calendar 打开时都禁用）
const disablePullRefresh = computed(() => pullRefreshDisabled.value || showCalendar.value)

// 返回
const handleBack = () => {
  const tab = route.query.tab || '1'
  router.push({
    name: 'report',
    query: {
      tab,
      startTime: selectTimeRange.value.startTime.toString(),
      endTime: selectTimeRange.value.endTime.toString()
    }
  })
}

// 搜索处理
const handleSearch = () => {
  resetAndFetchData()
}

// 点击代存卡片
const handleDepositClick = (record: AgentApplyGoldItem) => {
  console.log('点击代存记录:', record)
  // TODO: 跳转到详情或显示弹窗
}

// 转换代存记录为卡片所需格式
const formatDepositRecord = (record: AgentApplyGoldItem) => ({
  orderNo: record.OrderId,
  username: record.LoginAccount,
  vipLevel: `VIP${record.VipLevel || 0}`,
  depositAmount: (record.Amount || 0) / 100,
  flowMultiplier: record.WithdrawWaterMultiply,
  depositRebate: (record.CreditBonus || 0) / 100,
  depositFee: (record.CreditFee || 0) / 100,
  topUpType: record.TransferType === 2 ? '代存' : '代存-红利',
  notes: record.Remarks,
  transactionTime: dayjs.unix(record.ProcessingTime).format('YYYY-MM-DD HH:mm:ss')
})

// 获取代存总计数据
const fetchDepositSummary = async () => {
  try {
    const { BeginTime, EndTime } = getTimeRange()
    const response = await apis.admin.getAgentApplyGoldSummary({
      BeginTime,
      EndTime
    })
    if (response.data.Code === 200) {
      depositSummary.value = response.data.Data
    } else {
      showToast({ message: response.data.Msg || '获取总计数据失败', position: 'bottom' })
    }
  } catch (err) {
    console.error('获取代存总计数据失败:', err)
    showToast({ message: '获取总计数据异常', position: 'bottom' })
  }
}

// 获取代存列表数据
const fetchDepositList = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const { BeginTime, EndTime } = getTimeRange()
    const response = await apis.admin.getAgentApplyGold({
      Page: currentPage.value,
      PageSize: pageSize,
      LoginAccount: searchKeyword.value || undefined,
      BeginTime,
      EndTime,
      WalletType: currentWalletType.value,
      Sort: currentSortType.value
    })

    if (response.data.Code === 200) {
      const newRecords = response.data.Data.Items || []
      if (newRecords) {
        depositRecords.value = depositRecords.value.concat(newRecords)
      }
      const pagination = response.data?.Data?.Pagination
      totalCount.value = pagination?.MaxCount ?? 0

      if (depositRecords.value.length >= totalCount.value) {
        finished.value = true
      }
    } else {
      finished.value = true
      loading.value = false
    }
  } finally {
    loadingToast.close()
  }
}

// 重置分页并重新获取数据
const resetAndFetchData = () => {
  currentPage.value = 1
  depositRecords.value = []
  finished.value = false
  error.value = false
  fetchDepositSummary()
  fetchDepositList()
}

// 刷新处理
const onRefresh = () => {
  finished.value = false
  loading.value = true
  onLoad()
}

// 滚动到底部加载更多
const onLoad = async () => {
  if (refreshing.value) {
    currentPage.value = 1
    depositRecords.value = []
    refreshing.value = false
  } else {
    if (currentPage.value) {
      currentPage.value++
    }
  }
  await fetchDepositList()
  loading.value = false
}

// Watchers
watch([activeTab, selectTimeRange, sortType], () => {
  resetAndFetchData()
}, { deep: true })

onMounted(() => {
  resetAndFetchData()
})

</script>

<template>
  <div class="deposit-record-container">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">代存记录</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 代存总计卡片 -->
    <div class="px-3 pb-2 pt-[54px]">
      <FinanceCard
        class="shadow-sm"
        title=""
        :show-arrow="false"
        :show-background-color="false"
        :data="[
          [
            { label: '额度代存', value: formatMoneyWithCommas(depositSummary.CreditAmount, 2, true) },
            { label: '额度代存回馈', value: formatMoneyWithCommas(depositSummary.CreditFeedback, 2, true) }
          ],
          [
            { label: '佣金代存', value: formatMoneyWithCommas(depositSummary.CommissionAmount, 2, true) },
            { label: '佣金代存回馈', value: formatMoneyWithCommas(depositSummary.CommissionFeedback, 2, true) }
          ]
        ]"
      />
    </div>

    <!-- Tab 切换和搜索筛选器 -->
    <div class="px-3 py-2 space-y-3">
      <!-- Tabs 切换 -->
      <van-tabs
        v-model:active="activeTab"
        color="var(--color-primary-normal)"
        title-active-color="var(--color-white)"
        title-inactive-color="var(--color-neutral-secondary)"
        type="card"
      >
        <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab" />
      </van-tabs>

      <!-- 会员账号搜索框 -->
      <van-search
        v-model="searchKeyword"
        placeholder="会员账号"
        shape="round"
        background="transparent"
        clearable
        left-icon=""
        @search="handleSearch"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #right-icon>
          <van-icon name="search" size="18" @click="handleSearch" />
        </template>
      </van-search>

      <!-- 筛选条件行 -->
      <div class="flex items-center gap-2 overflow-auto">
        <!-- 账变时间 -->
        <TimeFilterDropdown
          v-model="selectTimeRange"
          v-model:show-calendar="showCalendar"
          title="账变时间"
          height="1.5rem"
        />

        <!-- 排序方式 -->
        <div class="filter-dropdown">
          <Filled
            v-model="sortType"
            :options="sortOptions"
            height="1.5rem"
          />
        </div>
      </div>
    </div>

    <!-- 代存列表 -->
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh
        v-model="refreshing"
        :style="[depositRecords.length === 0 && !loading && { height: '100%' }]"
        @refresh="onRefresh"
      >
        <van-list
          v-if="depositRecords.length > 0"
          v-model:loading="loading"
          class="flex flex-col gap-2"
          :finished="finished"
          :immediate-check="false"
          :finished-text="depositRecords.length > 0 ? '没有更多了' : ''"
          @load="onLoad"
        >
          <DepositCard
            v-for="record in depositRecords"
            :key="record.OrderId"
            :record="formatDepositRecord(record)"
            @click="handleDepositClick(record)"
          />
        </van-list>

        <empty v-if="depositRecords.length === 0 && !loading && finished" />
      </van-pull-refresh>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.deposit-record-container {
  background-color: white;
  min-height: 100vh;
}

/* Header 固定在顶部 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 30;
  background-color: white;
}

/* 列表容器 */
.listContainer {
  height: calc(100vh - calc(var(--spacing) * 60));
  overflow: auto;
}

/* 自定义 van-tabs 样式 */
:deep(.van-tabs) {
  --van-tabs-card-height: 48px;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;

  .van-tabs__nav.van-tabs__nav--card {
    padding: 0.1875rem;
    border-color: var(--color-neutral2-seventh) !important;
  }

  .van-tab--card {
    border-right: none;
  }

  .van-tab.van-tab--card.van-tab--active {
    border-radius: var(--van-radius-sm);
  }
}

:deep(.van-tab) {
  font-size: 15px;
  font-weight: 400;
}

/* 自定义 van-search 样式 */
:deep(.van-search) {
  padding: 0;

  .van-search__content {
    background-color: white;
    border: 1px solid var(--color-neutral2-seventh);
    border-radius: 20px;
    height: 40px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .van-field__control {
    font-size: 14px;
    color: var(--color-neutral-basic);
  }

  .van-field__control::placeholder {
    color: var(--color-neutral-secondary);
  }

  .van-field__right-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-neutral-secondary);
  }

  .van-field__clear {
    color: var(--color-neutral-secondary);
  }

  .van-field__right-icon .van-icon {
    cursor: pointer;
  }
}

/* 筛选器 Dropdown 样式 */
.filter-dropdown {
  flex: none;

  :deep(.dropdown-button) {
    border: none;
    border-radius: 12px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    height: 1.5rem;
    justify-content: flex-start;
    gap: 0.25rem;
    white-space: nowrap;
    background: var(--color-bg-floor-1-2);
  }

  :deep(.dropdown-button [data-placeholder]) {
    font-size: 0.75rem;
    font-weight: 400;
  }

  :deep(.dropdown-button svg) {
    width: 0.875rem;
    height: 0.875rem;
    margin-left: 0;
  }
}
</style>
