<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Big from 'big.js'
import FinanceCard from './components/financeCard.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import dayjs from 'dayjs'
import apis from '@/apis'
import type { ReportCenterFinanceDetailData } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const router = useRouter()
const route = useRoute()

// 财务详情数据
const financeDetailData = ref<ReportCenterFinanceDetailData | null>(null)

// 游戏记录汇总数据
const gameRecordData = computed(() => {
  if (!financeDetailData.value) return {
    totalProfit: 0,
    venueFee: 0,
    betAmount: 0,
    validBet: 0
  }

  const total = financeDetailData.value.Total
  return {
    totalProfit: total.WinLoseGoldTotal, // 输赢总计
    venueFee: total.ApiFeeTotal, // 场馆费
    betAmount: total.BetGoldTotal, // 投注总额
    validBet: total.ValidWaterTotal // 有效投注总额
  }
})

// ==================== 结算时间筛选 ====================
// 使用 TimeFilterDropdown 组件
// 默认：本月（如果从上一页传递了参数则使用传递的时间）
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

// 获取时间戳范围（用于 API 调用）
const getTimeRange = (): { BeginTime: number; EndTime: number } => {
  return {
    BeginTime: selectTimeRange.value.startTime,
    EndTime: selectTimeRange.value.endTime
  }
}

// 排序选择
const sortType = ref('总盈利降序')

// 排序选项
const sortOptions = [
  { label: '总盈利降序', value: '总盈利降序' },
  { label: '总盈利升序', value: '总盈利升序' },
]

// 排序映射：UI显示 -> API参数
const sortMap: Record<string, string> = {
  '总盈利降序': '-SumWinLoseGold',
  '总盈利升序': 'SumWinLoseGold'
}

// 加载数据
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态
const fetchFinanceDetail = async (isRefreshing = false) => {
  try {
    // 下拉刷新时不显示 loading（顶部已有刷新动画）
    if (!isRefreshing) {
      loading.value = true
    }
    const { BeginTime, EndTime } = getTimeRange()
    const response = await apis.report.getReportCenterFinanceDetail({
      BeginTime,
      EndTime,
      Sort: sortMap[sortType.value] // 添加排序参数
    })

    if (response.data.Code === 200 && response.data.Data) {
      financeDetailData.value = response.data.Data
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取财务详情失败:', error)
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

// 格式化游戏列表数据
const gameList = computed(() => {
  if (!financeDetailData.value || !financeDetailData.value.Items) return []

  // 后端已经处理排序，直接使用返回的数据
  return financeDetailData.value.Items.map(item => ({
    id: item.GameType,
    name: gameStore.allGameTypeMapping[item.GameType] ?? item.GameType,
    data: [
      [
        {
          label: '总盈利',
          value: item.SumWinLoseGold,
          isMoney: true
        },
        {
          label: '场馆费',
          value: formatMoneyWithCommas(item.ApiFeeTotal, 2, true)
        }
      ],
      [
        {
          label: '投注金额',
          value: formatMoneyWithCommas(item.SumBetGold, 2, true)
        },
        {
          label: '有效投注',
          value: formatMoneyWithCommas(item.SumValidWater, 2, true)
        }
      ]
    ]
  }))
})

// 下拉刷新
const refreshing = ref(false)
const onRefresh = async () => {
  await fetchFinanceDetail(true) // 传入 true 表示是下拉刷新
  refreshing.value = false
}

// 监听时间范围变化
watch(selectTimeRange, () => {
  fetchFinanceDetail()
}, { deep: true })

// 监听排序变化
watch(sortType, () => {
  fetchFinanceDetail()
})

// 页面挂载时加载数据
onMounted(() => {
  fetchFinanceDetail()
})

import { useSticky } from '@/composables/useSticky'

const containerRef = ref<HTMLElement | null>(null)

const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none', // 此頁面不基於 tab 顯示，給一個不會匹配的值
  stickyTop: 44 // 吸頂時距離頂部的距離
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

// 控制说明气泡显示
const showInfoPopover = ref(false)

// 点击游戏卡片
const handleGameClick = (gameData: any) => {
  // 跳转到游戏注单详情页，传递当前选中的时间范围
  const tab = route.query.tab || '1'
  router.push({
    name: 'financeGameOrderDetail',
    query: {
      gameName: gameData.name,
      gameType: gameData.id,
      tab,
      startTime: selectTimeRange.value.startTime.toString(),
      endTime: selectTimeRange.value.endTime.toString()
    }
  })
}
</script>

<template>
  <div class="game-record-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">游戏记录</span>
        <div style="width: 24px;"></div>
        <!-- 不确定UI会不会加回来 -->
        <van-popover
          v-if="false"
          v-model:show="showInfoPopover"
          placement="bottom-end"
          :offset="[4, 6]"
        >
          <div class="popover-content">
            以下数据仅统计「已结算、已完成、已出款」的订单
          </div>
          <template #reference>
            <van-icon name="info" size="20" color="var(--color-primary-normal)" />
          </template>
        </van-popover>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="disablePullRefresh"
      @refresh="onRefresh"
      class="game-record-pull-refresh"
    >
      <!-- 游戏记录总计卡片 -->
      <div class="px-3 py-2 pt-[56px]">
        <FinanceCard
          class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '总盈利', value: gameRecordData.totalProfit, isMoney: true },
              { label: '场馆费', value: formatMoneyWithCommas(gameRecordData.venueFee, 2, true) }
            ],
            [
              { label: '投注金额', value: formatMoneyWithCommas(gameRecordData.betAmount, 2, true) },
              { label: '有效投注', value: formatMoneyWithCommas(gameRecordData.validBet, 2, true) }
            ]
          ]"
        />
      </div>

      <!-- 筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2" :class="{ 'is-fixed': isFilterBarFixed }">
          <div class="filter-scroll-container">
            <!-- 结算时间 -->
            <TimeFilterDropdown
              v-model="selectTimeRange"
              v-model:show-calendar="showCalendar"
              title="结算时间"
              height="1.5rem"
            />

            <!-- 排序方式 -->
            <div class="filter-dropdown">
              <Dropdown
                v-model="sortType"
                :options="sortOptions"
                height="1.5rem"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading 状态 -->
      <div v-if="loading" class="game-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!financeDetailData || gameList.length === 0" :style="{ minHeight: 'calc(100vh - 306px)' }" class="flex-1 flex items-center">
        <empty />
      </div>

      <!-- 游戏列表 -->
      <div v-else class="game-list-container">
        <FinanceCard
          v-for="game in gameList"
          :key="game.id"
          :title="game.name"
          :data="game.data"
          @click="handleGameClick(game)"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>
<style lang="scss" scoped>
.game-record-container {
  background-color: white;
  padding-bottom: 2rem; /* 增加底部內邊距，避免內容被遮擋 */
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

.game-record-pull-refresh {
  /* 移除內部滾動容器樣式 */
  :deep(.van-pull-refresh__track) {
    overflow: visible !important;
  }
  :deep(.van-pull-refresh__head) {
    top: 44px;
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
    top: 44px; /* Header 高度 h-11 = 44px */
    left: 0;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

/* 用於吸頂定位的佔位元素 */
.filter-bar-placeholder {
  /* 高度由JS動態設定 */
}

.game-list-container {
  flex: 1;
  margin-top: 8px;
  padding: 0 0.75rem;
  padding-bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 2rem);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Loading 状态 */
.game-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
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

/* Popover 气泡样式 */
.popover-content {
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-neutral-basic);
  max-width: 240px;
}

:deep(.van-popover__content) {
  background-color: white;
  border-radius: 8px;
  box-shadow: -2px -2px -1px rgba(0, 0, 0, 0.15);
}

:deep(.van-popover__arrow) {
  margin-right: -7px;
}
</style>
