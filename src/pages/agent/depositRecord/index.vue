<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { useSticky } from '@/composables/useSticky'
import API from '@/apis'
import type { AgentCreditLimitTransactionItem } from '@/apis/codegen/data-contracts'

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

// 初始化时间范围（默认今天）
const selectTimeRange = ref({
  startTime: timestampToSecond(dayjs().startOf('day').valueOf()),
  endTime: timestampToSecond(dayjs().endOf('day').valueOf())
})

// Calendar 打开状态
const showCalendar = ref(false)

// 综合判断是否禁用下拉刷新
const disablePullRefresh = computed(() => pullRefreshDisabled.value || showCalendar.value)

// 代存金额总计
const totalDepositAmount = ref(0)

// 会员账号搜索
const searchKeyword = ref('')

// 代存类型筛选
const depositTypeFilter = ref<string | number>('all')
const depositTypeOptions = [
  { label: '全部代存', value: 'all' },
  { label: '佣金代存', value: 1 },
  { label: '额度代存', value: 2 }
]

// 排序筛选
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  { label: '代存金额降序', value: '代存金额降序' },
  { label: '代存金额升序', value: '代存金额升序' }
]

// 代存记录列表数据
const depositRecords = ref<AgentCreditLimitTransactionItem[]>([])

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
watch([depositTypeFilter, sortType], () => {
  resetList()
})

// 重置列表
const resetList = () => {
  currentPage.value = 1
  depositRecords.value = []
  totalDepositAmount.value = 0
  finished.value = false
  error.value = false
  loadMore()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  resetList()
}

// 加载更多
const loadMore = async () => {
  if (loading.value || finished.value) return

  try {
    loading.value = true
    error.value = false

    // 构建查询参数
    const query = {
      Page: currentPage.value,
      PageSize: pageSize,
      BeginTime: selectTimeRange.value.startTime,
      EndTime: selectTimeRange.value.endTime,
      TransferType: '', // 充值类型（2=代存, 10=红利，空字符串=全部）
      IsAgentDeposit: true, // 代理代存标识
      AccountName: searchKeyword.value
    }

    const response = await API.admin.getAgentCreditLimitTransactionList(query)

    if (response.data.Code === 200) {
      let items = response.data.Data.Items || []

      // 填充产品名称
      items = items.map((item, index) => {
        const selectedPackage = productPackages.value.find(p => p.PackageId === item.PackageId)
        return {
          ...item,
          PackageName: selectedPackage ? selectedPackage.PackageName : '',
          index: (currentPage.value - 1) * pageSize + index + 1
        }
      })

      // 根据代存类型过滤
      if (depositTypeFilter.value !== 'all') {
        items = items.filter(item => item.WalletType === depositTypeFilter.value)
      }

      // 根据排序类型排序
      if (sortType.value === '账变时间升序') {
        items.sort((a, b) => a.CreateTime - b.CreateTime)
      } else if (sortType.value === '账变时间降序') {
        items.sort((a, b) => b.CreateTime - a.CreateTime)
      } else if (sortType.value === '代存金额升序') {
        items.sort((a, b) => a.ApplyAmount - b.ApplyAmount)
      } else if (sortType.value === '代存金额降序') {
        items.sort((a, b) => b.ApplyAmount - a.ApplyAmount)
      }

      if (currentPage.value === 1) {
        depositRecords.value = items
      } else {
        depositRecords.value = [...depositRecords.value, ...items]
      }

      // 更新总计
      totalDepositAmount.value = response.data.Data.Total?.TotalAmount || 0

      // 更新分页状态
      totalCount.value = response.data.Data.Pagination?.MaxCount || 0

      if (depositRecords.value.length >= totalCount.value) {
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
    console.error('加载代存记录失败:', err)
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

// 格式化充值类型
const formatTransferType = (type: number) => {
  const types: Record<number, string> = {
    2: '代存',
    10: '红利'
  }
  return types[type] || '-'
}

// 格式化代存类型
const formatDepositType = (walletType: number) => {
  return walletType === 1 ? '佣金代存' : '额度代存'
}

// 复制订单号
const copyOrderId = async (orderId: string) => {
  try {
    await navigator.clipboard.writeText(orderId)
    showToast({
      message: '复制成功',
      position: 'bottom'
    })
  } catch (err) {
    console.error('复制失败:', err)
    showToast({
      message: '复制失败',
      position: 'bottom'
    })
  }
}

onMounted(() => {
  loadMore()
})
</script>

<template>
  <div ref="containerRef" class="deposit-record-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="代存记录"
      left-arrow
      @click-left="handleBack"
      fixed
      placeholder
    />

    <!-- 下拉刷新 -->
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
      :disabled="disablePullRefresh"
    >
      <!-- 筛选栏 -->
      <div v-if="isFilterBarFixed" :style="{ height: filterBarHeight + 'px' }" />
      <div
        class="filter-bar"
        :class="{ 'is-fixed': isFilterBarFixed }"
      >
        <!-- 搜索框 -->
        <van-search
          v-model="searchKeyword"
          placeholder="会员账号"
          @search="handleSearch"
        />

        <!-- 筛选条件滚动容器 -->
        <div class="filter-scroll">
          <!-- 时间筛选 -->
          <TimeFilterDropdown
            v-model="selectTimeRange"
            v-model:show-calendar="showCalendar"
          />

          <!-- 代存类型 -->
          <Dropdown
            v-model="depositTypeFilter"
            :options="depositTypeOptions"
            placeholder="代存类型"
          />

          <!-- 排序 -->
          <Dropdown
            v-model="sortType"
            :options="sortOptions"
            placeholder="排序"
          />
        </div>
      </div>

      <!-- 总计卡片 -->
      <div class="summary-card">
        <div class="summary-label">代存金额总计</div>
        <div class="summary-value">{{ formatMoneyWithCommas(totalDepositAmount, 2, true) }}</div>
      </div>

      <!-- 记录列表 -->
      <van-list
        v-model:loading="loading"
        v-model:error="error"
        :finished="finished"
        finished-text="没有更多了"
        error-text="加载失败，点击重试"
        @load="loadMore"
      >
        <div
          v-for="record in depositRecords"
          :key="record.OrderId"
          class="record-item"
        >
          <!-- 头部：会员账号 + VIP等级 -->
          <div class="record-header">
            <div class="member-info">
              <span class="member-account">{{ record.ReferenceAccount }}</span>
              <span class="vip-level">VIP{{ record.VipLevel || 0 }}</span>
            </div>
          </div>

          <!-- 详情列表 -->
          <div class="record-details">
            <!-- 订单号（带复制） -->
            <div class="detail-row">
              <span class="detail-label">订单号</span>
              <div class="detail-value order-id-value" @click="copyOrderId(record.OrderId)">
                <span>{{ record.OrderId }}</span>
                <van-icon name="records" size="16" color="var(--color-neutral2-secondary)" />
              </div>
            </div>

            <!-- 代存类型 -->
            <div class="detail-row">
              <span class="detail-label">代存类型</span>
              <span class="detail-value">{{ formatDepositType(record.WalletType) }}</span>
            </div>

            <!-- 代存金额 -->
            <div class="detail-row">
              <span class="detail-label">代存金额</span>
              <span
                class="detail-value amount"
                :class="{
                  'amount-positive': record.ApplyAmount > 0,
                  'amount-negative': record.ApplyAmount < 0
                }"
              >
                {{ record.ApplyAmount > 0 ? '+' : '' }}{{ formatMoneyWithCommas(record.ApplyAmount, 2, true) }}
              </span>
            </div>

            <!-- 流水倍数 -->
            <div class="detail-row">
              <span class="detail-label">流水倍数</span>
              <span class="detail-value">{{ record.WithdrawWaterMultiply || 0 }}</span>
            </div>

            <!-- 代存回馈 -->
            <div class="detail-row">
              <span class="detail-label">代存回馈</span>
              <span class="detail-value">{{ formatMoneyWithCommas(record.DepositRebate || 0, 2, true) }}</span>
            </div>

            <!-- 充值类型 -->
            <div class="detail-row">
              <span class="detail-label">充值类型</span>
              <span class="detail-value">{{ formatTransferType(record.TransferType) }}</span>
            </div>

            <!-- 备注（完整显示） -->
            <div class="detail-row">
              <span class="detail-label">备注</span>
              <span class="detail-value remark-text">{{ record.Remarks || '-' }}</span>
            </div>

            <!-- 账变时间 -->
            <div class="detail-row">
              <span class="detail-label">账变时间</span>
              <span class="detail-value">{{ formatTime(record.CreateTime) }}</span>
            </div>
          </div>
        </div>
      </van-list>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && !refreshing && depositRecords.length === 0"
        description="暂无记录"
      />
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.deposit-record-page {
  min-height: 100vh;
  background-color: var(--color-bg-floor-1-2);
  padding-bottom: 20px;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  padding: 0 16px 12px;
  transition: all 0.3s ease;
}

.filter-bar.is-fixed {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 搜索框 */
:deep(.van-search) {
  padding: 8px 0;
}

:deep(.van-search__content) {
  background-color: var(--color-bg-floor-1-2);
  border-radius: 20px;
}

/* 筛选滚动 */
.filter-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

/* 总计卡片 */
.summary-card {
  margin: 12px 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-label {
  font-size: 14px;
  color: var(--color-neutral2-secondary);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary-normal);
}

/* 记录项 */
.record-item {
  margin: 0 16px 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.record-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-neutral2-seventh);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-account {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-neutral-basic);
}

.vip-level {
  font-size: 12px;
  color: var(--color-neutral2-secondary);
  padding: 2px 8px;
  background: var(--color-bg-floor-1-2);
  border-radius: 4px;
}

/* 详情列表 */
.record-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: var(--color-neutral2-secondary);
}

.detail-value {
  color: var(--color-neutral-basic);
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

/* 订单号可点击 */
.order-id-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  cursor: pointer;
}

.order-id-value:active {
  opacity: 0.6;
}

.detail-value.amount {
  font-weight: 600;
  font-size: 16px;
}

.amount-positive {
  color: var(--color-error-normal);
}

.amount-negative {
  color: var(--color-success-normal);
}

/* 备注完整显示 */
.remark-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
