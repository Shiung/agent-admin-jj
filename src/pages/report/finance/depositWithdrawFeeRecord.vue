<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Big from 'big.js'
import FinanceCard from './components/financeCard.vue'
import DepositWithdrawCard from './components/depositWithdrawCard.vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import apis from '@/apis'
import dayjs from 'dayjs'
import type { PayRecordItem, WithdrawRecordItem } from '@/apis/codegen/data-contracts'
import { getWithdrawName } from '@/utils/finance'

const router = useRouter()
const route = useRoute()

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

const getTimeRange = (): { BeginTime: number; EndTime: number } => {
  return {
    BeginTime: selectTimeRange.value.startTime,
    EndTime: selectTimeRange.value.endTime
  }
}

// Tab 切换
const activeTab = ref(0)
const tabs = ['充值', '提现']

// 会员账号搜索
const searchKeyword = ref('')

// 排序选择
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  // { label: '账变金额降序', value: '账变金额降序' },
  // { label: '账变金额升序', value: '账变金额升序' },
]

// 排序映射：UI显示 -> API参数
const sortMap: Record<string, string> = {
  '账变时间降序': '-transaction_time',
  '账变时间升序': 'transaction_time',
  // '账变金额降序': '-amount',
  // '账变金额升序': 'amount'
}

// 加载数据
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态
const currentPage = ref(1)
const pageSize = ref(20)

// 充值类型映射表：Key -> Name
const payTypeMap = ref<Record<number, string>>({})

// 充值手续费原始数据
const payRecordsData = ref<PayRecordItem[]>([])

// 提现手续费原始数据
const withdrawRecordsData = ref<WithdrawRecordItem[]>([])

// 手续费总计数据（从 API 获取）
const feeTotal = ref({ TotalPayFee: 0, TotalWithdrawFee: 0 })

// 手续费总计数据（根据当前Tab显示）
const feeSummaryData = computed(() => {
   return [
      [
        { label: '充值手续费', value: formatMoneyWithCommas(feeTotal.value.TotalPayFee, 2, true) },
        { label: '提现手续费', value: formatMoneyWithCommas(feeTotal.value.TotalWithdrawFee, 2, true) }
      ]
    ]
})

// 格式化充值手续费记录
const formatPayRecord = (item: PayRecordItem) => {
  const payTypeName = item.PayType ? (payTypeMap.value[item.PayType] || `支付方式${item.PayType}`) : '-'

  return {
    orderNo: item.OrderId || '-',
    status: 'completed' as const, // 手续费记录都是已完成的
    username: item.LoginAccount || '-',
    vipLevel: 'VIP0', // API 未返回 VIP 等级
    applyAmount: item.Amount || 0,
    actualAmount: (item.Amount || 0) - (item.Fee || 0), // 实际金额 = 充值金额 - 手续费
    depositType: payTypeName,
    depositRate: item.FeeRate ? `${(item.FeeRate / 100)}%` : '0%', // 千分比转百分比
    depositFee: item.Fee || 0,
    time: item.TransactionTime ? dayjs.unix(item.TransactionTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    rawData: item
  }
}

// 格式化提现手续费记录
const formatWithdrawRecord = (item: WithdrawRecordItem) => {
  const withdrawTypeName = getWithdrawName(item.WithdrawType || '')
  return {
    orderNo: item.OrderId || '-',
    status: 'completed' as const, // 手续费记录都是已完成的
    username: item.LoginAccount || '-',
    vipLevel: 'VIP0', // API 未返回 VIP 等级
    applyAmount: item.Amount || 0,
    actualAmount: (item.Amount || 0) - (item.Fee || 0), // 实际金额 = 提现金额 - 手续费
    depositType: withdrawTypeName,
    depositRate: item.FeeRate ? `${(item.FeeRate / 100)}%` : '0%', // 千分比转百分比
    depositFee: item.Fee || 0,
    time: item.TransactionTime ? dayjs.unix(item.TransactionTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    rawData: item
  }
}

// 当前显示的列表
const currentList = computed(() => {
  if (activeTab.value === 0) {
    return payRecordsData.value.map(formatPayRecord)
  } else {
    return withdrawRecordsData.value.map(formatWithdrawRecord)
  }
})

// 当前类型
const currentType = computed(() => {
  return activeTab.value === 0 ? 'deposit' : 'withdraw'
})

// 获取充值类型列表（用于映射）
const fetchRechargeTypeList = async () => {
  try {
    const response = await apis.config.getRechargeTypeList()

    if (response.data.Code === 200 && response.data.Data) {
      // 将数组转换为 Key -> Name 的映射表
      const mapping: Record<number, string> = {}
      response.data.Data.forEach(item => {
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

// 获取手续费总计
const fetchFeeTotal = async () => {
  try {
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getPayMoneyWithdrawFeeDetails({
      Page: 1,
      PageSize: 1,
      BeginTime,
      EndTime
    })

    if (response.data.Code === 200 && response.data.Data) {
      feeTotal.value = response.data.Data.Total || { TotalPayFee: 0, TotalWithdrawFee: 0 }
    }
  } catch (error) {
    console.error('获取手续费总计失败:', error)
  }
}

// 获取充值手续费记录
const fetchPayRecords = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getPayRecords({
      Page: currentPage.value,
      PageSize: pageSize.value,
      BeginTime,
      EndTime,
      LoginAccount: searchKeyword.value || undefined,
      Sort: sortMap[sortType.value]
    })

    if (response.data.Code === 200 && response.data.Data) {
      payRecordsData.value = response.data.Data.Items || []
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取充值手续费记录失败:', error)
    showToast({
      message: '加载失败，请稍后重试',
      position: 'bottom',
    })
  } finally {
    loadingToast.close()
  }
}

// 获取提现手续费记录
const fetchWithdrawRecords = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getWithdrawRecords({
      Page: currentPage.value,
      PageSize: pageSize.value,
      BeginTime,
      EndTime,
      LoginAccount: searchKeyword.value || undefined,
      Sort: sortMap[sortType.value]
    })

    if (response.data.Code === 200 && response.data.Data) {
      withdrawRecordsData.value = response.data.Data.Items || []
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取提现手续费记录失败:', error)
    showToast({
      message: '加载失败，请稍后重试',
      position: 'bottom',
    })
  } finally {
    loadingToast.close()
  }
}

// 获取当前Tab的列表
const fetchCurrentList = async () => {
  if (activeTab.value === 0) {
    await fetchPayRecords()
  } else {
    await fetchWithdrawRecords()
  }
}

// Pagination and Loading
const loading = ref(false)
const finished = ref(true) // 默认 true，因为这个页面不需要分页加载
const refreshing = ref(false)

// 下拉刷新
const onRefresh = async () => {
  currentPage.value = 1
  await Promise.all([fetchFeeTotal(), fetchCurrentList()])
  refreshing.value = false
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
  fetchCurrentList()
}

// 点击订单卡片
const handleOrderClick = (order: any) => {
  console.log('点击订单:', order)
  // TODO: 跳转到订单详情或执行其他操作
}

// 监听筛选条件变化
watch([selectTimeRange, sortType], () => {
  currentPage.value = 1
  fetchFeeTotal() // 更新手续费总计
  fetchCurrentList()
}, { deep: true })

// 监听 Tab 切换
watch(activeTab, () => {
  currentPage.value = 1
  sortType.value = '账变时间降序'
  fetchCurrentList()
})

// 页面挂载时加载数据
onMounted(async () => {
  await fetchRechargeTypeList() // 先加载充值类型映射表
  fetchFeeTotal() // 加载手续费总计
  fetchCurrentList()
})
</script>

<template>
  <div class="fee-record-container">
    <!-- 头部导航 -->
    <div class="fixed-header">
       <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">充提手续费记录</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 手续费总计卡片 -->
    <div class="px-3 py-2 pt-[56px]">
      <FinanceCard
        class="shadow-sm"
        title=""
        :show-arrow="false"
        :show-background-color="false"
        :data="feeSummaryData"
      />
    </div>

    <!-- Tabs + 搜索和筛选器 -->
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

    <!-- 手续费记录列表 -->
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
          @load="() => {}"
        >
          <DepositWithdrawCard
            v-for="(order, index) in currentList"
            :is-deposit-withdraw-fee="true"
            :key="index"
            :record="order"
            :type="currentType"
            @click="handleOrderClick(order)"
          />
        </van-list>

        <empty v-if="currentList.length === 0 && !loading && finished" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fee-record-container {
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
