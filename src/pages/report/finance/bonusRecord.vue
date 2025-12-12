<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FinanceCard from './components/financeCard.vue'
import BonusCard from './components/bonusCard.vue'
import Big from 'big.js'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import dayjs from 'dayjs'
import apis from '@/apis'
import type { BonusRecordItem } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { bonusType } from '@/utils/mappingStatus'

const router = useRouter()
const route = useRoute()

// API Data
const bonusSummary = ref({
  BackWaterAmount: 0,
  BonusAmount: 0
})
const bonusRecords = ref<BonusRecordItem[]>([])

// Pagination and Loading
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)

// Error Handling
const error = ref(false)

// 会员账号搜索
const searchKeyword = ref('')

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

// 排序选择
const sortType = ref('领奖时间降序')
const sortOptions = [
  { label: '领奖时间降序', value: '领奖时间降序' },
  { label: '领奖时间升序', value: '领奖时间升序' },
  { label: '红利金额降序', value: '红利金额降序' },
  { label: '红利金额升序', value: '红利金额升序' }
]

// 映射排序类型到 API 参数
const currentSortType = computed(() => {
  switch (sortType.value) {
    case '领奖时间降序':
      return '-send_time'
    case '领奖时间升序':
      return 'send_time'
    case '红利金额降序':
      return '-bonus'
    case '红利金额升序':
      return 'bonus'
    default:
      return '-send_time'
  }
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

// 搜索处理
const handleSearch = () => {
  resetAndFetchData()
}

// 点击红利卡片
const handleBonusClick = (record: BonusRecordItem) => {
  console.log('点击红利记录:', record)
  // TODO: 跳转到详情或显示弹窗
}

// 转换红利记录为卡片所需格式
const formatBonusRecord = (record: BonusRecordItem) => {
  const mappedBonusType = bonusType(record.BonusType)
  return {
    orderNo: record.OrderId,
    username: record.Account,
    vipLevel: `VIP${record.VipLevel || 0}`,
    bonusAmount: (record.Bonus || 0) / 100,
    flowRequirement: (record.DrawAmount || 0) / 100,
    bonusType: typeof mappedBonusType === 'string' ? mappedBonusType : String(mappedBonusType),
    activityType: record.BonusTitle,
    walletType: '中心钱包', // API 未返回钱包类型，使用默认值
    auditTime: record.CreateTime ? dayjs.unix(record.CreateTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    receiveTime: record.SendTime ? dayjs.unix(record.SendTime).format('YYYY-MM-DD HH:mm:ss') : '-'
  }
}

// 获取红利总计数据
const fetchBonusSummary = async () => {
  try {
    const { BeginTime, EndTime } = getTimeRange()
    const response = await apis.admin.getBonusSummary({
      BeginTime,
      EndTime
    })
    if (response.data.Code === 200) {
      bonusSummary.value = response.data.Data
    } else {
      showToast({ message: response.data.Msg || '获取总计数据失败', position: 'bottom' })
    }
  } catch (err) {
    console.error('获取红利总计数据失败:', err)
    showToast({ message: '获取总计数据异常', position: 'bottom' })
  }
}

// 获取红利列表数据
const fetchBonusList = async () => {
  loading.value = true
  error.value = false
  try {
    const { BeginTime, EndTime } = getTimeRange()
    const response = await apis.admin.getBonusRecord({
      Page: currentPage.value,
      PageSize: pageSize,
      LoginAccount: searchKeyword.value || undefined,
      BeginTime,
      EndTime,
      Status: 2,
      Sort: currentSortType.value
    })

    if (response.data.Code === 200) {
      const newRecords = response.data.Data.Items || []
      // 第一页时替换数据，否则追加
      if (currentPage.value === 1) {
        bonusRecords.value = newRecords
      } else {
        bonusRecords.value = bonusRecords.value.concat(newRecords)
      }
      const pagination = response.data?.Data?.Pagination
      totalCount.value = pagination?.MaxCount ?? 0

      if (bonusRecords.value.length >= totalCount.value) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      error.value = true
      showToast({ message: response.data.Msg || '获取列表数据失败', position: 'bottom' })
    }
  } catch (err) {
    error.value = true
    console.error('获取红利列表数据异常:', err)
    showToast({ message: '获取列表数据异常', position: 'bottom' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 重置分页并重新获取数据 (keepData: 是否保留现有数据)
const resetAndFetchData = (keepData = false) => {
  currentPage.value = 1
  if (!keepData) {
    bonusRecords.value = []
  }
  finished.value = false
  error.value = false
  fetchBonusSummary()
  fetchBonusList()
}

// 刷新处理 (保留现有数据)
const onRefresh = async () => {
  refreshing.value = true
  resetAndFetchData(true)
}

// 滚动到底部加载更多
const onLoad = () => {
  if (!finished.value && !loading.value) {
    fetchBonusList()
  }
}

// Watchers
watch([selectTimeRange, sortType], () => {
  resetAndFetchData()
}, { deep: true })

onMounted(() => {
  resetAndFetchData()
})
</script>

<template>
  <div class="bonus-record-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">红利记录</span>
        <div style="width: 24px;"></div>
      </div>
    </div>
    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="disablePullRefresh"
      @refresh="onRefresh"
      class="bonus-record-pull-refresh"
    >
      <!-- 红利总计卡片 -->
      <div class="px-3 pb-2 pt-[54px]">
        <FinanceCard
          class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '实领红利', value: formatMoneyWithCommas(bonusSummary.BonusAmount, 2, true) },
              { label: '返水金额', value: formatMoneyWithCommas(bonusSummary.BackWaterAmount, 2, true) },
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
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #right-icon>
              <van-icon name="search" size="18" @click="handleSearch" />
            </template>
          </van-search>

          <!-- 筛选条件行 -->
          <div class="filter-scroll-container">
            <!-- 领奖时间 -->
            <TimeFilterDropdown
              v-model="selectTimeRange"
              v-model:show-calendar="showCalendar"
              title="领奖时间"
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

      <!-- 红利列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :error="error"
        error-text="请求失败"
        @load="onLoad"
        :class="{ 'hide-list-loading': refreshing }"
        :style="bonusRecords.length === 0 ? { height: 'calc(100vh - 340px)', display: 'flex'} : {}"
      >
        <div v-if="bonusRecords.length > 0" class="record-list-container">
          <BonusCard
            v-for="record in bonusRecords"
            :key="record.OrderId"
            :record="formatBonusRecord(record)"
            @click="handleBonusClick(record)"
          />
        </div>
        <div
          v-else-if="finished || refreshing"
          class="flex flex-1 w-full items-center justify-center"
        >
          <empty />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>
<style lang="scss" scoped>
.bonus-record-container {
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

.bonus-record-pull-refresh {
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

.record-list-container {
  flex: 1;
  margin-top: 8px;
  padding: 0 0.75rem;
  padding-bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 2rem);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* van-list loading 居中 */
:deep(.van-list__loading) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
}
/* van-list error-text 居中 */
:deep(.van-list__error-text) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
}

/* 下拉刷新时隐藏 van-list loading */
.hide-list-loading :deep(.van-list__loading) {
  display: none !important;
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
