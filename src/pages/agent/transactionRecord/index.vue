<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import RecordCard from '@/components/RecordCard/index.vue'
import SummaryCard from '@/components/SummaryCard/index.vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import API from '@/apis'
import type { AgentCreditLimitTransactionItem } from '@/apis/codegen/data-contracts'

type SearchType = {
  id: number | string
  text: string
}

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
      summaryIcon: './static/images/common/depositRecordIcon.png',
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
      summaryIcon: './static/images/common/transferRecordIcon.png',
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

// 金额总计
const totalAmount = ref(0)

// 会员/代理账号搜索
const searchLsLoading = ref(false)
const searchSelected = ref<SearchType | null>(null)
const searchLs = ref<Array<{ id: number | string, text: string }>>([])

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

// 获取搜索列表（会员或代理）
const fetchSearchList = async () => {
  try {
    searchLsLoading.value = true
    if (recordType.value === 'deposit') {
      // 代存模式：搜索会员
      const res = await API.playerManage.getPlayerSearch({})
      searchLs.value = (res.data.Data.Items ?? []).map((i) => ({ id: i.PlayerId, text: i.LoginAccount }))
    } else {
      // 转账模式：搜索代理
      const res = await API.netcashmulti.getNetcashmultiSearchAdmin({
        Username: '',
        AccountLevel: 0
      })
      searchLs.value = (res.data.Data.Items ?? []).map((i) => ({ id: i.AdminId, text: i.Username }))
    }
  } catch (e) {
    console.warn('[fetchSearchList error]:', e)
  } finally {
    searchLsLoading.value = false
  }
}

// 会员/代理选择监听
watch(searchSelected, () => {
  resetList()
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
  finished.value = false
  loading.value = true
  onLoad()
}

// 滚动到底部加载更多
const onLoad = async () => {
  if (refreshing.value) {
    currentPage.value = 1
    records.value = []
    totalAmount.value = 0
    refreshing.value = false
  } else {
    if (currentPage.value) {
      currentPage.value++
    }
  }
  await loadMore()
  loading.value = false
}

// 排序类型映射到API参数
const getSortParam = (sortType: string): string => {
  return (pageConfig.value.sortMap[sortType] || pageConfig.value.sortMap['账变时间降序']) as string
}

// 加载更多
const loadMore = async () => {
  // 只检查 finished 状态，不检查 loading
  // 因为 van-list 会在调用 @load 之前自动设置 loading=true
  if (finished.value) return

  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
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
    if (searchSelected.value) {
      query.AccountName = searchSelected.value.text
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
      }
    } else {
      error.value = true
      finished.value = true // 出错时也设置 finished，避免卡在加载状态
      loading.value = false
    }
  } catch (err) {
    console.error(`加载${pageConfig.value.title}失败:`, err)
    error.value = true
    finished.value = true // 出错时也设置 finished，避免无限重试
  } finally {
    loadingToast.close()
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

// 页面挂载时加载数据
onMounted(() => {
  fetchSearchList()
  loadMore()
})
</script>

<template>
  <div class="transaction-record-container">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">{{ pageConfig.title }}</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 金额总计卡片 -->
    <div class="px-3 pb-2 pt-[54px]">
      <SummaryCard
        :label="pageConfig.summaryLabel"
        :value="totalAmount"
        :icon="pageConfig.summaryIcon"
      />
    </div>

    <!-- 搜索和筛选器 -->
    <div class="flex flex-col px-3 py-2 gap-3">
      <!-- 会员/代理账号搜索框 -->
      <SearchBar
        :placeholder="pageConfig.searchPlaceholder"
        class="flex-1"
        v-model:selected="searchSelected"
        :search-ls="searchLs"
      />

      <!-- 筛选条件行 -->
      <div class="flex items-center gap-2 overflow-auto">
        <!-- 时间筛选 -->
        <TimeFilterDropdown
          v-model="selectTimeRange"
          title="账变时间"
          height="1.5rem"
        />

        <!-- 类型筛选 -->
        <div class="filter-dropdown">
          <Filled
            v-model="typeFilter"
            :options="pageConfig.typeFilterOptions"
            height="1.5rem"
          />
        </div>

        <!-- 排序 -->
        <div class="filter-dropdown">
          <Filled
            v-model="sortType"
            :options="pageConfig.sortOptions"
            height="1.5rem"
          />
        </div>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="listContainer mt-2 px-3 pb-2">
      <van-pull-refresh
        v-model="refreshing"
        :style="[records.length === 0 && !loading && { height: '100%' }]"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          v-model:error="error"
          :finished="finished"
          :finished-text="records.length > 0 ? '没有更多了' : ''"
          error-text="请求失败"
          :immediate-check="false"
          @load="onLoad"
        >
          <div v-if="records.length > 0" class="flex flex-col gap-2">
            <RecordCard
              v-for="record in records"
              :key="record.OrderId"
              :headerTitle="record.ReferenceAccount"
              :headerSubtitle="pageConfig.showVipLevel ? `VIP${record.VipLevel || 0}` : undefined"
              :details="getCardDetails(record)"
              :times="getCardTimes(record)"
            />
          </div>
          <div v-else-if="!loading && finished" class="flex items-center justify-center" style="min-height: 300px;">
            <empty />
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.transaction-record-container {
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
