<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import Big from 'big.js'
import AgentDataCard from './components/agentDataCard.vue'
import AgentCard from './components/agentCard.vue'
import AgentDetailSheet from './components/agentDetailSheet.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import apis from '@/apis'
import type { HistoryItem, RealTimeItem, DownLineItem, MemberFinanceReportTotalItem } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas } from '@/utils/formatNumber'

import { useSticky } from '@/composables/useSticky'
import { useUserStore } from '@/stores/user'

const agentContainerRef = ref<HTMLElement | null>(null)
const userStore = useUserStore()

// 从 store 获取下级代理相关数据
const { subAgentList, isSingleAgent, hasTeam, isMainLine, userInfo } = storeToRefs(userStore)

// API Data
const reportSummary = ref<MemberFinanceReportTotalItem>({
  SumAccountChangeSumNum: 0,
  SumAgentCommissionSumNum: 0,
  SumBetWaterMoney: 0,
  SumFirstPayMoney: 0,
  SumFirstPayNum: 0,
  SumLogin: 0,
  SumPayMergerMoney: 0,
  SumPayMergerNum: 0,
  SumRedSumNum: 0,
  SumReg: 0,
  SumTransBetMoney1: 0,
  SumTransBetNum1: 0,
  SumTransWinMoney1: 0,
  SumWithdrawMoney: 0,
  SumWithdrawNum: 0,
  SumWithdrawPureNum: 0
})
const realtimeReportData = ref<RealTimeItem | null>(null)
const realtimeAgentsReport = ref<DownLineItem[]>([])
const historyReportList = ref<HistoryItem[]>([])

// Loading状态
const loading = ref(false)
const finished = ref(false)
const error = ref(false)

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

// 月报/日报切换（只在历史模式下有效）
const reportType = ref(0)  // 1: 日报, 2: 月报

// 计算 ReportType (API 参数: 1=日报, 2=月报)
const currentReportType = computed<1 | 2>(() => reportType.value === 1 ? 1 : 2)

// ============ 实时模式 total（今日）时间范围 ============
const totalBeginTime = computed(() => {
  // 历史模式：与卡片数据相同
  if (isHistoryMode.value) {
    if (reportType.value === 0) {
      return dayjs().subtract(6, 'month').format('YYYY-MM')
    }
    return statsBeginTime.value
  }

  // 实时模式：固定为今日
  return dayjs().format('YYYY-MM-DD')
})

const totalEndTime = computed(() => {
  // 历史模式：与卡片数据相同
  if (isHistoryMode.value) {
    if (reportType.value === 0) {
      return dayjs().subtract(1, 'month').format('YYYY-MM')
    }
    return statsEndTime.value
  }

  // 实时模式：固定为今日
  return dayjs().format('YYYY-MM-DD')
})

// 实时模式 total 固定使用日报
const totalReportType = computed<1 | 2>(() => {
  if (isHistoryMode.value) {
    return currentReportType.value
  }
  // 实时模式固定为日报
  return 1
})

// ============ 卡片数据（近7日不含今日）时间范围 ============
const beginTime = computed(() => {
  // 历史模式
  if (isHistoryMode.value) {
    // 月报：固定查询最近六个月，不含本月，格式 YYYY-MM
    // 例如現在是 2025-12，則範圍為 2025-06 ~ 2025-11
    if (reportType.value === 0) {
      return dayjs().subtract(6, 'month').format('YYYY-MM')
    }

    // 日报：使用统计时间筛选（YYYY-MM-DD）
    return statsBeginTime.value
  }

  // 实时模式：固定为近7日日报模式，不含今日
  // 例如今天是 2025-12-11，则范围为 2025-12-04 ~ 2025-12-10
  return dayjs().subtract(7, 'day').format('YYYY-MM-DD')
})

const endTime = computed(() => {
  // 历史模式
  if (isHistoryMode.value) {
    // 月报：固定查询最近六个月，结束为上个月 YYYY-MM（不含本月）
    if (reportType.value === 0) {
      return dayjs().subtract(1, 'month').format('YYYY-MM')
    }

    // 日报：使用统计时间筛选（YYYY-MM-DD，不含今日）
    return statsEndTime.value
  }

  // 实时模式：固定为近7日日报模式，不含今日（结束时间为昨天）
  return dayjs().subtract(1, 'day').format('YYYY-MM-DD')
})

// 卡片数据固定使用日报
const cardReportType = computed<1 | 2>(() => {
  if (isHistoryMode.value) {
    return currentReportType.value
  }
  // 实时模式固定为日报
  return 1
})

// 数字转中文
const numberToChinese = (num: number): string => {
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) {
    return chineseNumbers[num] || String(num)
  }
  // 11-99 的处理
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
  // 100 以上直接返回数字
  return String(num)
}

// 计算盈余比例
const calculateProfitMargin = (betAmount: number, winAmount: number) => {
  if (betAmount === 0) return '0%'
  const profit = betAmount - winAmount
  const margin = (profit / betAmount) * 100
  return `${+margin.toFixed(2)}%`
}

// 计算转化率
const calculateConversionRate = (firstPayNum: number, regNum: number) => {
  if (regNum === 0) return '0%'
  const rate = (firstPayNum / regNum) * 100
  return `${+rate.toFixed(2)}%`
}

// 实时数据
const realtimeData = computed(() => {
  const data = realtimeReportData.value || reportSummary.value
  const totalProfit = (data.SumTransBetMoney1 - data.SumTransWinMoney1) / 100
  return {
    date: dayjs().format('YYYY-MM-DD'),
    totalProfit: formatMoneyWithCommas(data.SumTransBetMoney1 - data.SumTransWinMoney1, 2, true),
    betAmount: formatMoneyWithCommas(data.SumTransBetMoney1, 2, true),
    profitMargin: calculateProfitMargin(data.SumTransBetMoney1, data.SumTransWinMoney1),
    firstDepositCount: data.SumFirstPayNum.toLocaleString(),
    registerCount: data.SumReg.toLocaleString(),
    conversionRate: calculateConversionRate(data.SumFirstPayNum, data.SumReg),
    totalProfitSign: totalProfit >= 0 ? '+' : ''
  }
})

// 历史数据
const historyData = computed(() => {
  const data = reportSummary.value
  const totalProfit = (data.SumTransBetMoney1 - data.SumTransWinMoney1) / 100
  return {
    totalProfit: formatMoneyWithCommas(data.SumTransBetMoney1 - data.SumTransWinMoney1, 2, true),
    betAmount: formatMoneyWithCommas(data.SumTransBetMoney1, 2, true),
    profitMargin: calculateProfitMargin(data.SumTransBetMoney1, data.SumTransWinMoney1),
    firstDepositCount: data.SumFirstPayNum.toLocaleString(),
    registerCount: data.SumReg.toLocaleString(),
    conversionRate: calculateConversionRate(data.SumFirstPayNum, data.SumReg),
    totalProfitSign: totalProfit >= 0 ? '+' : ''
  }
})

// 代理类型判断（从 userStore 获取）
// 'single': 单层代理, 'single_team_sub': 单层团队副线, 'single_team_main': 单层团队主线, 'multi': 多层代理
const agentType = computed<'single' | 'single_team_sub' | 'single_team_main' | 'multi'>(() => {
  if (isSingleAgent.value) {
    // 单层代理
    if (hasTeam.value) {
      // 有团队，根据 isMainLine 判断主线/副线
      if (isMainLine.value) {
        return 'single_team_main'
      } else {
        return 'single_team_sub'
      }
    } else {
      // 无团队
      return 'single'
    }
  } else {
    // 多层代理
    return 'multi'
  }
})

// 判断是否是多层代理
const isMultiLevelAgent = computed(() => agentType.value === 'multi')

// 判断是否显示筛选功能
const showFilters = computed(() => {
  if (isHistoryMode.value) {
    // 历史模式：所有代理类型都显示筛选功能
    // 单层代理、单层团队副线：日报时间筛选+产品包筛选
    // 单层团队主线、多层代理：代理账号筛选+日报时间筛选+产品包筛选
    return true
  } else {
    // 实时模式：
    // 单层代理、单层团队副线：无筛选功能
    if (agentType.value === 'single' || agentType.value === 'single_team_sub') {
      return false
    }
    // 单层团队主线、多层代理：显示筛选功能
    return true
  }
})

// 排序方式（根据代理类型动态变化）
const sortType = ref('')

const sortOptions = computed(() => {
  if (agentType.value === 'single_team_main') {
    // 单层团队主线的排序
    return [
      { label: '新增时间降序', value: '新增时间降序' },
      { label: '新增时间升序', value: '新增时间升序' },
      { label: '总盈利降序', value: '总盈利降序' },
      { label: '总盈利升序', value: '总盈利升序' }
    ]
  } else {
    // 多层代理的排序
    return [
      { label: '代理层级降序', value: '代理层级降序' },
      { label: '代理层级升序', value: '代理层级升序' },
      { label: '总盈利降序', value: '总盈利降序' },
      { label: '总盈利升序', value: '总盈利升序' }
    ]
  }
})

// 根据代理类型初始化排序
watch(agentType, (newType) => {
  if (newType === 'single_team_main') {
    sortType.value = '新增时间降序'
  } else if (newType === 'multi') {
    sortType.value = '代理层级降序'
  } else {
    sortType.value = '总盈利降序'
  }
}, { immediate: true })

// ==================== 实时模式：层级筛选 + 代理选择 ====================

// 实时模式：层级筛选（0 = 全部层级, number = 具体层级）
const selectedLevel = ref<number>(0)

// 实时模式：层级筛选选项（基于实时数据动态生成）
const levelFilterOptions = computed(() => {
  const options: Array<{ label: string; value: number }> = [
    { label: '全部层级', value: 0 }
  ]

  // 从实时代理列表中提取所有唯一层级
  if (realtimeAgentList.value.length > 0) {
    const levels = new Set<number>()
    realtimeAgentList.value.forEach(agent => {
      if ('rawData' in agent && agent.rawData && 'AccountLevel' in agent.rawData) {
        levels.add(agent.rawData.AccountLevel)
      }
    })

    // 排序并生成选项
    const sortedLevels = Array.from(levels).sort((a, b) => a - b)
    sortedLevels.forEach(level => {
      options.push({
        label: `${numberToChinese(level)}级代理`,
        value: level
      })
    })
  }

  return options
})

// 实时模式：代理选择（用于搜索和选择具体代理）
const selectedRealtimeAgent = ref<SearchType | null>(null)

// 实时模式：代理搜索列表（根据 selectedLevel 过滤）
const realtimeAgentListOptions = computed<SearchType[]>(() => {
  const options: SearchType[] = []

  // 先根据层级筛选
  let filteredList = [...realtimeAgentList.value]
  if (selectedLevel.value !== 0) {
    filteredList = filteredList.filter(agent => {
      if ('rawData' in agent && agent.rawData && 'AccountLevel' in agent.rawData) {
        return agent.rawData.AccountLevel === selectedLevel.value
      }
      return false
    })
  }

  // 转换为 SearchType 格式
  filteredList.forEach(agent => {
    if ('rawData' in agent && agent.rawData && 'AdminId' in agent.rawData) {
      options.push({
        id: agent.rawData.AdminId,
        text: agent.username || String(agent.rawData.AdminId)
      })
    }
  })

  return options
})

// ==================== 历史模式：代理账号筛选 ====================

type SearchType = {
  id: number | string
  text: string
}

// 历史模式：代理账号筛选
const selectedAgent = ref<SearchType | null>(null)

// 历史模式：代理账号搜索列表（后端已将自身放在 index 0）
const agentListOptions = computed<SearchType[]>(() => {
  const options: SearchType[] = []

  // subAgentList 的第一个元素是自身
  const selfAgent = subAgentList.value[0]
  if (selfAgent) {
    // 构建自身的标签
    let selfLabel = selfAgent.Username

    // 如果是单层代理有团队且是主线，显示"(主线)"
    if (hasTeam.value && isMainLine.value) {
      selfLabel += ' (主线)'
    } else {
      // selfLabel += ' (自身)'
    }

    options.push({
      id: selfAgent.AdminId,
      text: selfLabel
    })

    // 其余是下级代理
    for (let i = 1; i < subAgentList.value.length; i++) {
      const agent = subAgentList.value[i]
      if (agent) {
        const label = agent.Username

        // 多层代理需标注"代理层级"
        if (isMultiLevelAgent.value) {
          // label = `${agent.Username} (${numberToChinese(agent.AccountLevel)}级)`
        }

        options.push({
          id: agent.AdminId,
          text: label
        })
      }
    }
  }

  return options
})

// ==================== 统计时间筛选（历史模式专用）====================
// 使用 TimeFilterDropdown 组件
// 选项：近7日、近14日、自定义
// 默认：近7日
// 注意：历史数据的"近7日""近14日"不包含今天（到昨天）
const timestampToSecond = (timestamp: number) => +new Big(timestamp).div(1000).toFixed(0)

// 自定义时间范围（用于自定义选项）
const customTimeRange = ref<{ startTime: number; endTime: number }>({ startTime: 0, endTime: 0 })
const showDatePicker = ref(false)

// 历史模式的时间选项（不包含今天）
const historyTimeRangeOptions = [
  {
    label: '近7日',
    startTime: timestampToSecond(dayjs().subtract(7, 'day').startOf('day').valueOf()),
    endTime: timestampToSecond(dayjs().subtract(1, 'day').endOf('day').valueOf()) // 到昨天
  },
  {
    label: '近14日',
    startTime: timestampToSecond(dayjs().subtract(14, 'day').startOf('day').valueOf()),
    endTime: timestampToSecond(dayjs().subtract(1, 'day').endOf('day').valueOf()) // 到昨天
  },
  {
    label: '自定义',
    action: () => { showDatePicker.value = true },
    startTime: computed(() => customTimeRange.value.startTime),
    endTime: computed(() => customTimeRange.value.endTime)
  }
]

const selectTimeRange = ref({
  startTime: timestampToSecond(dayjs().subtract(7, 'day').startOf('day').valueOf()),
  endTime: timestampToSecond(dayjs().subtract(1, 'day').endOf('day').valueOf()) // 默认近7日（到昨天）
})

// 计算统计时间的开始和结束时间（格式：YYYY-MM-DD）
const statsBeginTime = computed(() => {
  return dayjs(selectTimeRange.value.startTime * 1000).format('YYYY-MM-DD')
})

const statsEndTime = computed(() => {
  return dayjs(selectTimeRange.value.endTime * 1000).format('YYYY-MM-DD')
})

// 产品包筛选
const selectedProduct = ref<number | null>(null) // null 表示全部产品
const productOptions = computed(() => {
  return [
    { label: '全部产品', value: null },
    ...userStore.productPackages.map((pkg) => ({
      label: pkg.PackageName,
      value: pkg.PackageId,
    }))
  ]
})

// 时间选择器确认（用于自定义选项中的 van-calendar）
const onConfirmDateRange = (values: Date | Date[]) => {
  if (Array.isArray(values) && values.length === 2 && values[0] && values[1]) {
    const data = {
      startTime: timestampToSecond(dayjs(values[0]).valueOf()),
      endTime: timestampToSecond(dayjs(values[1]).valueOf())
    }
    customTimeRange.value = data
    selectTimeRange.value = { ...data }
  }
  showDatePicker.value = false
}

// 初始化下级代理列表并设置默认值
const initSubAgentList = async () => {
  await userStore.fetchSubAgentList()
  // 历史模式：设置默认 selectedAgent（自身）
  if (isHistoryMode.value && agentListOptions.value.length > 0) {
    selectedAgent.value = agentListOptions.value[0] || null // 第一个是自身
  }
  // 实时模式：使用 selectedLevel（默认为 0 = 全部层级），不需要设置
}

// 转换下级代理数据为卡片格式
const formatAgentData = (agent: DownLineItem) => {
  const betAmount = (agent.SumTransBetMoney1 || 0) / 100
  const winAmount = (agent.SumTransWinMoney1 || 0) / 100
  const totalProfit = betAmount - winAmount

  // 构建层级标签
  let levelLabel = ''

  // 判断是否是自身
  const isSelf = agent.AdminId === userInfo.value?.NetCashAccount?.AdminId

  if (isSingleAgent.value) {
    // 单层代理
    if (hasTeam.value && isMainLine.value) {
      // 团队主线
      if (isSelf) {
        levelLabel = '(主线)'
      } else {
        // 副线：不显示层级标签
        levelLabel = ''
      }
    } else {
      // 无团队的单层代理 或 团队副线：不显示层级
      levelLabel = ''
    }
  } else {
    // 多层代理：显示层级
    levelLabel = `${numberToChinese(agent.AccountLevel)}级代理`
  }

  return {
    username: agent.Username,
    level: levelLabel,
    totalProfit: totalProfit,
    betAmount: betAmount,
    profitMargin: calculateProfitMargin(agent.SumTransBetMoney1, agent.SumTransWinMoney1),
    firstDepositCount: agent.SumFirstPayNum || 0,
    registerCount: agent.SumReg || 0,
    conversionRate: calculateConversionRate(agent.SumFirstPayNum, agent.SumReg),
    totalProfitSign: totalProfit >= 0 ? '+' : '',
    rawData: agent
  }
}

// 实时代理列表
const realtimeAgentList = computed(() => {
  return realtimeAgentsReport.value.map(formatAgentData)
})

// 历史代理列表格式化函数
const formatHistoryData = (item: HistoryItem) => {
  const betAmount = (item.SumTransBetMoney1 || 0) / 100
  const winAmount = (item.SumTransWinMoney1 || 0) / 100
  const totalProfit = betAmount - winAmount
  const firstDepositCount = item.SumFirstPayNum || 0
  const registerCount = item.SumReg || 0

  return {
    date: item.ReportMonth || item.ReportDay || '-',
    totalProfit: totalProfit,
    betAmount: betAmount,
    profitMargin: calculateProfitMargin(betAmount * 100, winAmount * 100), // 传入分为单位
    firstDepositCount: firstDepositCount,
    registerCount: registerCount,
    conversionRate: calculateConversionRate(firstDepositCount, registerCount),
    rawData: item // 保存原始数据用于详情显示
  }
}

// 历史代理列表
const historyAgentList = computed(() => {
  return historyReportList.value.map(formatHistoryData)
})

// 计算需要查询的 AdminId 字符串
const queryAdminIdStr = computed<string | undefined>(() => {
  // 实时模式：始终不传 AdminId（获取全部代理，前端进行层级过滤）
  if (!isHistoryMode.value) {
    return undefined
  }

  // 历史模式：根据 selectedAgent 决定是否传 AdminId
  // null 表示查询全部（自身+所有下级），不传 AdminId
  if (selectedAgent.value === null) {
    return undefined
  }
  // 有值则传该代理的 AdminId
  return String(selectedAgent.value.id)
})

// 将前端排序映射到 API 的 Sort 参数
const apiSortParam = computed<string | undefined>(() => {
  if (!sortType.value) return undefined

  const sortMap: Record<string, string> = {
    '新增时间降序': '-TeamCreateTime',
    '新增时间升序': 'TeamCreateTime',
    '总盈利降序': '-Profit',
    '总盈利升序': 'Profit',
    '代理层级降序': '-AccountLevel',
    '代理层级升序': 'AccountLevel',
  }

  return sortMap[sortType.value]
})

// 获取财务报表总计数据（实时模式：今日数据；历史模式：根据筛选条件）
const fetchReportTotal = async () => {
  try {
    const response = await apis.admin.getMemberFinanceReportTotal({
      BeginTime: totalBeginTime.value,
      EndTime: totalEndTime.value,
      ReportType: totalReportType.value,
      SearchType: isHistoryMode.value ? 'old' : 'today',
      PackageId: selectedProduct.value || undefined,
      AdminId: queryAdminIdStr.value
    })
    if (response.data.Code === 200) {
      reportSummary.value = response.data.Data.BannerItems
    } else {
      showToast({ message: response.data.Msg || '获取总计数据失败', position: 'bottom' })
    }
  } catch (err) {
    console.error('获取财务报表总计失败:', err)
    showToast({ message: '获取总计数据异常', position: 'bottom' })
  }
}

// 获取财务报表列表数据（实时模式：近7日不含今日；历史模式：根据筛选条件）
const fetchReportList = async () => {
  loading.value = true
  error.value = false
  try {
    const response = await apis.admin.getMemberFinanceReport({
      BeginTime: beginTime.value,
      EndTime: endTime.value,
      ReportType: cardReportType.value,
      SearchType: isHistoryMode.value ? 'old' : 'today',
      PackageId: selectedProduct.value || undefined,
      AdminId: queryAdminIdStr.value,
      Sort: isHistoryMode.value ? undefined : apiSortParam.value
    } as any)

    if (response.data.Code === 200) {
      if (isHistoryMode.value) {
        // 历史模式
        historyReportList.value = response.data.Data.Items || []
      } else {
        // 实时模式
        realtimeReportData.value = response.data.Data.TodayItems

        // 单层代理或团队副线：TodayItems 是自身数据（对象），AdminsReport 为 null
        // 需要将 TodayItems 转换成数组格式
        if ((isSingleAgent.value && !hasTeam.value) || !userStore.isMainLine) {
          // 将 TodayItems 转换成 DownLineItem 格式的数组
          const todayItems = response.data.Data.TodayItems
          if (todayItems && userInfo.value?.NetCashAccount?.AdminId) {
            realtimeAgentsReport.value = [{
              ...todayItems,
              AdminId: userInfo.value.NetCashAccount.AdminId,
              AccountLevel: userInfo.value.NetCashAccount.AccountLevel || 1,
              // 补充 RealTimeItem 中没有但 DownLineItem 需要的字段
              SumChangeWithdrawMoney: 0,
              SumCustomerWithdrawMoney: 0,
              Username: userInfo.value.Admin.Username || ''
            }]
          } else {
            realtimeAgentsReport.value = []
          }
        } else {
          // 单层团队主线或多层代理：AdminsReport 是数组
          realtimeAgentsReport.value = response.data.Data.AdminsReport || []
        }
      }
      finished.value = true
    } else {
      error.value = true
      showToast({ message: response.data.Msg || '获取列表数据失败', position: 'bottom' })
    }
  } catch (err) {
    error.value = true
    console.error('获取财务报表列表失败:', err)
    showToast({ message: '获取列表数据异常', position: 'bottom' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 获取所有数据
const fetchAllData = () => {
  fetchReportTotal()
  fetchReportList()
}

// 原始代理列表（未过滤）
const rawAgentList = computed(() => isHistoryMode.value ? historyAgentList.value : realtimeAgentList.value)

// 过滤和排序后的代理列表
const agentList = computed(() => {
  let list = [...rawAgentList.value]

  // 历史模式下不进行过滤（历史模式数据结构不同）
  if (isHistoryMode.value) {
    return list
  }

  // 以下逻辑仅适用于实时模式
  // 1. 层级过滤
  if (selectedLevel.value !== 0) {
    list = list.filter(agent => {
      if ('rawData' in agent && agent.rawData && 'AccountLevel' in agent.rawData) {
        return agent.rawData.AccountLevel === selectedLevel.value
      }
      return false
    })
  }

  // 2. 代理选择过滤（通过 SearchBar 选择的代理）
  if (selectedRealtimeAgent.value !== null) {
    list = list.filter(agent => {
      if ('rawData' in agent && agent.rawData && 'AdminId' in agent.rawData) {
        return agent.rawData.AdminId === selectedRealtimeAgent.value?.id
      }
      return false
    })
  }

  // 3. 排序由后端处理（通过 Sort 参数），前端不需要再排序
  return list
})

// 下拉刷新
const refreshing = ref(false)
const onRefresh = () => {
  refreshing.value = true
  finished.value = false
  error.value = false
  fetchAllData()
}

// van-list 加载（此页面不需要分页，onLoad 留空即可）
const onLoad = () => {
  // 数据在 onMounted 和 watch 中获取，这里不需要做任何事
}

// 监听切换事件
watch(reportType, () => {
  finished.value = false
  error.value = false
  fetchAllData()
})

// 标记是否已完成初始化
const isInitialized = ref(false)

// 监听排序变化（排序由后端处理，需要重新调用 API）
watch(sortType, () => {
  // 初始化时跳过（由 onMounted 统一处理）
  if (!isInitialized.value) return

  // 如果是模式切换触发的，跳过（由 watch(isHistoryMode) 处理）
  if (isSwitchingMode.value) return

  finished.value = false
  error.value = false
  fetchAllData()
})

// 防止模式切换时重复调用 API 的标志
const isSwitchingMode = ref(false)

// 监听模式切换，设置默认筛选值
watch(isHistoryMode, async (newIsHistoryMode) => {
  isSwitchingMode.value = true

  if (newIsHistoryMode) {
    // 切换到历史模式：默认选择自身（第一个选项）
    if (agentListOptions.value.length > 0) {
      selectedAgent.value = agentListOptions.value[0] || null
    }
  } else {
    // 切换到实时模式：重置层级筛选为全部
    selectedLevel.value = 0
    selectedRealtimeAgent.value = null
    selectedAgent.value = null
  }

  // 等待响应式更新完成
  await nextTick()

  // 模式切换时统一在这里调用 fetchAllData
  finished.value = false
  error.value = false
  fetchAllData()

  // 重置标志
  isSwitchingMode.value = false
})

// 监听实时模式层级变化，清空代理选择
watch(selectedLevel, () => {
  // 层级改变时清空代理选择
  selectedRealtimeAgent.value = null
})

// 监听产品筛选变化（实时 + 历史共用，都需要调用 API）
watch(selectedProduct, () => {
  // 如果是模式切换触发的，跳过（由 watch(isHistoryMode) 处理）
  if (isSwitchingMode.value) return

  finished.value = false
  error.value = false
  fetchAllData()
})

// 监听历史模式筛选条件变化（仅历史模式，调用 API）
watch([selectedAgent, selectTimeRange], () => {
  // 仅在历史模式下触发
  if (!isHistoryMode.value) return

  // 如果是模式切换触发的，跳过（由 watch(isHistoryMode) 处理）
  if (isSwitchingMode.value) return

  finished.value = false
  error.value = false
  fetchAllData()
}, { deep: true })

// 组件挂载时获取初始数据
onMounted(async () => {
  // 获取下级代理列表并设置默认值
  await initSubAgentList()

  // 实时模式：始终调用 fetchAllData（不依赖 watch）
  // 历史模式：如果 initSubAgentList 中设置了 selectedAgent，watch 会自动触发
  if (!isHistoryMode.value) {
    fetchAllData()
  } else {
    // 历史模式：检查 selectedAgent 是否被修改
    if (selectedAgent.value === null) {
      // 如果没有修改，手动调用
      fetchAllData()
    }
  }

  // 标记初始化完成
  isInitialized.value = true
})

// 详情 sheet 状态
const showDetailSheet = ref(false)
const currentAgentDetail = ref<any>(null)

// 点击代理卡片
const handleAgentClick = (agent: any) => {
  const rawData = agent.rawData as DownLineItem | HistoryItem

  // 计算平均首充金额
  const avgFirstDeposit = rawData.SumFirstPayNum > 0
    ? (rawData.SumFirstPayMoney || 0) / rawData.SumFirstPayNum / 100
    : 0

  if (!isHistoryMode.value) {
    // 实时模式：显示代理详情
    const downLineData = rawData as DownLineItem
    currentAgentDetail.value = {
      username: agent.username,
      level: agent.level,
      totalProfit: agent.totalProfit,
      betUserCount: downLineData.SumTransBetNum1 || 0,
      betAmount: agent.betAmount,
      profitMargin: agent.profitMargin,
      firstDepositCount: agent.firstDepositCount,
      conversionRate: agent.conversionRate,
      registerCount: agent.registerCount,
      loginCount: downLineData.SumLogin || 0,
      firstDepositAmount: (downLineData.SumFirstPayMoney || 0) / 100,
      avgFirstDeposit: avgFirstDeposit,
      depositCount: downLineData.SumPayMergerNum || 0,
      depositAmount: (downLineData.SumPayMergerMoney || 0) / 100,
      withdrawCount: downLineData.SumWithdrawNum || 0,
      withdrawAmount: (downLineData.SumWithdrawMoney || 0) / 100,
      winLossAdjustment: (downLineData.SumAccountChangeSumNum || 0) / 100,
      bonus: (downLineData.SumRedSumNum || 0) / 100,
      rebate: (downLineData.SumBetWaterMoney || 0) / 100,
      agentCommission: (downLineData.SumAgentCommissionSumNum || 0) / 100,
      date: downLineData.ReportMonth || downLineData.ReportDay || dayjs().format('YYYY-MM')
    }
  } else {
    // 历史模式：显示日期/月份的汇总详情
    const historyData = rawData as HistoryItem

    // 根据 selectedAgent 获取代理信息
    let agentName = '-'
    let agentLevel = ''

    if (selectedAgent.value === null) {
      agentName = userInfo.value?.Admin?.Username || ''
    } else {
      // 从 subAgentList 中找到对应的代理
      const agent = subAgentList.value.find(a => a.AdminId === selectedAgent.value?.id)
      if (agent) {
        agentName = agent.Username

        // 判断是否是自身
        const isSelf = agent.AdminId === userInfo.value?.NetCashAccount?.AdminId

        if (isSingleAgent.value) {
          // 单层代理
          if (hasTeam.value && isMainLine.value) {
            // 团队主线
            if (isSelf) {
              agentLevel = '(主线)'
            } else {
              // 副线：不显示层级标签
              agentLevel = ''
            }
          } else {
            // 无团队的单层代理 或 团队副线：不显示层级
            agentLevel = ''
          }
        } else {
          // 多层代理：显示层级
          agentLevel = `${numberToChinese(agent.AccountLevel)}级代理`
        }
      }
    }

    currentAgentDetail.value = {
      // 历史模式显示当前选中的代理名称与层级
      username: agentName,
      level: agentLevel,
      totalProfit: agent.totalProfit,
      betUserCount: historyData.SumTransBetNum1 || 0,
      betAmount: agent.betAmount,
      profitMargin: agent.profitMargin,
      firstDepositCount: agent.firstDepositCount,
      conversionRate: agent.conversionRate,
      registerCount: agent.registerCount,
      loginCount: historyData.SumLogin || 0,
      firstDepositAmount: (historyData.SumFirstPayMoney || 0) / 100,
      avgFirstDeposit: avgFirstDeposit,
      depositCount: historyData.SumPayMergerNum || 0,
      depositAmount: (historyData.SumPayMergerMoney || 0) / 100,
      withdrawCount: historyData.SumWithdrawNum || 0,
      withdrawAmount: (historyData.SumWithdrawMoney || 0) / 100,
      winLossAdjustment: (historyData.SumAccountChangeSumNum || 0) / 100,
      bonus: (historyData.SumRedSumNum || 0) / 100,
      rebate: (historyData.SumBetWaterMoney || 0) / 100,
      agentCommission: (historyData.SumAgentCommissionSumNum || 0) / 100,
      date: historyData.ReportMonth || historyData.ReportDay || '-'
    }
  }

  showDetailSheet.value = true
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
          v-if="!isHistoryMode && (agentType === 'single_team_main' || agentType === 'multi')"
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
          v-else-if="isHistoryMode"
          class="shadow-sm"
          title="历史数据"
          :show-report-tabs="true"
          v-model:report-type="reportType"
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
      <div v-if="showFilters">
        <!-- 占位元素（fixed 时避免内容跳动） -->
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }"></div>
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
          <!-- 实时模式：代理账号搜索 -->
          <SearchBar
            v-if="!isHistoryMode"
            v-model:selected="selectedRealtimeAgent"
            :search-ls="realtimeAgentListOptions"
            placeholder="代理账号"
          />
          <!-- 历史模式：代理账号筛选（多层代理和单层团队主线显示） -->
          <SearchBar
            v-if="isHistoryMode && (agentType === 'multi' || agentType === 'single_team_main')"
            v-model:selected="selectedAgent"
            :search-ls="agentListOptions"
            placeholder="代理账号"
          />
          <!-- 筛选条件行 -->
          <div class="filter-scroll-container">
            <!-- 实时模式：层级筛选 -->
            <div v-if="agentType === 'multi' && !isHistoryMode" class="filter-dropdown">
              <Dropdown
                v-model="selectedLevel"
                :options="levelFilterOptions"
                height="1.5rem"
              />
            </div>
            <!-- 实时模式：排序方式 -->
            <div v-if="!isHistoryMode" class="filter-dropdown">
              <Dropdown
                v-model="sortType"
                :options="sortOptions"
                height="1.5rem"
              />
            </div>
            <!-- 历史模式：统计时间筛选（僅日報顯示） -->
            <TimeFilterDropdown
              v-if="isHistoryMode && reportType === 1"
              v-model="selectTimeRange"
              title="统计时间"
              height="1.5rem"
              :options="historyTimeRangeOptions"
              :maxDate="new Date(dayjs().subtract(1, 'day').toDate())"
            />
            <!-- 历史模式：产品包筛选 -->
            <div v-if="isHistoryMode" class="filter-dropdown">
              <Dropdown
                v-model="selectedProduct"
                :options="productOptions"
                height="1.5rem"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义时间选择器（TimeFilterDropdown 内部会使用） -->
      <van-calendar
        v-model:show="showDatePicker"
        type="range"
        :min-date="new Date(dayjs().subtract(180, 'day').toDate())"
        :max-date="new Date(dayjs().subtract(1, 'day').toDate())"
        :show-confirm="true"
        confirm-text="确定"
        confirm-disabled-text="日期超出范围"
        @confirm="onConfirmDateRange"
      />

      <!-- 代理列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :error="error"
        error-text="请求失败"
        @load="onLoad"
        :class="{ 'hide-list-loading': refreshing }"
        :style="agentList.length === 0 ? { height: 'calc(100vh - 450px)', display: 'flex'} : {}"
      >
        <div v-if="agentList.length > 0" class="agent-list-container">
          <AgentCard
            v-for="(agent, index) in agentList"
            :key="index"
            :agent="agent"
            :is-history-mode="isHistoryMode"
            @click="handleAgentClick(agent)"
          />
        </div>
        <div
          v-else-if="finished || refreshing"
          class="flex flex-1 w-full items-center justify-center"
        >
          <empty />
        </div>
      </van-list>
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
