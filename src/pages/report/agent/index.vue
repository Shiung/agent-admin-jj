<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import AgentDataCard from './components/agentDataCard.vue'
import AgentCard from './components/agentCard.vue'
import AgentDetailSheet from './components/agentDetailSheet.vue'
import Dropdown from '@/components/Dropdown/index.vue'

import { useSticky } from '@/composables/useSticky'

const route = useRoute()
const agentContainerRef = ref<HTMLElement | null>(null)

// 提取吸顶逻辑到 composable
const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef: agentContainerRef,
  tabQueryIndex: '2' // 代理页面的 tab 索引是 '2'
})

// 实时/历史切换
const viewType = ref(0)
const switchBtns = [
  { id: 0, title: '实时' },
  { id: 1, title: '历史' }
]

// 是否是历史模式
const isHistoryMode = computed(() => viewType.value === 1)

// 实时数据
// TODO: 替换为 API 数据
const realtimeData = {
  date: dayjs().format('YYYY-MM-DD'),
  totalProfit: 4312343,
  betAmount: 4312343,
  profitMargin: '4%',
  firstDepositCount: 312343,
  registerCount: 312343,
  conversionRate: '4%'
}

// 历史数据
// TODO: 替换为 API 数据
const historyData = {
  totalProfit: 4312343,
  betAmount: 4312343,
  profitMargin: '4%',
  firstDepositCount: 312343,
  registerCount: 312343,
  conversionRate: '4%'
}

// 搜索关键字
const searchKeyword = ref('')

// 代理筛选
const agentFilter = ref('全部代理')
const agentFilterOptions = [
  { label: '全部代理', value: '全部代理' },
  { label: '一级代理', value: '一级代理' },
  { label: '二级代理', value: '二级代理' }
]

// 排序方式
const sortType = ref('总盈利降序')
const sortOptions = [
  { label: '总盈利降序', value: '总盈利降序' },
  { label: '总盈利升序', value: '总盈利升序' }
]

// 实时代理列表
// TODO: 替换为 API 数据
const realtimeAgentList = [
  {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
    {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
    {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
    {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    username: 'rdMulti01',
    level: '一级代理',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  }
]

// 历史代理列表
// TODO: 替换为 API 数据
const historyAgentList = [
  {
    date: '2025-10',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    date: '2025-9',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
    {
    date: '2025-10',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    date: '2025-9',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
    {
    date: '2025-10',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    date: '2025-9',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },  {
    date: '2025-10',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  },
  {
    date: '2025-9',
    totalProfit: 4312343,
    betAmount: 4312343,
    profitMargin: '12%',
    firstDepositCount: 312343,
    registerCount: 312343,
    conversionRate: '4%'
  }
]

// 当前显示的代理列表
const agentList = computed(() => isHistoryMode.value ? historyAgentList : realtimeAgentList)

// 下拉刷新
const refreshing = ref(false)
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索代理账号:', searchKeyword.value)
  // TODO: 实现搜索逻辑
}

// 详情 sheet 状态
const showDetailSheet = ref(false)
const currentAgentDetail = ref<any>(null)

// 点击代理卡片
const handleAgentClick = (agent: any) => {
  // 只在实时模式下显示详情
  if (!isHistoryMode.value) {
    // TODO: 根据 agent 数据获取完整详情
    currentAgentDetail.value = {
      username: agent.username,
      level: agent.level,
      totalProfit: agent.totalProfit,
      betUserCount: 2345,
      betAmount: agent.betAmount,
      profitMargin: agent.profitMargin,
      firstDepositCount: agent.firstDepositCount,
      conversionRate: agent.conversionRate,
      registerCount: agent.registerCount,
      loginCount: 2345,
      firstDepositAmount: 23456667,
      avgFirstDeposit: 23456667,
      depositCount: 2345,
      depositAmount: 23456667,
      withdrawCount: 2345,
      withdrawAmount: 23456667,
      winLossAdjustment: 23456667,
      bonus: 23456667,
      rebate: 23456667,
      agentCommission: 23456667,
      date: dayjs().format('YYYY-MM')
    }
    showDetailSheet.value = true
  } else {
    // 历史模式下可能跳转到其他页面
    console.log('历史模式点击:', agent)
  }
}

// 关闭详情 sheet
const closeDetailSheet = () => {
  showDetailSheet.value = false
}
</script>

<template>
  <div class="agent-container" ref="agentContainerRef">
    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="pullRefreshDisabled"
      @refresh="onRefresh"
      class="agent-pull-refresh"
    >
      <!-- 数据卡片 -->
      <div class="px-3 py-2">
        <!-- 实时数据 -->
        <AgentDataCard
          v-if="!isHistoryMode"
          class="shadow-sm"
          title="实时数据"
          :date="realtimeData.date"
          :data="[
            [
              { label: '总盈利', value: `+${realtimeData.totalProfit.toLocaleString()}`, highlight: true },
              { label: '投注金额', value: realtimeData.betAmount.toLocaleString() },
              { label: '盈余比例', value: realtimeData.profitMargin }
            ],
            [
              { label: '首存人数', value: realtimeData.firstDepositCount.toLocaleString() },
              { label: '注册人数', value: realtimeData.registerCount.toLocaleString() },
              { label: '转化率', value: realtimeData.conversionRate }
            ]
          ]"
        />

        <!-- 历史数据 -->
        <AgentDataCard
          v-else
          class="shadow-sm"
          title="历史数据"
          :show-report-tabs="true"
          :data="[
            [
              { label: '总盈利', value: `+${historyData.totalProfit.toLocaleString()}`, highlight: true },
              { label: '投注金额', value: historyData.betAmount.toLocaleString() },
              { label: '盈余比例', value: historyData.profitMargin }
            ],
            [
              { label: '首存人数', value: historyData.firstDepositCount.toLocaleString() },
              { label: '注册人数', value: historyData.registerCount.toLocaleString() },
              { label: '转化率', value: historyData.conversionRate }
            ]
          ]"
        />
      </div>

      <!-- 搜索和筛选器（sticky 固定） -->
      <div>
        <!-- 占位元素（fixed 时避免内容跳动） -->
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }"></div>
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
          <!-- 搜索框 -->
          <van-search
            v-model="searchKeyword"
            placeholder="代理账号"
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
            <!-- 代理筛选 -->
            <Dropdown
              v-model="agentFilter"
              :options="agentFilterOptions"
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

      <!-- 代理列表 -->
      <div class="agent-list-container">
        <AgentCard
          v-for="(agent, index) in agentList"
          :key="index"
          :agent="agent"
          :is-history-mode="isHistoryMode"
          @click="handleAgentClick(agent)"
        />
      </div>
    </van-pull-refresh>

    <!-- 悬浮按钮组 -->
    <div class="floating-switch-btn">
      <van-tabs
        v-model:active="viewType"
        color="var(--color-primary-normal)"
        title-active-color="var(--color-white)"
        title-inactive-color="var(--color-neutral-secondary)"
        type="card"
      >
        <van-tab v-for="(btn, index) in switchBtns" :key="btn.id" :title="btn.title" :name="index" />
      </van-tabs>
    </div>

    <!-- 代理详情 Sheet -->
    <AgentDetailSheet
      v-model:show="showDetailSheet"
      :detail="currentAgentDetail"
      @close="closeDetailSheet"
    />
  </div>
</template>

<style lang="scss" scoped>
.agent-container {
  width: 100%;
  position: relative;
  background-color: white;
}

.agent-pull-refresh {
  /* 确保 van-pull-refresh 不会阻止 sticky */
  :deep(.van-pull-refresh__track) {
    overflow: visible !important;
  }
}

/* 筛选栏固定 */
.sticky-filter-bar {
  position: relative;
  z-index: 10;
  background-color: white;

  /* 当滚动超过阈值时，切换为 fixed */
  &.is-fixed {
    position: fixed;
    top: 108px; /* Header (44px) + fixed Tab (64px) 的总和 */
    left: 0;
    right: 0;
  }
}

/* 占位元素（防止 fixed 时内容跳动，高度通过 inline style 动态设置） */
.filter-bar-placeholder {
  /* 高度由 JavaScript 动态计算并通过 :style 绑定 */
}

.agent-list-container {
  padding: 0 0.75rem;
  padding-bottom: 3rem;
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

/* 悬浮按钮组 */
.floating-switch-btn {
  position: fixed;
  bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 4px);
  width: 7.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;

  --van-tabs-card-height: 40px;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;

  /* 移除 VanTabs 的 overflow，让阴影可以显示 */
  :deep(.van-tabs) {
    overflow: visible !important;
  }

  :deep(.van-tabs__wrap) {
    overflow: visible !important;
  }

  :deep(.van-tabs__nav) {
    overflow: visible !important;
  }

  :deep(.van-tabs__nav.van-tabs__nav--card) {
    padding: 0.25rem;
    border: none !important;
    background: white;
    overflow: visible !important;
    box-shadow: 0px -1px 10px 0px rgba(0, 0, 0, 0.15);
  }

  :deep(.van-tab--card) {
    border: none !important;
  }

  :deep(.van-tab.van-tab--card.van-tab--active) {
    border-radius: var(--van-radius-sm);
  }

  :deep(.van-tab) {
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
