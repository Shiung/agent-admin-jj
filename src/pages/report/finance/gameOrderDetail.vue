<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Big from 'big.js'
import FinanceCard from './components/financeCard.vue'
import OrderCard from './components/orderCard.vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import OrderDetailSheet from '@/components/OrderDetailSheet/index.vue'
import { useSticky } from '@/composables/useSticky'
import dayjs from 'dayjs'
import apis from '@/apis'
import type { GameDetailData, GameDetailItem } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)

// 游戏类型映射
const gameStore = useGameStore()

// From route query
const gameName = computed(() => route.query.gameName as string || '游戏详情')
const gameType = computed(() => route.query.gameType as string || '-')

// 游戏注单数据
const gameDetailData = ref<GameDetailData | null>(null)

// Sticky header logic
const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none', // This page is not controlled by a tab query
  stickyTop: 84 // Height of the fixed header
})

// 综合判断是否禁用下拉刷新（sticky 固定时或 calendar 打开时都禁用）
const disablePullRefresh = computed(() => pullRefreshDisabled.value || showCalendar.value)

// 游戏数据汇总
const gameData = computed(() => {
  if (!gameDetailData.value) return {
    totalProfit: 0,
    venueFee: 0,
    betAmount: 0,
    validBet: 0
  }

  const summary = gameDetailData.value.MoreItems
  return {
    totalProfit: summary.SumProfitGold, // 会员总输赢
    venueFee: summary.SumApiFee, // 场馆费
    betAmount: summary.SumTotalBetGold, // 总投注金额
    validBet: summary.SumValidWater // 总有效流水
  }
})
const searchKeyword = ref('')

// 结算时间选择
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

const statusFilter = ref('全部状态')
const sortType = ref('结算时间降序')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 状态映射：UI显示 -> API参数
const statusMap: Record<string, number> = {
  '全部状态': 0,
  '已结算': 1,
  '已取消': 2,
  '未结算': -1
}

// 排序映射：UI显示 -> API参数
// 可用字段：TotalBetGold(总投注), ValidWater(有效投注), WinGold(派彩), CompanyWinLose(总盈利), SettlementTime(结算时间)
const sortMap: Record<string, string> = {
  '结算时间降序': '-SettlementTime',
  '结算时间升序': 'SettlementTime',
  '盈利降序': '-CompanyWinLose',
  '盈利升序': 'CompanyWinLose'
}

// 加载数据
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态
const fetchGameDetail = async (isRefreshing = false) => {
  try {
    // 下拉刷新时不显示 loading（顶部已有刷新动画）
    if (!isRefreshing) {
      loading.value = true
    }
    const { BeginTime, EndTime } = getTimeRange()

    const response = await apis.admin.getGameDetail({
      Page: currentPage.value,
      PageSize: pageSize.value,
      BeginTime,
      EndTime,
      GameType: gameType.value, // 游戏场馆代码
      LoginAccount: searchKeyword.value || undefined, // 会员账号搜索
      SelectTimeType: 2, // 2=结算时间
      Status: statusMap[statusFilter.value],
      Sort: sortMap[sortType.value]
    })

    if (response.data.Code === 200 && response.data.Data) {
      gameDetailData.value = response.data.Data
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取游戏注单详情失败:', error)
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

// 格式化注单状态
const formatStatus = (status: number): 'completed' | 'pending' | 'cancelled' => {
  if (status === 1) return 'completed' // 已结算
  if (status === 2) return 'cancelled' // 已取消
  return 'pending' // 未结算
}

// 格式化注单列表数据
const orderList = computed(() => {
  if (!gameDetailData.value) return []

  return gameDetailData.value.Items.map(item => ({
    orderNo: item.TransactionId,
    status: formatStatus(item.Status),
    betAmount: item.TotalBetGold,
    validBet: item.ValidWater,
    profit: item.CompanyWinLose,
    username: item.LoginAccount,
    vipLevel: `VIP${item.VipLevel || 0}`,
    time: dayjs.unix(item.SettlementTime).format('YYYY-MM-DD HH:mm:ss'),
    rawData: item // 保留原始数据用于详情展示
  }))
})

const statusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '已结算', value: '已结算' },
  { label: '未结算', value: '未结算' },
  { label: '已取消', value: '已取消' },
]
const sortOptions = [
  { label: '结算时间降序', value: '结算时间降序' },
  { label: '结算时间升序', value: '结算时间升序' },
  { label: '盈利降序', value: '盈利降序' },
  { label: '盈利升序', value: '盈利升序' },
]

// Pull to refresh
const refreshing = ref(false)
const onRefresh = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchGameDetail(true) // 传入 true 表示是下拉刷新
  refreshing.value = false
}

// Navigation
const handleBack = () => {
  const tab = route.query.tab || '1'
  router.push({
    name: 'financeGameRecord',
    query: {
      tab,
      startTime: selectTimeRange.value.startTime.toString(),
      endTime: selectTimeRange.value.endTime.toString()
    }
  })
}

// Search
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchGameDetail()
}

// 监听筛选条件变化
watch([selectTimeRange, statusFilter, sortType], () => {
  currentPage.value = 1 // 重置到第一页
  fetchGameDetail()
}, { deep: true })

// 页面挂载时加载数据
onMounted(async () => {
  // 加载游戏配置数据
  await gameStore.fetchSolidConfig()
  // 加载游戏注单详情
  fetchGameDetail()
})

// Order Detail Popup
const showOrderDetail = ref(false)
const selectedOrderRawData = ref<GameDetailItem | null>(null)

const handleOrderClick = (order: any) => {
  selectedOrderRawData.value = order.rawData
  showOrderDetail.value = true
}
</script>

<template>
  <div class="game-order-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">{{ gameName }}</span>
        <div style="width: 24px;"></div>
      </div>
      <!-- 提示信息 -->
      <div class="px-3">
        <div class="info-tip">
          <van-image src="./static/images/common/lightBulb.png" alt="提示" class="tip-icon" fit="contain" />
          <span class="tip-text">以下数据仅统计「已结算」的订单</span>
        </div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="disablePullRefresh"
      @refresh="onRefresh"
      class="game-order-pull-refresh"
    >
      <!-- 总计卡片 -->
      <div class="px-3 py-2 pt-[94px]">
        <FinanceCard
          class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '总盈利', value: gameData.totalProfit, isMoney: true },
              { label: '场馆费', value: formatMoneyWithCommas(gameData.venueFee, 2, true) }
            ],
            [
              { label: '投注金额', value: formatMoneyWithCommas(gameData.betAmount, 2, true) },
              { label: '有效投注', value: formatMoneyWithCommas(gameData.validBet, 2, true) }
            ]
          ]"
        />
      </div>

      <!-- 搜索和筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
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
            <!-- 结算时间 -->
            <TimeFilterDropdown
              v-model="selectTimeRange"
              title="结算时间"
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
      <div v-if="loading" class="order-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!gameDetailData || orderList.length === 0" :style="{ minHeight: 'calc(100vh - 346px)' }" class="flex-1 flex items-center">
        <empty />
      </div>

      <!-- 订单列表 -->
      <div v-else class="order-list-container">
        <OrderCard
          v-for="(order, index) in orderList"
          :key="index"
          :order="order"
          @click="handleOrderClick(order)"
        />
      </div>
    </van-pull-refresh>

    <!-- 订单详情弹窗 -->
    <OrderDetailSheet
      v-model:show="showOrderDetail"
      :raw-data="selectedOrderRawData"
    />
  </div>
</template>

<style lang="scss" scoped>
.game-order-container {
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

.game-order-pull-refresh {
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
}

/* 用於吸頂定位的佔位元素 */
.filter-bar-placeholder {
  /* 高度由JS動態設定 */
}

.order-list-container {
  flex: 1;
  margin-top: 8px;
  padding: 0 0.75rem;
  padding-bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 2rem);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Loading 状态 */
.order-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
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

  /* 输入框样式 */
  .van-field__control {
    font-size: 14px;
    color: var(--color-neutral-basic);
  }

  .van-field__control::placeholder {
    color: var(--color-neutral-secondary);
  }

  /* 右侧图标区域 */
  .van-field__right-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-neutral-secondary);
  }

  /* 清除按钮样式 */
  .van-field__clear {
    color: var(--color-neutral-secondary);
  }

  /* 搜索图标样式 */
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
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
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
