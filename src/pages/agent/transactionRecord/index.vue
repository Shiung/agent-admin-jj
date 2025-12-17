<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
import type { AgentCreditLimitTransactionItem } from '@/apis/codegen/data-contracts'

const router = useRouter()
const route = useRoute()

// 根据路由判断记录类型：deposit(代存) 或 transfer(转账)
const recordType = computed(() => route.meta.recordType as 'deposit' | 'transfer')

// 页面配置
const pageConfig = computed(() => {
  if (recordType.value === 'deposit') {
    return {
      title: '代存记录',
      summaryLabel: '代存金额总计',
      summaryIcon: '/static/images/common/depositRecordIcon.png',
      summaryColorType: '',
      searchPlaceholder: '会员账号',
      amountLabel: '代存金额',
      typeLabel: '代存类型',
      typeFilterOptions: [
        { label: '全部代存', value: 'all' },
        { label: '佣金代存', value: 1 },
        { label: '额度代存', value: 2 }
      ],
      sortOptions: [
        { label: '账变时间降序', value: '账变时间降序' },
        { label: '账变时间升序', value: '账变时间升序' },
        { label: '代存金额降序', value: '代存金额降序' },
        { label: '代存金额升序', value: '代存金额升序' }
      ],
      sortMap: {
        '账变时间降序': '-UpdateTime',
        '账变时间升序': 'UpdateTime',
        '代存金额降序': '-AbsApplyAmount',
        '代存金额升序': 'AbsApplyAmount'
      } as Record<string, string>,
      transferType: 2, // 代存
      isAgentDeposit: true,
      defaultTimeRange: 'today' as const, // 默认今天
      showVipLevel: true, // 显示VIP等级
      needProductName: true // 需要填充产品名称
    }
  } else {
    return {
      title: '转账记录',
      summaryLabel: '转账金额总计',
      summaryIcon: '/static/images/common/transferRecordIcon.png',
      summaryColorType: '',
      searchPlaceholder: '代理账号',
      amountLabel: '转账金额',
      typeLabel: '转账类型',
      typeFilterOptions: [
        { label: '全部转账', value: 'all' },
        { label: '额度转账', value: 0 },
        { label: '佣金转账', value: 1 }
      ],
      sortOptions: [
        { label: '账变时间降序', value: '账变时间降序' },
        { label: '账变时间升序', value: '账变时间升序' },
        { label: '转账金额降序', value: '转账金额降序' },
        { label: '转账金额升序', value: '转账金额升序' }
      ],
      sortMap: {
        '账变时间降序': '-UpdateTime',
        '账变时间升序': 'UpdateTime',
        '转账金额降序': '-AbsApplyAmount',
        '转账金额升序': 'AbsApplyAmount'
      } as Record<string, string>,
      transferType: 1, // 转账
      isAgentDeposit: undefined,
      defaultTimeRange: 'month' as const, // 默认本月
      showVipLevel: false, // 不显示VIP等级
      needProductName: false // 不需要填充产品名称
    }
  }
})

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

// 初始化时间范围
const getDefaultTimeRange = () => {
  if (pageConfig.value.defaultTimeRange === 'today') {
    return {
      startTime: timestampToSecond(dayjs().startOf('day').valueOf()),
      endTime: timestampToSecond(dayjs().endOf('day').valueOf())
    }
  } else {
    return {
      startTime: timestampToSecond(dayjs().startOf('month').valueOf()),
      endTime: timestampToSecond(dayjs().endOf('month').valueOf())
    }
  }
}

const selectTimeRange = ref(getDefaultTimeRange())

// Calendar 打开状态
const showCalendar = ref(false)

// 综合判断是否禁用下拉刷新
const disablePullRefresh = computed(() => pullRefreshDisabled.value || showCalendar.value)

// 金额总计
const totalAmount = ref(0)

// 会员/代理账号搜索
const searchKeyword = ref('')

// 类型筛选
const typeFilter = ref<string | number>('all')

// 排序筛选
const sortType = ref('账变时间降序')

// 记录列表数据
const records = ref<AgentCreditLimitTransactionItem[]>([])

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

// 会员/代理账号输入监听（当输入字元>=1自动加载清单）
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
watch([typeFilter, sortType], () => {
  resetList()
})

// 重置列表
const resetList = (keepData = false) => {
  currentPage.value = 1
  if (!keepData) {
    records.value = []
    totalAmount.value = 0
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
  return pageConfig.value.sortMap[sortType] || pageConfig.value.sortMap['账变时间降序']
}

// 加载更多
const loadMore = async () => {
  // 只检查 finished 状态，不检查 loading
  // 因为 van-list 会在调用 @load 之前自动设置 loading=true
  if (finished.value) return

  try {
    loading.value = true
    error.value = false

    // 构建查询参数
    const query: any = {
      Page: currentPage.value,
      PageSize: pageSize,
      BeginTime: selectTimeRange.value.startTime,
      EndTime: selectTimeRange.value.endTime,
      TransferType: pageConfig.value.transferType,
      Sort: getSortParam(sortType.value)
    }

    // 代存特有参数
    if (pageConfig.value.isAgentDeposit !== undefined) {
      query.IsAgentDeposit = pageConfig.value.isAgentDeposit
    }

    // 会员/代理账号搜索
    if (searchKeyword.value) {
      query.AccountName = searchKeyword.value
    }

    // 类型筛选（WalletType: 1=佣金钱包, 2=额度钱包）
    if (typeFilter.value !== 'all') {
      if (recordType.value === 'transfer') {
        // 转账：0=额度转账->WalletType=2, 1=佣金转账->WalletType=1
        query.WalletType = typeFilter.value === 0 ? 2 : 1
      } else {
        // 代存：直接使用 WalletType
        query.WalletType = typeFilter.value
      }
    }

    const response = await API.admin.getAgentCreditLimitTransactionList(query)

    if (response.data.Code === 200) {
      // 安全处理 Data 和 Items 可能为 null 的情况
      const responseData = response.data.Data || {}
      let items = responseData.Items || []

      // 填充产品名称和序号
      if (pageConfig.value.needProductName) {
        items = items.map((item, index) => {
          const selectedPackage = productPackages.value.find(p => p.PackageId === item.PackageId)
          return {
            ...item,
            PackageName: selectedPackage ? selectedPackage.PackageName : '',
            index: (currentPage.value - 1) * pageSize + index + 1
          }
        })
      } else {
        items = items.map((item, index) => ({
          ...item,
          index: (currentPage.value - 1) * pageSize + index + 1
        }))
      }

      if (currentPage.value === 1) {
        records.value = items
      } else {
        records.value = [...records.value, ...items]
      }

      // 更新总计
      totalAmount.value = responseData.Total?.TotalAbsApplyAmount || 0

      // 更新分页状态
      totalCount.value = responseData.Pagination?.MaxCount || 0

      // 判断是否已加载完所有数据
      // 如果返回的数据少于 pageSize，或已加载数量达到总数，说明没有更多数据了
      if (items.length < pageSize || records.value.length >= totalCount.value) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      error.value = true
      finished.value = true // 出错时也设置 finished，避免卡在加载状态
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom'
      })
    }
  } catch (err) {
    console.error(`加载${pageConfig.value.title}失败:`, err)
    error.value = true
    finished.value = true // 出错时也设置 finished，避免无限重试
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

// 格式化充值类型（仅代存使用）
const formatTransferType = (type: number) => {
  const types: Record<number, string> = {
    2: '代存',
    10: '红利'
  }
  return types[type] || '-'
}

// 格式化代存/转账类型
const formatRecordType = (walletType: number) => {
  if (recordType.value === 'deposit') {
    return walletType === 1 ? '佣金代存' : '额度代存'
  } else {
    return walletType === 1 ? '佣金转账' : '额度转账'
  }
}

// 转换记录为卡片数据
const getCardDetails = (record: AgentCreditLimitTransactionItem) => {
  if (recordType.value === 'deposit') {
    return [
      { label: '订单号', value: record.OrderId, showCopy: true },
      { label: '代存类型', value: formatRecordType(record.WalletType) },
      { label: '代存金额', value: formatMoneyWithCommas(record.AbsApplyAmount), highlight: false },
      { label: '流水倍数', value: record.WithdrawWaterMultiply || 0 },
      { label: '代存回馈', value: formatMoneyWithCommas(record.DepositRebate || 0, 2, true) },
      { label: '充值类型', value: formatTransferType(record.TransferType) },
      { label: '备注', value: record.Remarks || '-', multiline: true }
    ]
  } else {
    return [
      { label: '订单号', value: record.OrderId, showCopy: true },
      { label: '转账类型', value: formatRecordType(record.WalletType) },
      { label: '转账金额', value: formatMoneyWithCommas(record.AbsApplyAmount, 2, true), highlight: false },
      { label: '备注', value: record.Remarks || '-', multiline: true }
    ]
  }
}

const getCardTimes = (record: AgentCreditLimitTransactionItem) => {
  return [
    { label: '账变时间', value: formatTime(record.CreateTime) }
  ]
}
</script>

<template>
  <div ref="containerRef" class="transaction-record-container">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">{{ pageConfig.title }}</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
      :disabled="disablePullRefresh"
      class="transaction-record-pull-refresh"
    >
      <!-- 金额总计卡片 -->
      <div class="px-3 pb-2 pt-[54px]">
        <SummaryCard
          :label="pageConfig.summaryLabel"
          :value="totalAmount"
          :icon="pageConfig.summaryIcon"
          :color-type="pageConfig.summaryColorType"
        />
      </div>

      <!-- 搜索和筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
          <!-- 会员/代理账号搜索框 -->
          <van-search
            v-model="searchKeyword"
            :placeholder="pageConfig.searchPlaceholder"
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

            <!-- 类型筛选 -->
            <div class="filter-dropdown">
              <Dropdown
                v-model="typeFilter"
                :options="pageConfig.typeFilterOptions"
                height="1.5rem"
              />
            </div>

            <!-- 排序 -->
            <div class="filter-dropdown">
              <Dropdown
                v-model="sortType"
                :options="pageConfig.sortOptions"
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
        :immediate-check="true"
        :offset="10"
        @load="loadMore"
        :class="{ 'hide-list-loading': refreshing }"
      >
        <div v-if="records.length > 0" class="record-list-container">
          <RecordCard
            v-for="record in records"
            :key="record.OrderId"
            :headerTitle="record.ReferenceAccount"
            :headerSubtitle="pageConfig.showVipLevel ? `VIP${record.VipLevel || 0}` : undefined"
            :details="getCardDetails(record)"
            :times="getCardTimes(record)"
          />
        </div>
        <template #finished>
          <div v-if="records.length === 0" class="flex items-center justify-center" style="min-height: 300px;">
            <empty />
          </div>
        </template>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.transaction-record-container {
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

.transaction-record-pull-refresh {
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
