<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import CommissionSummary from './components/commissionSummary.vue'
import CommissionSummaryCard from './components/commissionSummaryCard.vue'
import ReportSwitchBtn from './components/reportSwitchBtn.vue'
import AgentList from './components/agentList.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import API from '@/apis'
import dayjs from 'dayjs'

type SearchType = {
  id: number | string
  text: string
}

import { useSticky } from '@/composables/useSticky'

const route = useRoute()
const commissionContainerRef = ref<HTMLElement | null>(null)

// 用户信息
const userStore = useUserStore()
const { isSingleAgent, hasTeam, isMainLine, subAgentList, selfAdminId } = storeToRefs(userStore)

// 提取吸顶逻辑到 composable
const {
  isFilterBarFixed,
  filterBarHeight,
  pullRefreshDisabled,
  updateFilterBarDimensions: updateStickyDimensions
} = useSticky({
  containerRef: commissionContainerRef,
  tabQueryIndex: '0' // 佣金页面的 tab 索引是 '0'
})

// 悬浮按钮类型：0-个人，1-团队，2-下级
const viewType = ref(0)

// 悬浮按钮配置（根据用户身份动态配置）
// 单层代理无团队：不显示按钮（只有个人）
// 单层代理且有团队：显示 [个人+团队]
// 多层代理：显示 [个人+下级]
const switchBtns = computed(() => {
  if (isSingleAgent.value) {
    // 单层代理
    if (hasTeam.value && isMainLine.value) {
      // 有团队(主线)：显示 [个人+团队]
      return [
        { id: 0, title: '个人' },
        { id: 1, title: '团队' }
      ]
    }
    // 无团队：不显示按钮
    return []
  }
  // 多层代理：显示 [个人+下级]
  return [
    { id: 0, title: '个人' },
    { id: 2, title: '下级' }
  ]
})

// 是否显示悬浮按钮
const showSwitchBtn = computed(() => switchBtns.value.length > 1)

// 监听按钮配置变化，确保 viewType 是有效值
watch(switchBtns, (btns) => {
  // 如果当前 viewType 不在可用按钮中，重置为第一个可用值或默认值 0
  const isValid = btns.some(btn => btn.id === viewType.value)
  if (!isValid) {
    viewType.value = (btns.length > 0 ? btns?.[0]?.id : 0) || 0
  }
}, { immediate: true })

// 佣金 API 完整响应数据
const commissionData = ref<{
  currentMonth: any
  lastMonth: any
} | null>(null)

// 团队佣金总计数据
const teamCommissionTotal = ref(0)

// 佣金总计数据（个人/团队）- 从 commissionData 或 teamCommissionTotal 计算得出
const commissionTotal = computed(() => {
  // 团队视图：使用团队API的Total数据
  if (viewType.value === 1) {
    return teamCommissionTotal.value
  }
  // 个人视图：使用个人API的数据
  if (!commissionData.value || !commissionData.value.currentMonth) return 0
  return commissionData.value.currentMonth.CommissionTotal || 0
})

// 下级佣金数据（应发/已发佣金总计）
const subordinateCommission = ref({
  payableTotal: 0,
  paidTotal: 0
})

// 下级代理列表数据
const subordinateAgentList = ref<any[]>([])
const subordinatePagination = ref({
  currPage: 1,
  pageSize: 100,
  maxPageCount: 0,
  total: 0
})

// 团队成员列表数据
const teamAgentList = ref<any[]>([])
const teamPagination = ref({
  currPage: 1,
  pageSize: 100,
  maxPageCount: 0,
  total: 0
})

// 加载状态（始终为 false，因为使用 showLoadingToast 代替）
const loadingPersonalData = ref(false)
const loadingSubordinateList = ref(false)
const loadingTeamList = ref(false)

// 记录各视图是否已加载数据（用于避免重复请求）
const viewDataLoaded = ref({
  personal: false,  // 个人视图（viewType = 0）
  team: false,      // 团队视图（viewType = 1）
  subordinate: false // 下级视图（viewType = 2）
})

// 获取佣金数据（完整数据，传递给子组件使用）
const fetchCommissionData = async (skipLoading = false) => {
  // 如果不是跳过 loading（比如下拉刷新时），则显示 loading toast
  const loadingToast = !skipLoading ? showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 }) : null

  try {
    const res = await API.report.getReportCenterCommission({
      ReportMonth: selectedDate.value,
    } as any)

    // 請求失敗或 Data 為空時，清空 commissionData 並結束
    if (res.data.Code !== 200 || !res.data.Data) {
      commissionData.value = null
      viewDataLoaded.value.personal = true
      return
    }

    const data = res.data.Data

    // 根据用户类型选择数据
    if (isSingleAgent.value) {
      commissionData.value = {
        currentMonth: data.CurrentMonthSingleLayer,
        lastMonth: data.LastMonthSingleLayer,
      }
    } else {
      commissionData.value = {
        currentMonth: data.CurrentMonthMultiLayer,
        lastMonth: data.LastMonthMultiLayer,
      }
    }

    // 标记个人视图数据已加载
    viewDataLoaded.value.personal = true
  } catch (error) {
    console.error('获取佣金数据失败:', error)
    // 請求異常時也清空，避免殘留舊資料
    commissionData.value = null
  } finally {
    loadingToast?.close()
  }
}

// 获取下级代理列表数据
const fetchSubordinateAgentList = async (skipLoading = false) => {
  // 如果不是跳过 loading（比如下拉刷新时），则显示 loading toast
  const loadingToast = !skipLoading ? showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 }) : null

  try {
    // 映射发放状态（-1:未发放, 0:全部, 1:已发放, 2:已拒绝）
    const settlementStatusMap: Record<string, number> = {
      '全部状态': 0,
      '未发放': -1,
      '已发放': 1,
    }

    // 映射排序参数（带负号表示降序，不带负号表示升序）
    const sortMap: Record<string, string> = {
      '代理层级降序': '-AccountLevel',
      '代理层级升序': 'AccountLevel',
      '新增时间降序': '-CreateTime',
      '新增时间升序': 'CreateTime',
      '当期佣金降序': '-CommissionTotal',
      '当期佣金升序': 'CommissionTotal',
    }

    const res = await API.report.getReportCenterCommissionChild({
      ReportMonth: selectedDate.value,
      Page: subordinatePagination.value.currPage,
      PageSize: subordinatePagination.value.pageSize,
      AccountLevel: levelFilter.value, // 直接使用 levelFilter.value (0 或具体层级数字)
      AgentAccount: selectedAgent.value?.text || undefined,
      IsSettlement: settlementStatusMap[statusFilter.value] || 0,
      Sort: sortMap[commissionSortType.value] || '-AccountLevel', // 默认代理层级降序
    })

    if (res.data.Code !== 200) return

    const data = res.data.Data

    // 更新下级代理列表
    subordinateAgentList.value = data.Data || []

    // 更新分页信息
    if (data.Pagination) {
      subordinatePagination.value = {
        currPage: data.Pagination.CurrPage || 1,
        pageSize: data.Pagination.PageSize || 100,
        maxPageCount: data.Pagination.MaxPageCount || 0,
        total: data.Pagination.MaxCount || 0,
      }
    }

    // 更新应发/已发佣金总计
    if (data.Total) {
      subordinateCommission.value = {
        payableTotal: data.Total.SumActualCommissionTotal || 0, // 实际应发佣金
        paidTotal: data.Total.SumSendCommissionTotal || 0, // 已发佣金总计
      }
    }

    // 标记下级视图数据已加载
    viewDataLoaded.value.subordinate = true
  } catch (error) {
    console.error('获取下级代理列表失败:', error)
  } finally {
    loadingToast?.close()
  }
}

// 获取团队成员列表数据
const fetchTeamAgentList = async (skipLoading = false) => {
  // 如果不是跳过 loading（比如下拉刷新时），则显示 loading toast
  const loadingToast = !skipLoading ? showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 }) : null

  try {
    const res = await API.report.getReportCenterCommissionTeam({
      ReportMonth: selectedDate.value,
      Page: teamPagination.value.currPage,
      PageSize: teamPagination.value.pageSize,
      Username: selectedAgent.value?.text || undefined,
    })

    if (res.data.Code !== 200) return

    const data = res.data.Data

    // 直接使用API返回的CurrentMonth数组，已经包含了CurrentMonth和LastMonth的对比格式
    // 注意：实际API返回的数据结构与TypeScript接口定义不完全匹配
    teamAgentList.value = (data as any).Data || data.CurrentMonth || []

    // 团队API没有返回分页信息，使用数组长度作为总数
    teamPagination.value.total = teamAgentList.value.length

    // 更新团队佣金总计
    if (data.Total) {
      teamCommissionTotal.value = data.Total.CommissionTotal || 0
    }

    // 标记团队视图数据已加载
    viewDataLoaded.value.team = true
  } catch (error) {
    console.error('获取团队成员列表失败:', error)
  } finally {
    loadingToast?.close()
  }
}

// 日期选择（默认为已结算的最新一期(上个月））
const selectedDate = ref(dayjs().subtract(1, 'month').format('YYYY-MM'))

// 日期选项（根据视图类型动态生成）
const dateOptions = computed(() => {
  const options = []
  const now = new Date()

  // 根据视图类型确定月数
  // 个人视图(0)：近12个月
  // 团队视图(1)：近6个月
  // 下级视图(2)：近12个月
  const monthCount = viewType.value === 1 ? 6 : 12

  for (let i = 0; i < monthCount; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    options.push({ label: value, value })
  }
  return options
})

// 代理账号搜索选择
const selectedAgent = ref<SearchType | null>(null)

// 代理账号搜索列表（基于当前视图的代理列表生成）
const agentSearchOptions = computed<SearchType[]>(() => {
  const options: SearchType[] = []

  if (viewType.value === 2) {
    // 下级视图：排除自己，根据层级筛选
    subAgentList.value.forEach((agent: any) => {
      // 排除自己的 AdminId
      if (agent.Username && selfAdminId.value && agent.AdminId === selfAdminId.value) {
        return
      }

      // 根据层级筛选：levelFilter === 0 表示全部层级
      if (levelFilter.value !== 0 && agent.AccountLevel !== levelFilter.value) {
        return
      }

      if (agent.Username) {
        options.push({
          id: agent.AdminId,
          text: agent.Username
        })
      }
    })
  } else if (viewType.value === 1) {
    // 团队视图
    subAgentList.value.forEach((agent: any) => {
      if (agent.Username) {
        options.push({
          id: agent.AdminId,
          text: agent.Username
        })
      }
    })
  }

  return options
})


// 数字转中文
const numberToChinese = (num: number): string => {
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) {
    return chineseNumbers[num] || String(num)
  }
  if (num < 20) {
    const ones = chineseNumbers[num - 10] || String(num - 10)
    return `十${ones}`
  }
  if (num < 100) {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    const tensChar = chineseNumbers[tens] || String(tens)
    const onesChar = ones > 0 ? (chineseNumbers[ones] || String(ones)) : ''
    return `${tensChar}十${onesChar}`
  }
  return String(num)
}

// 下级视图筛选条件
const levelFilter = ref(0) // 默认值：0 (全部层级)
const statusFilter = ref('全部状态')
const commissionSortType = ref('代理层级降序')

// 层级选项（动态生成：从 subAgentList 提取下级代理的层级）
const levelOptions = computed(() => {
  const options: Array<{ label: string; value: number }> = [
    { label: '全部层级', value: 0 }
  ]

  // 从第二个元素开始（index 1），提取所有下级代理的层级
  if (subAgentList.value.length > 1) {
    // 获取所有下级代理的唯一层级，并排序
    const subordinateLevels = [...new Set(
      subAgentList.value.slice(1).map(agent => agent.AccountLevel)
    )].sort((a, b) => a - b)

    // 生成层级选项
    subordinateLevels.forEach(level => {
      options.push({
        label: `${numberToChinese(level)}级代理`,
        value: level
      })
    })
  }

  return options
})

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '已发放', value: '已发放' },
  { label: '未发放', value: '未发放' },
]

// 佣金排序选项
const commissionSortOptions = [
  { label: '代理层级降序', value: '代理层级降序' },
  { label: '代理层级升序', value: '代理层级升序' },
  { label: '新增时间降序', value: '新增时间降序' },
  { label: '新增时间升序', value: '新增时间升序' },
  { label: '当期佣金降序', value: '当期佣金降序' },
  { label: '当期佣金升序', value: '当期佣金升序' },
]

// 是否显示搜索和筛选区域（非个人状态时显示）
const showSearchAndFilter = computed(() => viewType.value !== 0)

// 是否是下级视图
const isSubordinateView = computed(() => viewType.value === 2)

// 一键发放处理
const handleRelease = async () => {
  try {
    // 收集所有未发放且类型为2（代理后台发放）的下级代理的 dataId
    const unreleaseIds = subordinateAgentList.value
      .filter(item => {
        const currentMonth = item.CurrentMonth || {}
        return currentMonth.IsSettlement !== 1 && currentMonth.SendType === 2
      })
      .map(item => item.CurrentMonth?.Id)
      .filter((id): id is number => id !== undefined)

    if (unreleaseIds.length === 0) {
      showToast('没有需要发放的下级代理')
      return
    }

    // 显示加载提示
    showLoadingToast({
      message: '发放中...',
      forbidClick: true,
    })

    // 调用一键发放 API
    const response = await API.admin.postAgentOneKeySend({
      Ids: unreleaseIds.join(','), // 转换为逗号分隔的字符串
      IsDeduct: 0, // 默认不抵扣欠款
      IsMulti: 1, // 多层单费率
    })

    // 关闭加载提示
    showToast({
      message: '发放成功',
      position: 'bottom',
    })

    // 刷新数据：下级列表 + 个人佣金（应发/已发总计会变化）
    await Promise.all([
      fetchSubordinateAgentList(),
      fetchCommissionData(true) // skipLoading = true，避免显示 loading
    ])
  } catch (error) {
    console.error('一键发放佣金失败:', error)
    showToast({
      message: `发放失败: ${error}`,
      position: 'bottom',
    })
  }
}

// 下拉刷新
const refreshing = ref(false)
const onRefresh = async () => {
  // 清空当前视图的加载标志
  if (viewType.value === 0) {
    viewDataLoaded.value.personal = false
  } else if (viewType.value === 1) {
    viewDataLoaded.value.team = false
  } else if (viewType.value === 2) {
    viewDataLoaded.value.subordinate = false
  }

  // 刷新个人佣金数据（所有视图都需要）
  // 下拉刷新时跳过列表 loading，使用下拉刷新的 loading
  await fetchCommissionData(true)

  // 刷新当前视图的数据
  if (viewType.value === 2) {
    await fetchSubordinateAgentList(true)
  } else if (viewType.value === 1) {
    await fetchTeamAgentList(true)
  }

  refreshing.value = false
}

// 监听代理选择变化
watch(selectedAgent, () => {
  if (viewType.value === 2) {
    // 下级视图：搜索下级代理
    fetchSubordinateAgentList()
  } else if (viewType.value === 1) {
    // 团队视图：搜索团队成员
    fetchTeamAgentList()
  }
})

// 监听视图类型变化
watch(viewType, (newType) => {
  updateStickyDimensions()

  // 清空搜索选择
  selectedAgent.value = null

  // 检查当前选中的日期是否在新视图的日期范围内
  const availableDates = dateOptions.value.map(opt => opt.value)
  if (!availableDates.includes(selectedDate.value)) {
    // 如果不在范围内，重置为已结算的最新一期（上个月）
    selectedDate.value = dayjs().subtract(1, 'month').format('YYYY-MM')
  }

  // 切换到下级视图时，仅在第一次切换时获取数据
  if (newType === 2 && !viewDataLoaded.value.subordinate) {
    fetchSubordinateAgentList()
  }

  // 切换到团队视图时，仅在第一次切换时获取数据
  if (newType === 1 && !viewDataLoaded.value.team) {
    fetchTeamAgentList()
  }
})

// 监听日期变化，重新获取数据
watch(selectedDate, () => {
  // 清空所有视图的加载标志，强制重新请求
  viewDataLoaded.value.personal = false
  viewDataLoaded.value.team = false
  viewDataLoaded.value.subordinate = false

  // 获取个人佣金数据
  fetchCommissionData()

  // 如果当前是下级视图，也更新下级数据
  if (viewType.value === 2) {
    fetchSubordinateAgentList()
  }

  // 如果当前是团队视图，也更新团队数据
  if (viewType.value === 1) {
    fetchTeamAgentList()
  }
})

// 监听层级筛选变化，清空代理选择
watch(levelFilter, () => {
  // 层级筛选改变时，清空已选代理（因为可能不在新的筛选结果中）
  selectedAgent.value = null
})

// 监听筛选条件变化（下级视图）
watch([levelFilter, statusFilter, commissionSortType], () => {
  if (viewType.value === 2) {
    fetchSubordinateAgentList()
  }
})

// 组件挂载时获取数据
onMounted(async () => {
  // 获取下级代理列表（用于动态生成层级筛选选项）
  await userStore.fetchSubAgentList()

  fetchCommissionData()

  // 如果初始就是下级视图，也获取下级数据
  if (viewType.value === 2) {
    fetchSubordinateAgentList()
  }

  // 如果初始就是团队视图，也获取团队数据
  if (viewType.value === 1) {
    fetchTeamAgentList()
  }
})
</script>

<template>
  <div class="commission-container" ref="commissionContainerRef">
    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      class="commission-pull-refresh"
      v-model="refreshing"
      :disabled="pullRefreshDisabled"
      @refresh="onRefresh"
    >
      <!-- 佣金总计卡片 -->
      <div class="px-3 pt-1 pb-2">
        <!-- 个人/团队：佣金总计 -->
        <CommissionSummary v-if="!isSubordinateView" :total="commissionTotal" :is-single-agent="isSingleAgent" />

        <!-- 下级：应发/已发佣金总计 + 一键发放 -->
        <CommissionSummaryCard v-else :payable-total="subordinateCommission.payableTotal"
          :paid-total="subordinateCommission.paidTotal"
          :is-settlement="commissionData?.currentMonth?.IsSettlement || 0"
          :settlement-time="commissionData?.currentMonth?.SettlementTime || 0"
          @release="handleRelease" />
      </div>

      <!-- 个人状态：只显示日期选择器（sticky 固定） -->
      <div v-if="!showSearchAndFilter">
        <!-- 占位元素（fixed 时避免内容跳动） -->
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }"></div>
        <div class="sticky-filter-bar px-3 py-1" :class="{ 'is-fixed': isFilterBarFixed }">
          <Dropdown v-model="selectedDate" :options="dateOptions" height="2.5rem" />
        </div>
      </div>

      <!-- 团队/下级状态：显示搜索框和筛选器（sticky 固定） -->
      <div v-else>
        <!-- 占位元素（fixed 时避免内容跳动） -->
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }"></div>
        <div class="sticky-filter-bar px-3 py-1 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
        <!-- 代理账号搜索框 -->
        <SearchBar
          v-model:selected="selectedAgent"
          :search-ls="agentSearchOptions"
          placeholder="代理账号"
        />

        <!-- 团队视图筛选条件 -->
        <div v-if="!isSubordinateView" class="filter-scroll-container">
          <!-- 日期选择 -->
          <Filled v-model="selectedDate" :options="dateOptions" height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]" />
        </div>

        <!-- 下级视图筛选条件 -->
        <div v-else class="filter-scroll-container">
          <!-- 日期选择 -->
          <Filled v-model="selectedDate" :options="dateOptions" height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]" />

          <!-- 层级筛选 -->
          <Filled v-model="levelFilter" :options="levelOptions" height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]" />

          <!-- 状态筛选 -->
          <Filled v-model="statusFilter" :options="statusOptions" height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]" />

          <!-- 佣金排序 -->
          <Filled v-model="commissionSortType" :options="commissionSortOptions" height="1.5rem"
            class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]" />
        </div>
        </div>
      </div>

      <!-- 代理列表 -->
      <div class="commission-list-container">
        <AgentList
          :view-type="viewType"
          :selected-date="selectedDate"
          :commission-data="commissionData"
          :subordinate-agent-list="subordinateAgentList"
          :team-agent-list="teamAgentList"
          :loading-personal-data="loadingPersonalData"
          :loading-subordinate-list="loadingSubordinateList"
          :loading-team-list="loadingTeamList"
          @refresh="fetchSubordinateAgentList"
          @refresh-commission="() => fetchCommissionData(true)"
        />
      </div>
    </van-pull-refresh>

    <!-- 固定悬浮按钮（仅当有多个选项时显示） -->
    <ReportSwitchBtn v-if="showSwitchBtn" :switch-btns="switchBtns" v-model:view-type="viewType" />
  </div>
</template>

<style lang="scss" scoped>
.commission-container {
  width: 100%;
  position: relative;
  background-color: white;
}

.commission-pull-refresh {
  /* 确保 van-pull-refresh 不会阻止 sticky */
  :deep(.van-pull-refresh__track) {
    overflow: visible !important;
  }
}

.commission-pull-refresh-override {
  /* ⚡️ 核心：強制禁用 van-pull-refresh 容器本身的觸控手勢處理 */
  touch-action: none !important;

  /* 確保 van-pull-refresh 內部軌道不阻擋事件 */
  :deep(.van-pull-refresh__track) {
    height: auto !important;
    overflow-y: visible !important;

    /* 確保觸控事件能夠傳遞給父級 */
    touch-action: pan-y !important;

    /* 清理 Vant 可能帶來的 transform/transition */
    transform: none !important;
    transition: none !important;
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

.commission-list-container {
  // flex: 1;
  margin-top: 8px;
  padding: 0 0.75rem 0.75rem;
}

/* 筛选器横向滚动容器 */
.filter-scroll-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Firefox */

  &::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari, Edge */
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
