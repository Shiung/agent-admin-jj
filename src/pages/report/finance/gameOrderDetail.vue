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
const loading = ref(false)
const finished = ref(true) // 默认 true，因为这个页面不需要分页加载
const fetchGameDetail = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
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
    loadingToast.close()
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
  await fetchGameDetail()
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
  <div class="game-order-container">
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

    <!-- 搜索和筛选器 -->
    <div class="px-3 py-2 space-y-3">
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

    <!-- 订单列表 -->
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh
        v-model="refreshing"
        :style="[!gameDetailData || orderList.length === 0 && !loading && { height: '100%' }]"
        @refresh="onRefresh"
      >
        <van-list
          v-if="gameDetailData && orderList.length > 0"
          v-model:loading="loading"
          class="flex flex-col gap-3"
          :finished="finished"
          :immediate-check="false"
          :finished-text="orderList.length > 0 ? '没有更多了' : ''"
          @load="() => {}"
        >
          <OrderCard
            v-for="(order, index) in orderList"
            :key="index"
            :order="order"
            @click="handleOrderClick(order)"
          />
        </van-list>

        <empty v-if="!gameDetailData || orderList.length === 0 && !loading && finished" />
      </van-pull-refresh>
    </div>

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
  height: calc(100vh - calc(var(--spacing) * 70));
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
