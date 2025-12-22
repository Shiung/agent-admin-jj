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
const pageSize = 20
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
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
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
      if (newRecords) {
        bonusRecords.value = bonusRecords.value.concat(newRecords)
      }
      const pagination = response.data?.Data?.Pagination
      totalCount.value = pagination?.MaxCount ?? 0

      // 检查是否已加载全部数据
      if (bonusRecords.value.length >= totalCount.value) {
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
    bonusRecords.value = []
    refreshing.value = false
  } else {
    if (currentPage.value) {
      currentPage.value++
    }
  }
  await fetchBonusList()
  loading.value = false
}

// 重置分页并重新获取数据
const resetAndFetchData = () => {
  currentPage.value = 1
  bonusRecords.value = []
  finished.value = false
  error.value = false
  fetchBonusSummary()
  fetchBonusList()
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
  <div class="bonus-record-container">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">红利记录</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

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

    <!-- 搜索和筛选器 -->
    <div class="flex flex-col px-3 py-2 gap-3">
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
        <!-- 领奖时间 -->
        <TimeFilterDropdown
          v-model="selectTimeRange"
          title="领奖时间"
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

    <!-- 红利列表 -->
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh
        v-model="refreshing"
        :style="[bonusRecords.length === 0 && !loading && { height: '100%' }]"
        @refresh="onRefresh"
      >
        <van-list
          v-if="bonusRecords.length > 0"
          v-model:loading="loading"
          class="flex flex-col gap-2"
          :finished="finished"
          :immediate-check="false"
          :finished-text="bonusRecords.length > 0 ? '没有更多了' : ''"
          @load="onLoad"
        >
          <BonusCard
            v-for="record in bonusRecords"
            :key="record.OrderId"
            :record="formatBonusRecord(record)"
            @click="handleBonusClick(record)"
          />
        </van-list>

        <empty v-if="bonusRecords.length === 0 && !loading && finished" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bonus-record-container {
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
