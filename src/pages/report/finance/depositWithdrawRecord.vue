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
  { label: '充值完成', value: '充值完成' },
  { label: '充值失败', value: '充值失败' },
  { label: '处理中', value: '处理中' },
  { label: '已审核', value: '已审核' },
  { label: '充值取消', value: '充值取消' },
  { label: '用户取消', value: '用户取消' }
]

// 提现状态选项
const withdrawStatusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '已出款', value: '已出款' },
  { label: '退款驳回', value: '退款驳回' },
  { label: '待处理', value: '待处理' },
  { label: '处理中', value: '处理中' }
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

// 充值状态文本映射：API参数 -> 状态文本
const depositStatusToText: Record<number, string> = {
  1: '处理中',
  2: '充值完成',
  3: '充值失败',
  4: '已审核',
  12: '充值取消',
  13: '用户取消'
}

/**
 * 根据 Status、Process、RefundScore 判断提现状态
 * @param status 订单状态
 * @param process 处理状态
 * @param refundScore 退款状态(0:待定 1:退币 2:不退)
 * @returns 状态标识和状态文本
 */
const getWithdrawStatus = (status?: number, process?: number, refundScore?: number): {
  type: 'completed' | 'failed' | 'primary' | 'cancelled'
  text: string
} => {
  // 待处理
  if (status === 1 && process !== undefined && process <= 4) {
    return { type: 'primary', text: '待处理' }
  }
  // 已出款
  if ((status === 2 || status === 4) && process === 7) {
    return { type: 'completed', text: '已出款' }
  }
  // 退款驳回
  if (status === 3 && process === 8 && refundScore === 1) {
    return { type: 'failed', text: '退款驳回' }
  }
  // 默认：处理中
  return { type: 'primary', text: '处理中' }
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
  '充值金额降序': '-real_amount',
  '充值金额升序': 'real_amount',
  '提现金额降序': '-real_amount',
  '提现金额升序': 'real_amount'
}

// 订单列表原始数据
const rechargeListData = ref<PlayerRechargeList[]>([])
const withdrawListData = ref<PlayerWithdrawList[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
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
  // 获取状态文本
  const statusText = item.Status !== undefined ? (depositStatusToText[item.Status] || '未知状态') : '未知状态'

  return {
    orderNo: item.OrderId || '-',
    status: statusType,
    statusText: statusText,
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
  // 根据 Status、Process、RefundScore 判断提现状态
  const withdrawStatus = getWithdrawStatus(item.Status, item.Process, item.RefundScore)
  const withdrawTypeName = getWithdrawName(item.AccountType || '')
  return {
    orderNo: item.OrderId || '-',
    status: withdrawStatus.type,
    statusText: withdrawStatus.text,
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
const fetchRechargeList = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
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
      const newRecords = response.data.Data.Items || []
      if (newRecords) {
        rechargeListData.value = rechargeListData.value.concat(newRecords)
      }
      // 检查是否已加载全部数据
      if (newRecords.length < pageSize.value) {
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

// 获取提现列表
const fetchWithdrawList = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
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
      const newRecords = response.data.Data.Items || []
      if (newRecords) {
        withdrawListData.value = withdrawListData.value.concat(newRecords)
      }
      // 检查是否已加载全部数据
      if (newRecords.length < pageSize.value) {
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

// 获取当前Tab的列表
const fetchCurrentList = async () => {
  if (activeTab.value === 0) {
    await fetchRechargeList()
  } else {
    await fetchWithdrawList()
  }
  loading.value = false
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  loading.value = true
  onLoad()
}

// 滚动到底部加载更多
const onLoad = async () => {
  if (refreshing.value) {
    currentPage.value = 1
    rechargeListData.value = []
    withdrawListData.value = []
    refreshing.value = false
    await fetchSummary()
  } else {
    if (currentPage.value) {
      currentPage.value++
    }
  }
  await fetchCurrentList()
}

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
  rechargeListData.value = []
  withdrawListData.value = []
  finished.value = false
  fetchCurrentList()
  fetchSummary()
}

// 监听筛选条件变化
watch([selectTimeRange, statusFilter, sortType], () => {
  currentPage.value = 1
  rechargeListData.value = []
  withdrawListData.value = []
  finished.value = false
  fetchCurrentList()
  fetchSummary()
}, { deep: true })

// 监听 Tab 切换
watch(activeTab, () => {
  currentPage.value = 1
  statusFilter.value = '全部状态'
  sortType.value = '账变时间降序'
  rechargeListData.value = []
  withdrawListData.value = []
  finished.value = false
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
        { Key: 138, Name: '额度代存' },
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
  <div class="deposit-withdraw-container">
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

    <!-- Tabs + 搜索和筛选器 -->
    <div class="flex flex-col px-3 py-2 gap-3">
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

    <!-- 充提列表 -->
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh
        v-model="refreshing"
        :style="[currentList.length === 0 && !loading && { height: '100%' }]"
        @refresh="onRefresh"
      >
        <van-list
          v-if="currentList.length > 0"
          v-model:loading="loading"
          class="flex flex-col gap-2"
          :finished="finished"
          :immediate-check="false"
          :finished-text="currentList.length > 0 ? '没有更多了' : ''"
          @load="onLoad"
        >
          <DepositWithdrawCard
            v-for="(record, index) in currentList"
            :key="index"
            :record="record"
            :type="activeTab === 0 ? 'deposit' : 'withdraw'"
            :isDepositWithdrawFee="false"
            @click="handleDepositWithdrawClick(record)"
          />
        </van-list>

        <empty v-if="currentList.length === 0 && !loading && finished" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.deposit-withdraw-container {
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
  height: calc(100vh - calc(var(--spacing) * 80));
  overflow: auto;
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
