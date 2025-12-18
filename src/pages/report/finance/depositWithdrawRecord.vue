<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FinanceCard from './components/financeCard.vue'
import DepositWithdrawCard from './components/depositWithdrawCard.vue'
import Big from 'big.js'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import apis from '@/apis'
import dayjs from 'dayjs'
import type { PaymentSummaryData, PlayerRechargeList, PlayerWithdrawList } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { getWithdrawName } from '@/utils/finance'

const router = useRouter()
const route = useRoute()

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

// Calendar 打开状态（用于禁用下拉刷新）
const showCalendar = ref(false)

const getTimeRange = (): { BeginTime: number; EndTime: number } => {
  return {
    BeginTime: selectTimeRange.value.startTime,
    EndTime: selectTimeRange.value.endTime
  }
}

// 充提总计数据
const summaryData = ref<PaymentSummaryData | null>(null)
const summaryLoading = ref(false)

// 获取充提总计数据
const fetchSummary = async () => {
  try {
    summaryLoading.value = true
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getPaymentSummary({
      BeginTime,
      EndTime,
      LoginAccount: searchKeyword.value || undefined
    })

    if (response.data.Code === 200 && response.data.Data) {
      summaryData.value = response.data.Data
    }
  } catch (error) {
    console.error('获取充提总计失败:', error)
  } finally {
    summaryLoading.value = false
  }
}

// 充提汇总卡片数据
const depositWithdrawData = computed(() => {
  if (!summaryData.value) {
    return {
      depositAmount: 0,
      depositCount: 0,
      depositFee: 0,
      withdrawAmount: 0,
      withdrawCount: 0,
      withdrawFee: 0
    }
  }

  return {
    depositAmount: summaryData.value.DepositAmount || 0,
    depositCount: summaryData.value.DepositCount || 0,
    depositFee: 0, // API 暂无手续费总计
    withdrawAmount: summaryData.value.WithdrawAmount || 0,
    withdrawCount: summaryData.value.WithdrawCount || 0,
    withdrawFee: 0 // API 暂无手续费总计
  }
})

// Tab 切换
const activeTab = ref(0)
const tabs = ['充值', '提现']

// 根据tab显示不同的提示文案
const tipText = computed(() => {
  return activeTab.value === 0
    ? '以下数据仅统计「充值完成」的订单'
    : '以下数据仅统计「已出款」的订单'
})

// 会员账号搜索
const searchKeyword = ref('')

// 状态筛选
const statusFilter = ref('全部状态')

// 充值状态选项
const depositStatusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '处理中', value: '处理中' },
  { label: '充值完成', value: '充值完成' },
  { label: '充值失败', value: '充值失败' },
  { label: '已审核', value: '已审核' },
  { label: '充值取消', value: '充值取消' },
  { label: '用户取消', value: '用户取消' }
]

// 提现状态选项
const withdrawStatusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '待处理', value: '待处理' },
  { label: '已出款', value: '已出款' },
  { label: '退款驳回', value: '退款驳回' },
  { label: '处理中', value: '处理中' },
]

// 当前状态选项
const statusOptions = computed(() => {
  return activeTab.value === 0 ? depositStatusOptions : withdrawStatusOptions
})


// 充值状态映射：UI显示 -> API参数（用于筛选）
const depositStatusMap: Record<string, number> = {
  '全部状态': 0,
  '处理中': 1,
  '充值完成': 2,
  '充值失败': 3,
  '已审核': 4,
  '充值取消': 12,
  '用户取消': 13
}

// 提现状态映射：UI显示 -> API参数（用于筛选）
const withdrawStatusMap: Record<string, number> = {
  '全部状态': 0,
  '待处理': 1,
  '已出款': 2,
  '退款驳回': 3,
  '处理中': 5
}

// 充值状态反向映射：API参数 -> 状态标识（用于显示）
const depositStatusToType: Record<number, 'completed' | 'failed' | 'primary' | 'cancelled'> = {
  1: 'primary',      // 处理中
  2: 'completed',    // 充值完成
  3: 'failed',       // 充值失败
  4: 'completed',    // 已审核
  12: 'cancelled',   // 充值取消
  13: 'cancelled'    // 用户取消
}

// 提现状态反向映射：API参数 -> 状态标识（用于显示）
const withdrawStatusToType: Record<number, 'completed' | 'failed' | 'primary' | 'cancelled'> = {
  1: 'primary',      // 待处理
  2: 'completed',    // 已出款
  3: 'failed',       // 退款驳回
  5: 'primary'       // 处理中
}

// 排序选择
const sortType = ref('账变时间降序')

// 充值排序选项
const depositSortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  { label: '充值金额降序', value: '充值金额降序' },
  { label: '充值金额升序', value: '充值金额升序' },
]

// 提现排序选项
const withdrawSortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  { label: '提现金额降序', value: '提现金额降序' },
  { label: '提现金额升序', value: '提现金额升序' },
]

// 当前排序选项
const sortOptions = computed(() => {
  return activeTab.value === 0 ? depositSortOptions : withdrawSortOptions
})

// 排序映射：UI显示 -> API参数
const sortMap: Record<string, string> = {
  '账变时间降序': '-finish_time',
  '账变时间升序': 'finish_time',
  '充值金额降序': '-amount',
  '充值金额升序': 'amount',
  '提现金额降序': '-amount',
  '提现金额升序': 'amount'
}

// 订单列表原始数据
const rechargeListData = ref<PlayerRechargeList[]>([])
const withdrawListData = ref<PlayerWithdrawList[]>([])
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态
const currentPage = ref(1)
const pageSize = ref(20)

// 充值类型映射表：Key -> Name
const payTypeMap = ref<Record<number, string>>({})

// 格式化充值订单数据
const formatRechargeOrder = (item: PlayerRechargeList) => {
  // 使用映射表将PayType数字转换为中文名称
  const payTypeName = item.PayType ? (payTypeMap.value[item.PayType] || `支付方式${item.PayType}`) : '-'
  // 将API状态数字转换为状态标识（completed/failed/primary/cancelled）
  const statusType = item.Status !== undefined ? (depositStatusToType[item.Status] || 'failed') : 'failed'

  return {
    orderNo: item.OrderId || '-',
    status: statusType,
    username: item.LoginAccount || '-',
    vipLevel: 'VIP0', // API 未返回 VIP 等级
    applyAmount: item.Amount || 0,
    actualAmount: item.RealAmount || 0,
    depositType: payTypeName,
    depositRate: item.FeeRate ? `${(item.FeeRate / 10)}%` : '0%', // 千分比转百分比
    depositFee: item.Fee || 0,
    time: item.FinishTime ? dayjs.unix(item.FinishTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    rawData: item
  }
}

// 格式化提现订单数据
const formatWithdrawOrder = (item: PlayerWithdrawList) => {
  // 将API状态数字转换为状态标识（completed/failed/primary/cancelled）
  const statusType = item.Status !== undefined ? (withdrawStatusToType[item.Status] || 'failed') : 'failed'
  const withdrawTypeName = getWithdrawName(item.AccountType || '')
  return {
    orderNo: item.OrderId || '-',
    status: statusType,
    username: '-', // API 未返回会员账号
    vipLevel: 'VIP0', // API 未返回 VIP 等级
    applyAmount: item.Amount || 0,
    actualAmount: item.RealAmount || 0,
    depositType: withdrawTypeName,
    depositRate: item.FeeRate ? `${(item.FeeRate / 10)}%` : '0%', // 千分比转百分比
    depositFee: item.Fee || 0,
    time: item.FinishTime ? dayjs.unix(item.FinishTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    rawData: item
  }
}

// 当前显示的列表
const currentList = computed(() => {
  if (activeTab.value === 0) {
    return rechargeListData.value.map(formatRechargeOrder)
  } else {
    return withdrawListData.value.map(formatWithdrawOrder)
  }
})

// 获取充值列表
const fetchRechargeList = async (isRefreshing = false) => {
  try {
    if (!isRefreshing) {
      loading.value = true
    }
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getRechargeList({
      Page: currentPage.value,
      PageSize: pageSize.value,
      BeginTime,
      EndTime,
      Status: depositStatusMap[statusFilter.value],
      Sort: sortMap[sortType.value],
      LoginAccount: searchKeyword.value || undefined
    })

    if (response.data.Code === 200 && response.data.Data) {
      rechargeListData.value = response.data.Data.Items || []
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取充值记录失败:', error)
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

// 获取提现列表
const fetchWithdrawList = async (isRefreshing = false) => {
  try {
    if (!isRefreshing) {
      loading.value = true
    }
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getWithdrawList({
      Page: currentPage.value,
      PageSize: pageSize.value,
      BeginTime,
      EndTime,
      Status: withdrawStatusMap[statusFilter.value],
      Sort: sortMap[sortType.value],
      LoginAccount: searchKeyword.value || undefined
    })

    if (response.data.Code === 200 && response.data.Data) {
      withdrawListData.value = response.data.Data.Items || []
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取提现记录失败:', error)
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

// 获取当前Tab的列表
const fetchCurrentList = async (isRefreshing = false) => {
  if (activeTab.value === 0) {
    await fetchRechargeList(isRefreshing)
  } else {
    await fetchWithdrawList(isRefreshing)
  }
}

// 下拉刷新
const refreshing = ref(false)
const onRefresh = async () => {
  currentPage.value = 1
  await Promise.all([fetchSummary(), fetchCurrentList(true)])
  refreshing.value = false
}

import { useSticky } from '@/composables/useSticky'

const containerRef = ref<HTMLElement | null>(null)

const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none', // 此頁面不基於 tab 顯示，給一個不會匹配的值
  stickyTop: 84 // 吸頂時距離頂部的距離
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
  console.log('搜索会员账号:', searchKeyword.value)
  currentPage.value = 1
  fetchCurrentList()
  fetchSummary()
}

// 监听筛选条件变化
watch([selectTimeRange, statusFilter, sortType], () => {
  currentPage.value = 1
  fetchCurrentList()
  fetchSummary()
}, { deep: true })

// 监听 Tab 切换
watch(activeTab, () => {
  currentPage.value = 1
  statusFilter.value = '全部状态'
  sortType.value = '账变时间降序'
  fetchCurrentList()
})

// 获取充值类型列表（用于映射）
const fetchRechargeTypeList = async () => {
  try {
    const response = await apis.config.getRechargeTypeList()

    if (response.data.Code === 200 && response.data.Data) {
      // 将数组转换为 Key -> Name 的映射表
      const mapping: Record<number, string> = {}
      response.data.Data.forEach(item => {
        if (mapping[item.Key] !== undefined) return
        mapping[item.Key] = item.Name
      })

      // 其他Key copy from 1.0（與 useProvider 中的 rechargeTypeMapping 保持一致）
      const otherKey = [
        { Key: 111, Name: '充值调整' },
        { Key: 137, Name: '佣金代存' },
        { Key: 138, Name: '額度代存' },
        { Key: 22, Name: '代客充值' },
        { Key: -2, Name: '代客充值' },
        { Key: -10, Name: '充值调整' }
      ]

      otherKey.forEach(o => {
        if (mapping[o.Key] !== undefined) return
        mapping[o.Key] = o.Name
      })

      payTypeMap.value = mapping
    }
  } catch (error) {
    console.error('获取充值类型列表失败:', error)
  }
}

// 页面挂载时加载数据
onMounted(async () => {
  await fetchRechargeTypeList() // 先加载充值类型映射表
  fetchSummary()
  fetchCurrentList()
})

// 点击充提卡片
const handleDepositWithdrawClick = (record: any) => {
  console.log('点击充提记录:', record)
  // TODO: 跳转到详情或显示弹窗
}
</script>

<template>
  <div class="deposit-withdraw-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">充提记录</span>
        <div style="width: 24px;"></div>
      </div>
         <!-- 提示信息 -->
      <div class="px-3">
        <div class="info-tip">
          <van-image src="./static/images/common/lightBulb.png" alt="提示" class="tip-icon" fit="contain" />
          <span class="tip-text">{{ tipText }}</span>
        </div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="disablePullRefresh"
      @refresh="onRefresh"
      class="deposit-withdraw-pull-refresh"
    >
      <!-- 充提总计卡片 -->
      <div class="px-3 py-2 pt-[94px]">
        <FinanceCard
          class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '充值金额', value: formatMoneyWithCommas(depositWithdrawData.depositAmount, 2, true) },
              { label: '提现金额', value: formatMoneyWithCommas(depositWithdrawData.withdrawAmount, 2, true) }
            ]
          ]"
        />
      </div>

      <!-- Tabs + 搜索和筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
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
            @keyup.enter="handleSearch"
          >
            <template #right-icon>
              <van-icon name="search" size="18" @click="handleSearch" />
            </template>
          </van-search>

          <!-- 筛选条件行 -->
          <div class="filter-scroll-container">
            <!-- 账变时间 -->
            <TimeFilterDropdown
              v-model="selectTimeRange"
              v-model:show-calendar="showCalendar"
              title="账变时间"
              height="1.5rem"
            />

            <!-- 状态筛选 -->
            <div class="filter-dropdown">
            <Filled
              v-model="statusFilter"
              :options="statusOptions"
              height="1.5rem"
            />
            </div>

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
      </div>

      <!-- Loading 状态 -->
      <div v-if="loading" class="record-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="currentList.length === 0" :style="{ minHeight: 'calc(100vh - 346px)' }" class="flex-1 flex items-center">
        <empty />
      </div>

      <!-- 充提列表 -->
      <div v-else class="record-list-container">
        <DepositWithdrawCard
          v-for="(record, index) in currentList"
          :key="index"
          :record="record"
          :type="activeTab === 0 ? 'deposit' : 'withdraw'"
          :isDepositWithdrawFee="false"
          @click="handleDepositWithdrawClick(record)"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>
<style lang="scss" scoped>
.deposit-withdraw-container {
  background-color: white;
  padding-bottom: 2rem;
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

.deposit-withdraw-pull-refresh {
  :deep(.van-pull-refresh__track) {
    overflow: visible !important;
  }
  :deep(.van-pull-refresh__head) {
    top: 92px;
  }
}

/* 筛选栏固定 */
.sticky-filter-bar {
  position: relative;
  z-index: 10;
  background-color: white;
  transition: all 0.3s;

  &.is-fixed {
    position: fixed;
    top: 84px; /* Header 高度 (h-11 + info-tip) */
    left: 0;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
}

/* 用於吸頂定位的佔位元素 */
.filter-bar-placeholder {
  /* 高度由JS動態設定 */
}

/* Loading 状态 */
.record-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
}

.record-list-container {
  flex: 1;
  margin-top: 8px;
  padding: 0 0.75rem;
  padding-bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 2rem);
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 提示信息 */
.info-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-bg-floor-1-2);
  border-radius: 20px;
  height: 40px;
  padding: 8px 12px;
}

.tip-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  object-fit: contain;
}

.tip-text {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-primary-normal);
  line-height: 1.5;
}

/* 筛选器横向滚动容器 */
.filter-scroll-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* 筛选器 Dropdown 样式 */
.filter-dropdown {
  flex: none;
  scroll-snap-align: start;

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
