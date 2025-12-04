<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FinanceCard from './components/financeCard.vue'
import DepositWithdrawCard from './components/depositWithdrawCard.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import { formatMoneyWithCommas, formatNumberWithCommas } from '@/utils/formatNumber'

const router = useRouter()
const route = useRoute()

// 结算时间选择（从 URL query 初始化，实现页面间连动）
const selectedDate = ref((route.query.date as string) || '本月')

// 日期选项
const dateOptions = computed(() => {
  const options = [{ label: '账变时间｜本月', value: '本月' }]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    options.push({ label: value, value })
  }
  return options
})

// Tab 切换
const activeTab = ref(0)
const tabs = ['充值', '提现']

// 会员账号搜索
const searchKeyword = ref('')

// 排序选择
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
  { label: '手续费降序', value: '手续费降序' },
  { label: '手续费升序', value: '手续费升序' },
]

// 加载数据
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态

// 充值手续费汇总数据
const depositFeeSummary = computed(() => {
  // TODO: 替换为 API 数据
  return {
    SumPayMoneyFee: 123456.78,
    SumWithdrawMoneyFee: 1234,
  }
})

// 提现手续费汇总数据
const withdrawFeeSummary = computed(() => {
  // TODO: 替换为 API 数据
  return {
    SumPayMoneyFee: 123456.78,
    SumWithdrawMoneyFee: 1234,
  }
})

// 当前显示的汇总数据
const currentSummary = computed(() => {
  return activeTab.value === 0 ? depositFeeSummary.value : withdrawFeeSummary.value
})

// 充值手续费列表
// TODO: 替换为 API 数据
const depositFeeList = [
  {
    orderNo: '23210654065406546515605604',
    status: 'completed',
    username: 'darren200',
    vipLevel: 'VIP0',
    applyAmount: 10000,
    actualAmount: 9900,
    depositType: '银行卡转账',
    depositRate: '1%',
    depositFee: 100,
    time: '2025-12-14 14:40:21'
  },
  {
    orderNo: '23210654065406546515605605',
    status: 'completed',
    username: 'john123',
    vipLevel: 'VIP1',
    applyAmount: 5000,
    actualAmount: 4950,
    depositType: '支付宝',
    depositRate: '1%',
    depositFee: 50,
    time: '2025-12-14 13:20:15'
  },
]

// 提现手续费列表
// TODO: 替换为 API 数据
const withdrawFeeList = [
  {
    orderNo: '23210654065406546515605606',
    status: 'completed',
    username: 'mary456',
    vipLevel: 'VIP2',
    applyAmount: 20000,
    actualAmount: 19800,
    depositType: '银行卡',
    depositRate: '1%',
    depositFee: 200,
    time: '2025-12-14 16:30:45'
  },
  {
    orderNo: '23210654065406546515605607',
    status: 'completed',
    username: 'peter789',
    vipLevel: 'VIP0',
    applyAmount: 3000,
    actualAmount: 2970,
    depositType: '银行卡',
    depositRate: '1%',
    depositFee: 30,
    time: '2025-12-14 15:10:30'
  },
]

// 当前显示的列表
const currentList = computed(() => {
  return activeTab.value === 0 ? depositFeeList : withdrawFeeList
})

// 当前类型
const currentType = computed(() => {
  return activeTab.value === 0 ? 'deposit' : 'withdraw'
})

// 下拉刷新
const refreshing = ref(false)
const onRefresh = async () => {
  // TODO: 重新获取数据
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

import { useSticky } from '@/composables/useSticky'

const containerRef = ref<HTMLElement | null>(null)

const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none', // 此页面不基于 tab 显示
  stickyTop: 44 // 吸顶时距离顶部的距离
})

// 返回
const handleBack = () => {
  const tab = route.query.tab || '1'
  router.push({
    name: 'report',
    query: { tab, date: selectedDate.value } // 传递日期参数回主页面
  })
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索会员账号:', searchKeyword.value)
  // TODO: 实现搜索逻辑
}

// 点击订单卡片
const handleOrderClick = (order: any) => {
  console.log('点击订单:', order)
  // TODO: 跳转到订单详情或执行其他操作
}

// 模拟加载
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="fee-record-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
       <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">充提手续费</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="pullRefreshDisabled"
      @refresh="onRefresh"
      class="deposit-withdraw-pull-refresh"
    >
      <!-- 手续费总计卡片 -->
      <div class="px-3 py-2 pt-[56px]">
        <FinanceCard
           class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '充值手续费', value: formatMoneyWithCommas(currentSummary.SumPayMoneyFee, 2, true) },
              { label: '提现手续费', value: formatNumberWithCommas(currentSummary.SumWithdrawMoneyFee, 0, true) }
            ]
          ]"
        />
      </div>
     <!-- Tabs + 搜索和筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
          <!-- Tabs 切换 -->
          <van-tabs
            v-model:active="activeTab"
            color="var(--color-primary-normal)"
            title-active-color="var(--color-white)"
            title-inactive-color="var(--color-neutral-secondary)"
            type="card"
          >
            <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab" />
          </van-tabs>

          <!-- 会员账号搜索框 -->
          <van-search
            v-model="searchKeyword"
            placeholder="会员账号"
            shape="round"
            background="transparent"
            clearable
            :left-icon="null"
            @search="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #right-icon>
              <van-icon name="search" size="18" @click="handleSearch" />
            </template>
          </van-search>

          <!-- 筛选条件行 -->
          <div class="filter-scroll-container">
            <!-- 账变时间 -->
            <Dropdown
              v-model="selectedDate"
              :options="dateOptions"
              height="1.5rem"
              class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
            />

            <!-- 排序方式 -->
            <Dropdown
              v-model="sortType"
              :options="sortOptions"
              height="1.5rem"
              class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
            />
          </div>
        </div>
      </div>

      <!-- Loading 状态 -->
      <div v-if="loading" class="fee-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="currentList.length === 0" class="fee-list-empty">
        <img src="/static/images/promote/empty.png" alt="暂无数据" class="empty-icon" />
        <span class="empty-text">暂无数据</span>
      </div>

      <!-- 手续费记录列表 -->
      <div v-else class="record-list-container">
        <DepositWithdrawCard
          v-for="(order, index) in currentList"
          :is-deposit-withdraw-fee="true"
          :key="index"
          :record="order"
          :type="currentType"
          @click="handleOrderClick(order)"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.deposit-withdraw-container {
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

.deposit-withdraw-pull-refresh {
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
    top: 44px; /* Header 高度 (h-11 + info-tip) */
    left: 0;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  /* 自定义 van-tabs 样式 */
  :deep(.van-tabs) {
    --van-tabs-card-height: 48px;
    --van-padding-md: 0rem;
    --van-radius-sm: 6.25rem;

    .van-tabs__nav.van-tabs__nav--card {
      padding: 0.1875rem;
      border-color: var(--color-neutral2-seventh) !important;
    }

    .van-tab--card {
      border-right: none;
    }

    .van-tab.van-tab--card.van-tab--active {
      border-radius: var(--van-radius-sm);
    }
  }

  :deep(.van-tab) {
    font-size: 15px;
    font-weight: 400;
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
