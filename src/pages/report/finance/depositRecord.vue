<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FinanceCard from './components/financeCard.vue'
import DepositCard from './components/depositCard.vue'
import Dropdown from '@/components/Dropdown/index.vue'

const router = useRouter()
const route = useRoute()

// 代存数据
// TODO: 替换为 API 数据
const depositData = {
  quotaDeposit: 4312343,
  quotaDepositRebate: 34,
  commissionDeposit: 4312343,
  commissionDepositRebate: 34
}

// Tab 切换
const activeTab = ref(0)
const tabs = ['额度代存', '佣金代存']

// 会员账号搜索
const searchKeyword = ref('')

// 账变时间选择
const selectedDate = ref('本月')

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

// 排序选择
const sortType = ref('账变时间降序')
const sortOptions = [
  { label: '账变时间降序', value: '账变时间降序' },
  { label: '账变时间升序', value: '账变时间升序' },
]

// 代存列表
// TODO: 替换为 API 数据
const depositList = [
  {
    orderNo: '23210654065406546515605604',
    username: 'darren200',
    vipLevel: 'VIP0',
    depositAmount: 2999,
    flowMultiplier: 1,
    depositRebate: 26,
    depositFee: 2999,
    topUpType: '代存',
    notes: '备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注',
    transactionTime: '2025-12-14 14:40:21'
  },
  {
    orderNo: '23210654065406546515605604',
    username: 'darren200',
    vipLevel: 'VIP0',
    depositAmount: 2999,
    flowMultiplier: 1,
    depositRebate: 26,
    depositFee: 2999,
    topUpType: '代存',
    notes: '备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注',
    transactionTime: '2025-12-14 14:40:21'
  },
    {
    orderNo: '23210654065406546515605604',
    username: 'darren200',
    vipLevel: 'VIP0',
    depositAmount: 2999,
    flowMultiplier: 1,
    depositRebate: 26,
    depositFee: 2999,
    topUpType: '代存',
    notes: '备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注',
    transactionTime: '2025-12-14 14:40:21'
  },
    {
    orderNo: '23210654065406546515605604',
    username: 'darren200',
    vipLevel: 'VIP0',
    depositAmount: 2999,
    flowMultiplier: 1,
    depositRebate: 26,
    depositFee: 2999,
    topUpType: '代存',
    notes: '备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注备注',
    transactionTime: '2025-12-14 14:40:21'
  },
]

// 下拉刷新
const refreshing = ref(false)
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

import { useSticky } from '@/composables/useSticky'

const containerRef = ref<HTMLElement | null>(null)

const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none', // 此頁面不基於 tab 顯示，給一個不會匹配的值
  stickyTop: 44 // 吸頂時距離頂部的距離
})

// 返回
const handleBack = () => {
  const tab = route.query.tab || '1'
  router.push({
    name: 'report',
    query: { tab }
  })
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索会员账号:', searchKeyword.value)
  // TODO: 实现搜索逻辑
}

// 点击代存卡片
const handleDepositClick = (record: any) => {
  console.log('点击代存记录:', record)
  // TODO: 跳转到详情或显示弹窗
}
</script>

<template>
  <div class="deposit-record-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">代存记录</span>
        <div style="width: 24px;"></div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="pullRefreshDisabled"
      @refresh="onRefresh"
      class="deposit-record-pull-refresh"
    >
      <!-- 代存总计卡片 -->
      <div class="px-3 py-2 pt-[54px]">
        <FinanceCard
          class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '额度代存', value: depositData.quotaDeposit.toLocaleString() },
              { label: '额度代存回馈', value: depositData.quotaDepositRebate.toString() }
            ],
            [
              { label: '佣金代存', value: depositData.commissionDeposit.toLocaleString() },
              { label: '佣金代存回馈', value: depositData.commissionDepositRebate.toString() }
            ]
          ]"
        />
      </div>

      <!-- Tab 切换和搜索筛选器（sticky 固定） -->
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

      <!-- 代存列表 -->
      <div class="record-list-container">
        <DepositCard
          v-for="(record, index) in depositList"
          :key="index"
          :record="record"
          @click="handleDepositClick(record)"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>
<style lang="scss" scoped>
.deposit-record-container {
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

.deposit-record-pull-refresh {
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
