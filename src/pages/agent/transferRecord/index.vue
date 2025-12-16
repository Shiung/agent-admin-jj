<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import RecordCard from '@/components/RecordCard/index.vue'
import SummaryCard from '@/components/SummaryCard/index.vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { useSticky } from '@/composables/useSticky'
import API from '@/apis'

const router = useRouter()

// 用户信息
const userStore = useUserStore()
const { productPackages } = storeToRefs(userStore)

// 容器 ref
const containerRef = ref<HTMLElement | null>(null)

// 使用吸顶逻辑
const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none',
  stickyTop: 44
})

// 时间戳转秒
const timestampToSecond = (timestamp: number) => +new Big(timestamp).div(1000).toFixed(0)

// 初始化时间范围（默认本月）
const selectTimeRange = ref({
  startTime: timestampToSecond(dayjs().startOf('month').valueOf()),
  endTime: timestampToSecond(dayjs().endOf('month').valueOf())
})

// Calendar 打开状态
const showCalendar = ref(false)

// 综合判断是否禁用下拉刷新
const disablePullRefresh = computed(() => pullRefreshDisabled.value || showCalendar.value)

// 转账金额总计
const totalTransferAmount = ref(0)

// 会员账号搜索
const searchKeyword = ref('')

// 转账类型筛选
const transferTypeFilter = ref<string | number>('all')
const transferTypeOptions = [
  { label: '全部转账', value: 'all' },
  { label: '额度转账', value: 0 },
  { label: '佣金转账', value: 1 }
]

// 排序筛选
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  { label: '转账金额降序', value: '转账金额降序' },
  { label: '转账金额升序', value: '转账金额升序' }
]

// 转账记录列表数据
const transferRecords = ref<any[]>([])

// 分页和加载状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = 20
const totalCount = ref(0)
const error = ref(false)

// 返回上一页
const handleBack = () => {
  router.back()
}

// 搜索处理
const handleSearch = () => {
  if (searchKeyword.value.length >= 1) {
    resetList()
  }
}

// 会员账号输入监听（当输入字元>=1自动加载清单）
watch(searchKeyword, (newVal) => {
  if (newVal.length === 0) {
    resetList()
  }
})

// 监听时间范围变化
watch(selectTimeRange, () => {
  resetList()
}, { deep: true })

// 处理筛选变化
watch([transferTypeFilter, sortType], () => {
  resetList()
})

// 重置列表
const resetList = (keepData = false) => {
  currentPage.value = 1
  if (!keepData) {
    transferRecords.value = []
    totalTransferAmount.value = 0
  }
  finished.value = false
  error.value = false
  loading.value = false // 重置加载状态，确保可以发起新请求
  loadMore()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  resetList(true) // 下拉刷新时保持原有数据，避免空状态闪现
}

// 排序类型映射到API参数
const getSortParam = (sortType: string): string => {
  const sortMap: Record<string, string> = {
    '账变时间降序': '-update_time',
    '账变时间升序': 'update_time',
    '转账金额降序': '-amount',
    '转账金额升序': 'amount'
  }
  return sortMap[sortType] || '-update_time'
}

// 加载更多
const loadMore = async () => {
  if (loading.value || finished.value) return

  try {
    loading.value = true
    error.value = false

    // 构建查询参数
    const query: any = {
      Page: currentPage.value,
      PageSize: pageSize,
      BeginTime: selectTimeRange.value.startTime,
      EndTime: selectTimeRange.value.endTime,
      TransferType: 1, // 固定为1（转账），2=代存
      Sort: getSortParam(sortType.value) // 排序参数
    }

    // 代理账号搜索
    if (searchKeyword.value) {
      query.AccountName = searchKeyword.value
    }

    // 转账类型筛选（WalletType: 1=佣金钱包, 2=额度钱包）
    if (transferTypeFilter.value !== 'all') {
      // 0=额度转账->WalletType=2, 1=佣金转账->WalletType=1
      query.WalletType = transferTypeFilter.value === 0 ? 2 : 1
    }

    const response = await API.admin.getAgentCreditLimitTransactionList(query)

    if (response.data.Code === 200) {
      let items = response.data.Data.Items || []

      // 添加序号
      items = items.map((item, index) => ({
        ...item,
        index: (currentPage.value - 1) * pageSize + index + 1
      }))

      if (currentPage.value === 1) {
        transferRecords.value = items
      } else {
        transferRecords.value = [...transferRecords.value, ...items]
      }

      // 更新总计
      totalTransferAmount.value = response.data.Data.Total?.TotalAmount || 0

      // 更新分页状态
      totalCount.value = response.data.Data.Pagination?.MaxCount || 0

      if (transferRecords.value.length >= totalCount.value) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      error.value = true
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom'
      })
    }
  } catch (err) {
    console.error('加载转账记录失败:', err)
    error.value = true
    showToast({
      message: '加载失败，请稍后重试',
      position: 'bottom'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化转账类型
const formatTransferType = (walletType: number) => {
  return walletType === 1 ? '佣金转账' : '额度转账'
}

// 转换记录为卡片数据
const getCardDetails = (record: any) => {
  return [
    { label: '订单号', value: record.OrderId, showCopy: true },
    { label: '转账类型', value: formatTransferType(record.WalletType) },
    { label: '转账金额', value: formatMoneyWithCommas(record.ApplyAmount, 2, true), highlight: true },
    { label: '备注', value: record.Remarks || '-', multiline: true }
  ]
}

const getCardTimes = (record: any) => {
  return [
    { label: '账变时间', value: formatTime(record.CreateTime) }
  ]
}

onMounted(() => {
  loadMore()
})
</script>

<template>
  <div ref="containerRef" class="transfer-record-container">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">转账记录</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
      :disabled="disablePullRefresh"
      class="transfer-record-pull-refresh"
    >
      <!-- 转账金额总计卡片 -->
      <div class="px-3 pb-2 pt-[54px]">
        <SummaryCard
          label="转账金额总计"
          :value="totalTransferAmount"
        />
      </div>

      <!-- 搜索和筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
          <!-- 代理账号搜索框 -->
          <van-search
            v-model="searchKeyword"
            placeholder="代理账号"
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
            <!-- 时间筛选 -->
            <TimeFilterDropdown
              v-model="selectTimeRange"
              v-model:show-calendar="showCalendar"
              title="账变时间"
              height="1.5rem"
            />

            <!-- 转账类型 -->
            <div class="filter-dropdown">
              <Dropdown
                v-model="transferTypeFilter"
                :options="transferTypeOptions"
                height="1.5rem"
              />
            </div>

            <!-- 排序 -->
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

      <!-- 记录列表 -->
      <van-list
        v-model:loading="loading"
        v-model:error="error"
        :finished="finished"
        finished-text="没有更多了"
        error-text="请求失败"
        @load="loadMore"
        :class="{ 'hide-list-loading': refreshing }"
        :style="transferRecords.length === 0 ? { height: 'calc(100vh - 340px)', display: 'flex'} : {}"
      >
        <div v-if="transferRecords.length > 0" class="record-list-container">
          <RecordCard
            v-for="record in transferRecords"
            :key="record.OrderId"
            :headerTitle="record.ReferenceAccount"
            :details="getCardDetails(record)"
            :times="getCardTimes(record)"
          />
        </div>
        <div
          v-else-if="finished || refreshing"
          class="flex flex-1 w-full items-center justify-center"
        >
          <van-empty description="暂无记录" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.transfer-record-container {
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

.transfer-record-pull-refresh {
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
    top: 44px;
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
