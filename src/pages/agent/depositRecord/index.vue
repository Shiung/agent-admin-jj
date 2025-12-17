<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import { useSticky } from '@/composables/useSticky'

const router = useRouter()
const route = useRoute()

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

// 代存金额总计
const totalDepositAmount = ref(0)

// 会员账号搜索
const searchKeyword = ref('')

// 代存类型筛选
const depositTypeFilter = ref('全部代存')
const depositTypeOptions = [
  { label: '全部代存', value: '全部代存' },
  { label: '佣金代存', value: '佣金代存' },
  { label: '额度代存', value: '额度代存' }
]

// 状态筛选
// const statusFilter = ref('全部状态')
// const statusOptions = [
//   { label: '全部状态', value: '全部状态' }
//   // TODO: 根据实际需求添加其他状态
// ]

// 排序筛选
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' }
]

// 代存记录列表数据
const depositRecords = ref<any[]>([])

// 分页和加载状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)
const error = ref(false)

// 返回上一页
const handleBack = () => {
  router.back()
}

// 搜索处理
const handleSearch = () => {
  resetAndFetchData()
}

// 重置并获取数据
const resetAndFetchData = () => {
  currentPage.value = 1
  depositRecords.value = []
  finished.value = false
  error.value = false
  fetchDepositRecords()
}

// 获取代存记录列表
const fetchDepositRecords = async () => {
  if (loading.value || finished.value) return

  try {
    loading.value = true

    // TODO: 调用实际 API
    // const response = await apis.agent.getDepositRecords({
    //   BeginTime: selectTimeRange.value.startTime,
    //   EndTime: selectTimeRange.value.endTime,
    //   Page: currentPage.value,
    //   PageSize: pageSize,
    //   Account: searchKeyword.value || undefined,
    //   DepositType: depositTypeFilter.value !== '全部代存' ? depositTypeFilter.value : undefined,
    //   Status: statusFilter.value !== '全部状态' ? statusFilter.value : undefined,
    //   Sort: sortType.value === '账变时间降序' ? '-CreateTime' : 'CreateTime'
    // })

    // 模拟数据
    const mockData = [
      {
        OrderId: '232106540654065465156056045',
        Account: 'darren200',
        VipLevel: 0,
        DepositType: '额度代存',
        DepositAmount: 299900, // 分
        FlowMultiple: 1,
        DepositRebate: 2600, // 分
        DepositFee: 299900, // 分
        RechargeType: '代存',
        Remark: '备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注',
        CreateTime: dayjs('2025-12-14 14:40:21').unix()
      }
    ]

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    if (currentPage.value === 1) {
      depositRecords.value = mockData
    } else {
      depositRecords.value = [...depositRecords.value, ...mockData]
    }

    totalCount.value = mockData.length
    currentPage.value++

    // 判断是否加载完成
    if (depositRecords.value.length >= totalCount.value) {
      finished.value = true
    }
  } catch (err) {
    console.error('获取代存记录失败:', err)
    error.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 获取代存总计
const fetchDepositSummary = async () => {
  try {
    // TODO: 调用实际 API
    // const response = await apis.agent.getDepositSummary({
    //   BeginTime: selectTimeRange.value.startTime,
    //   EndTime: selectTimeRange.value.endTime
    // })

    // 模拟数据
    totalDepositAmount.value = 1234567834 // 分
  } catch (err) {
    console.error('获取代存总计失败:', err)
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  currentPage.value = 1
  depositRecords.value = []
  finished.value = false
  error.value = false
  await Promise.all([fetchDepositSummary(), fetchDepositRecords()])
}

// 监听时间范围变化
watch(selectTimeRange, () => {
  resetAndFetchData()
  fetchDepositSummary()
})

// 监听筛选条件变化
watch([depositTypeFilter, sortType], () => {
  resetAndFetchData()
})

// 组件挂载时获取数据
onMounted(() => {
  fetchDepositSummary()
  fetchDepositRecords()
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

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :disabled="disablePullRefresh">
      <!-- 代存金额总计卡片 -->
      <div class="summary-card">
        <div class="summary-content">
          <div class="summary-label">代存金额总计</div>
          <div class="summary-value">{{ formatMoneyWithCommas(totalDepositAmount, 2, true) }}</div>
        </div>
        <img src="/static/images/common/depositRecordIcon.png" alt="图标" class="summary-icon" />
      </div>

      <!-- 筛选栏 -->
      <!-- 占位元素（fixed 时避免内容跳动） -->
      <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }"></div>
      <div class="filter-bar" :class="{ 'is-fixed': isFilterBarFixed }">
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
        />

        <!-- 筛选条件滚动容器 -->
        <div class="filter-scroll-container">
          <!-- 时间筛选 -->
          <TimeFilterDropdown
            v-model="selectTimeRange"
            v-model:show-calendar="showCalendar"
            title="账变时间"
            height="1.5rem"
            class="filter-dropdown !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
          />

          <!-- 代存类型筛选 -->
          <Dropdown
            v-model="depositTypeFilter"
            :options="depositTypeOptions"
            height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
          />

          <!-- 状态筛选 -->
          <!-- <Dropdown
            v-model="statusFilter"
            :options="statusOptions"
            height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
          /> -->

          <!-- 排序筛选 -->
          <Dropdown
            v-model="sortType"
            :options="sortOptions"
            height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
          />
        </div>
      </div>

      <!-- 代存记录列表 -->
      <div class="records-container">
        <van-list
          v-model:loading="loading"
          v-model:error="error"
          :finished="finished"
          finished-text="没有更多了"
          error-text="加载失败，点击重新加载"
          @load="fetchDepositRecords"
        >
          <div v-for="record in depositRecords" :key="record.OrderId" class="record-card">
            <!-- 会员信息 -->
            <div class="record-header">
              <span class="username">{{ record.Account }}</span>
              <span class="vip-level">VIP{{ record.VipLevel }}</span>
            </div>

            <!-- 详细信息 -->
            <div class="record-details">
              <!-- 订单号 -->
              <div class="detail-row">
                <span class="detail-label">订单号</span>
                <div class="detail-value">
                  <span>{{ record.OrderId }}</span>
                  <van-icon
                    name="records"
                    size="16"
                    color="var(--color-neutral2-secondary)"
                    @click="() => {}"
                  />
                </div>
              </div>

              <!-- 代存类型 -->
              <div class="detail-row">
                <span class="detail-label">代存类型</span>
                <span class="detail-value">{{ record.DepositType }}</span>
              </div>

              <!-- 代存金额 -->
              <div class="detail-row">
                <span class="detail-label">代存金额</span>
                <span class="detail-value">{{ formatMoneyWithCommas(record.DepositAmount, 2, true) }}</span>
              </div>

              <!-- 流水倍数 -->
              <div class="detail-row">
                <span class="detail-label">流水倍数</span>
                <span class="detail-value">{{ record.FlowMultiple }}</span>
              </div>

              <!-- 代存回馈 -->
              <div class="detail-row">
                <span class="detail-label">代存回馈</span>
                <span class="detail-value">{{ formatMoneyWithCommas(record.DepositRebate, 2, true) }}</span>
              </div>


              <!-- 充值类型 -->
              <div class="detail-row">
                <span class="detail-label">充值类型</span>
                <span class="detail-value">{{ record.RechargeType }}</span>
              </div>

              <!-- 备注 -->
              <div class="detail-row">
                <span class="detail-label">备注</span>
                <span class="detail-value remark-text">{{ record.Remark }}</span>
              </div>

              <!-- 账变时间 -->
              <div class="detail-row">
                <span class="detail-label">账变时间</span>
                <span class="detail-value">{{ dayjs.unix(record.CreateTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
            </div>
          </div>
        </van-list>

        <!-- 空状态 -->
        <div v-if="!loading && depositRecords.length === 0" class="empty-state">
          <van-empty description="暂无数据" />
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.deposit-record-page {
  min-height: 100vh;
  background-color: var(--color-bg-floor-1-2);
  padding-bottom: 20px;
}

/* 代存金额总计卡片 */
.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-content {
  flex: 1;
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

.summary-icon {
  width: 64px;
  height: 64px;
  margin-left: 16px;
}

/* 筛选栏 */
.filter-bar-placeholder {
  width: 100%;
}

.filter-bar {
  background: white;
  padding: 0 16px 8px;
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

/* 搜索框样式 */
:deep(.van-search) {
  padding: 8px 0;
}

:deep(.van-search__content) {
  background-color: var(--color-bg-floor-1-2);
  border-radius: 20px;
}

:deep(.van-field__control) {
  font-size: 14px;
}

/* 筛选条件滚动容器 */
.filter-scroll-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-scroll-container::-webkit-scrollbar {
  display: none;
}

.filter-dropdown {
  flex-shrink: 0;
}

/* 记录列表容器 */
.records-container {
  padding: 0 16px;
}

/* 记录卡片 */
.record-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 会员信息头部 */
.record-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-neutral2-seventh);
}

.username {
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

/* 详细信息 */
.record-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 14px;
}

.detail-label {
  color: var(--color-neutral2-secondary);
  flex-shrink: 0;
  width: 80px;
}

.detail-value {
  color: var(--color-neutral-basic);
  text-align: right;
  flex: 1;
  word-break: break-all;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.remark-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 空状态 */
.empty-state {
  padding: 60px 0;
  text-align: center;
}
</style>
