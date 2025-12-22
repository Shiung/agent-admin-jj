<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MultiLayerCommissionData, SingleLayerCommissionData } from '@/apis/codegen/data-contracts'
import { formatNumberWithCommas as formatNumber, formatMoneyWithCommas, formatSignedMoneyWithCommas as formatSignedMoney } from '@/utils/formatNumber'
import AdjustCommissionSheet from './adjustCommissionSheet.vue'
import dayjs from 'dayjs'
import api from '@/apis'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { isSingleAgent, userInfo } = storeToRefs(userStore)
interface Props {
  viewType: number
  selectedDate: string // 格式: 'YYYY-MM'
  commissionData: {
    currentMonth: MultiLayerCommissionData | SingleLayerCommissionData
    lastMonth: MultiLayerCommissionData | SingleLayerCommissionData
  } | null
  subordinateAgentList: any[] // 下级代理列表数据
  teamAgentList: any[] // 团队成员列表数据
  loadingPersonalData: boolean // 个人数据加载状态
  loadingSubordinateList: boolean // 下级列表加载状态
  loadingTeamList: boolean // 团队列表加载状态
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: [] // 刷新下级列表数据
  refreshCommission: [] // 刷新个人佣金数据
}>()

// 详情数据接口
interface AgentDetailData {
  account: string
  label: string
  viewType: number // 记录从哪个视图打开（0:个人, 1:团队, 2:下级）
  basicInfo: {
    payableCommission: { lastMonth: number; currentMonth: number } // 应发佣金
    paidCommission: { lastMonth: number; currentMonth: number } // 已发佣金
    activeUsers: { lastMonth: number; currentMonth: number }
    commissionRate: { lastMonth: string; currentMonth: string }
  }
  detailInfo: {
    memberCommission: { lastMonth: number; currentMonth: number }
    netProfit: { lastMonth: number; currentMonth: number }
    totalProfit: { lastMonth: number; currentMonth: number }
    winLossAdjustment: { lastMonth: number; currentMonth: number }
    venueFee: { lastMonth: number; currentMonth: number }
    depositWithdrawalFee: { lastMonth: number; currentMonth: number }
    rebate: { lastMonth: number; currentMonth: number }
    bonus: { lastMonth: number; currentMonth: number }
    previousBalance: { lastMonth: number; currentMonth: number }
    depositRebate: { lastMonth: number; currentMonth: number }
    rebateRate: { lastMonth: string; currentMonth: string }
    subordinateContribution: { lastMonth: number; currentMonth: number }
  }
  releaseDate: string
}

// 个人视图数据接口
interface PersonalData {
  card1: {
    commissionRate: { lastMonth: string; currentMonth: string }
    netProfit: { lastMonth: number; currentMonth: number }
    totalProfit: { lastMonth: number; currentMonth: number }
    currentBalance: { lastMonth: number; currentMonth: number }
    subordinateContribution: { lastMonth: number; currentMonth: number }
    depositRebate: { lastMonth: number; currentMonth: number }
  }
  card2: {
    winLossAdjustment: { lastMonth: number; currentMonth: number }
    venueFee: { lastMonth: number; currentMonth: number }
    depositWithdrawalFee: { lastMonth: number; currentMonth: number }
    rebate: { lastMonth: number; currentMonth: number }
    bonus: { lastMonth: number; currentMonth: number }
    previousBalance: { lastMonth: number; currentMonth: number }
  }
}

// 代理数据接口定义
interface AgentData {
  id: string
  dataId?: number // 原始数字 ID（用于 API 调用）
  account: string
  label: string // 主线 / 一级代理

  // 团队视图简化数据（只有当月）
  commission?: number // 当期佣金
  activeUsers?: number | { lastMonth: number; currentMonth: number } // 活跃会员（可以是单值或对象）
  commissionRate?: string | null | { lastMonth: string | null; currentMonth: string | null } // 佣金比例（可以是单值或对象）
  isMainAgent?: boolean // 是否为主线代理
  fullData?: { // 保存完整的原始数据用于详情弹窗
    currentMonth: any
    lastMonth: any
  }

  // 下级视图完整数据（包含上月和本月）
  payableCommission?: { // 应发佣金
    lastMonth: number
    currentMonth: number
  }
  paidCommission?: { // 已发佣金
    lastMonth: number
    currentMonth: number
  }

  // 新增 PM 规则相关字段
  SendType?: number // 佣金类型: 1=云平台发放,2=代理后台发放
  IsSettlement?: number // 佣金发放状态(-1:未发放 0:全部 1:已发放 2:已拒绝)

  // 个人视图数据
  personalView?: {
    commissionRatePersonal: {
      lastMonth: string
      currentMonth: string
    }
    netProfit: {
      lastMonth: number
      currentMonth: number
    }
    totalProfit: {
      lastMonth: number
      currentMonth: number
    }
    currentBalance: {
      lastMonth: number
      currentMonth: number
    }
    subordinateContribution: {
      lastMonth: number
      currentMonth: number
    }
    depositRebate: {
      lastMonth: number
      currentMonth: number
    }
  }

  releaseDate: string // 发放时间
  modifyTime?: string // 修改时间（下级视图使用）
  isReleased?: boolean // 是否已发放（下级视图使用）
  SettlementTime?: number // 结算时间，用于判断是否可操作
}

const sendCommissionType = computed(() => {
  return Number(userInfo.value?.NetCashAccount?.SendCommissionType ?? 0)
})

// 将代理层级数字映射为标签
const getAgentLevelLabel = (level: number): string => {
  const labels: Record<number, string> = {
    1: '一级代理',
    2: '二级代理',
    3: '三级代理',
    4: '四级代理',
    5: '五级代理',
    6: '六级代理',
    7: '七级代理',
    8: '八级代理',
    9: '九级代理',
    10: '十级代理'
  }
  return labels[level] || `${level}级代理`
}

// 下级代理列表（从 API 数据映射）
const agentList = computed<AgentData[]>(() => {
  // 下级视图：使用真实的 subordinateAgentList 数据
  if (props.viewType === 2 && props.subordinateAgentList) {
    return props.subordinateAgentList.map((item: any) => {
      const currentMonth = item.CurrentMonth || {}
      const lastMonth = item.LastMonth || {}

      return {
        id: currentMonth.Username || currentMonth.Id?.toString() || '',
        dataId: currentMonth.Id, // 保存原始数字 ID
        account: currentMonth.Username || '',
        label: getAgentLevelLabel(currentMonth.AccountLevel || 0),
        // 应发佣金
        payableCommission: {
          lastMonth: lastMonth.CommissionChangeAfter || 0,
          currentMonth: currentMonth.CommissionChangeAfter || 0,
        },
        // 已发佣金（根据发放状态判断）
        paidCommission: {
          lastMonth: lastMonth.IsSettlement === 1 ? (lastMonth.ActualCommissionChangeAfter || lastMonth.ActualCommissionTotal || 0) : 0,
          currentMonth: currentMonth.IsSettlement === 1 ? (currentMonth.ActualCommissionChangeAfter || currentMonth.ActualCommissionTotal || 0) : 0,
        },
        activeUsers: {
          lastMonth: lastMonth.ActivityUserNum || 0,
          currentMonth: currentMonth.ActivityUserNum || 0,
        },
        commissionRate: {
          lastMonth: lastMonth.CommissionRate ? formatCommissionRate(lastMonth.CommissionRate) : null,
          currentMonth: currentMonth.CommissionRate ? formatCommissionRate(currentMonth.CommissionRate) : null,
        },
        releaseDate: currentMonth.SettlementTime && currentMonth.SettlementTime !== 0
          ? dayjs.unix(currentMonth.SettlementTime).format('YYYY-MM-DD')
          : '尚未发放',
        modifyTime: currentMonth.UpdateTime && currentMonth.UpdateTime !== 0
          ? dayjs.unix(currentMonth.UpdateTime).format('YYYY-MM-DD HH:mm')
          : undefined,
        isReleased: currentMonth.IsSettlement === 1,
        // 新增字段
        SendType: currentMonth.SendType,
        IsSettlement: currentMonth.IsSettlement,
        SettlementTime: currentMonth.SettlementTime, // 新增字段
        // 保存完整数据用于详情弹窗
        fullData: {
          currentMonth,
          lastMonth
        }
      }
    })
  }

  // 团队视图：使用真实的 teamAgentList 数据
  if (props.viewType === 1 && props.teamAgentList) {
    return props.teamAgentList.map((item: any) => {
      const currentMonth = item.CurrentMonth || {}
      const lastMonth = item.LastMonth || {}

      const isMainAgent = currentMonth.IsMain === 1
      return {
        id: currentMonth.Username || currentMonth.Id?.toString() || '',
        account: currentMonth.Username || '',
        label: isMainAgent ? '主线' : '', // 主线代理会提示"主线"
        isMainAgent,
        // 当期佣金（单层代理使用CommissionTotal）
        commission: currentMonth.CommissionTotal || 0,
        // 活跃会员
        activeUsers: currentMonth.ActivityUserNum || 0,
        // 佣金比例
        commissionRate: currentMonth.CommissionRate ? formatCommissionRate(currentMonth.CommissionRate) : null,
        // 发放时间（团队视图使用空字符串，因为团队视图不显示发放时间）
        releaseDate: '',
        // 保存完整数据用于详情弹窗
        fullData: {
          currentMonth,
          lastMonth
        }
      }
    })
  }

  // 其他：返回空数组
  return []
})

// 格式化佣金比例（"5500" -> "55%"，去除尾数0）
const formatCommissionRate = (rate: string | number): string => {
  const numRate = typeof rate === 'string' ? parseFloat(rate) : rate
  if (isNaN(numRate)) return '-'
  return isSingleAgent.value ? `${formatNumber(numRate, 2)}%` : `${formatNumber(numRate / 100, 2)}%`
}

// 格式化发放时间（从当月数据获取）
const releaseDate = computed(() => {
  if (!props.commissionData || !props.commissionData.currentMonth) return '尚未发放'

  const settlementTime = props.commissionData.currentMonth.SettlementTime

  // SettlementTime 为 0 或未定义表示尚未发放
  if (!settlementTime || settlementTime === 0) {
    return '尚未发放'
  }

  // 已发放：格式化为 YYYY-MM-DD
  return dayjs.unix(settlementTime).format('YYYY-MM-DD')
})

// 个人视图数据（从 props.commissionData 计算得出）
const personalData = computed<PersonalData>(() => {
  if (!props.commissionData) {
    return {
      card1: {
        commissionRate: { lastMonth: '-', currentMonth: '-' },
        netProfit: { lastMonth: 0, currentMonth: 0 },
        totalProfit: { lastMonth: 0, currentMonth: 0 },
        currentBalance: { lastMonth: 0, currentMonth: 0 },
        subordinateContribution: { lastMonth: 0, currentMonth: 0 },
        depositRebate: { lastMonth: 0, currentMonth: 0 },
      },
      card2: {
        winLossAdjustment: { lastMonth: 0, currentMonth: 0 },
        venueFee: { lastMonth: 0, currentMonth: 0 },
        depositWithdrawalFee: { lastMonth: 0, currentMonth: 0 },
        rebate: { lastMonth: 0, currentMonth: 0 },
        bonus: { lastMonth: 0, currentMonth: 0 },
        previousBalance: { lastMonth: 0, currentMonth: 0 },
      },
    }
  }

  const currentMonth = props.commissionData.currentMonth || {}
  const lastMonth = props.commissionData.lastMonth || {}

  return {
    card1: {
      commissionRate: {
        lastMonth: formatCommissionRate(lastMonth.CommissionRate || 0),
        currentMonth: formatCommissionRate(currentMonth.CommissionRate || 0),
      },
      netProfit: {
        lastMonth: lastMonth.CleanBetWinTotal || 0,
        currentMonth: currentMonth.CleanBetWinTotal || 0,
      },
      totalProfit: {
        lastMonth: (lastMonth.BetGold || 0) - (lastMonth.WinGold || 0),
        currentMonth: (currentMonth.BetGold || 0) - (currentMonth.WinGold || 0),
      },
      currentBalance: {
        lastMonth: lastMonth.RealCleanBetWinTotal || 0,
        currentMonth: currentMonth.RealCleanBetWinTotal || 0,
      },
      subordinateContribution: {
        // 单层代理没有下级贡献，使用 0
        lastMonth: 'CommissionChildTotal' in lastMonth ? (lastMonth.CommissionChildTotal || 0) : 0,
        currentMonth: 'CommissionChildTotal' in currentMonth ? (currentMonth.CommissionChildTotal || 0) : 0,
      },
      depositRebate: {
        lastMonth: lastMonth.AdminChargeMoneyFee || 0,
        currentMonth: currentMonth.AdminChargeMoneyFee || 0,
      },
    },
    card2: {
      winLossAdjustment: {
        lastMonth: lastMonth.MoneyChangeFee || 0,
        currentMonth: currentMonth.MoneyChangeFee || 0,
      },
      venueFee: {
        lastMonth: lastMonth.ApiFeeTotalFee || 0,
        currentMonth: currentMonth.ApiFeeTotalFee || 0,
      },
      depositWithdrawalFee: {
        lastMonth: (lastMonth.WithdrawMoneyFee || 0) + (lastMonth.PayMoneyFee || 0),
        currentMonth: (currentMonth.WithdrawMoneyFee || 0) + (currentMonth.PayMoneyFee || 0),
      },
      rebate: {
        lastMonth: lastMonth.BackWaterGoldFee || 0,
        currentMonth: currentMonth.BackWaterGoldFee || 0,
      },
      bonus: {
        lastMonth: lastMonth.RedGoldFee || 0,
        currentMonth: currentMonth.RedGoldFee || 0,
      },
      previousBalance: {
        lastMonth: lastMonth.LastMonthCleanBetWinTotal || 0,
        currentMonth: currentMonth.LastMonthCleanBetWinTotal || 0,
      },
    },
  }
})

// 详情弹窗状态
const showDetailPopup = ref(false)
const currentAgentDetail = ref<AgentDetailData | null>(null)

// 调整佣金弹窗状态
const showAdjustSheet = ref(false)
const currentAdjustAgent = ref<AgentData | null>(null)

// 点击代理卡片显示详情
const handleAgentClick = (agent: AgentData) => {

  // 团队视图：使用 fullData 构建详情数据
  if (props.viewType === 1 && agent.fullData) {
    const currentMonth = agent.fullData.currentMonth
    const lastMonth = agent.fullData.lastMonth

    currentAgentDetail.value = {
      account: agent.account,
      label: agent.label,
      viewType: 1, // 团队视图
      basicInfo: {
        payableCommission: {
          lastMonth: lastMonth.CommissionTotal || 0,
          currentMonth: currentMonth.CommissionTotal || 0,
        },
        paidCommission: {
          lastMonth: lastMonth.IsSettlement === 1 ? (lastMonth.CommissionChangeAfter || lastMonth.CommissionTotal || 0) : 0,
          currentMonth: currentMonth.IsSettlement === 1 ? (currentMonth.CommissionChangeAfter || currentMonth.CommissionTotal || 0) : 0,
        },
        activeUsers: {
          lastMonth: lastMonth.ActivityUserNum || 0,
          currentMonth: currentMonth.ActivityUserNum || 0,
        },
        commissionRate: {
          lastMonth: lastMonth.CommissionRate ? formatCommissionRate(lastMonth.CommissionRate) : '-',
          currentMonth: currentMonth.CommissionRate ? formatCommissionRate(currentMonth.CommissionRate) : '-',
        },
      },
      detailInfo: {
        memberCommission: {
          lastMonth: lastMonth.CommissionTotal || 0,
          currentMonth: currentMonth.CommissionTotal || 0,
        },
        netProfit: {
          lastMonth: lastMonth.CleanBetWinTotal || 0,
          currentMonth: currentMonth.CleanBetWinTotal || 0,
        },
        totalProfit: {
          lastMonth: lastMonth.WinGold || 0,
          currentMonth: currentMonth.WinGold || 0,
        },
        winLossAdjustment: {
          lastMonth: lastMonth.MoneyChangeFee || 0,
          currentMonth: currentMonth.MoneyChangeFee || 0,
        },
        venueFee: {
          lastMonth: lastMonth.ApiFeeTotalFee || 0,
          currentMonth: currentMonth.ApiFeeTotalFee || 0,
        },
        depositWithdrawalFee: {
          lastMonth: (lastMonth.PayMoneyFee || 0) + (lastMonth.WithdrawMoneyFee || 0),
          currentMonth: (currentMonth.PayMoneyFee || 0) + (currentMonth.WithdrawMoneyFee || 0),
        },
        rebate: {
          lastMonth: lastMonth.BackWaterGoldFee || 0,
          currentMonth: currentMonth.BackWaterGoldFee || 0,
        },
        bonus: {
          lastMonth: lastMonth.RedGoldFee || 0,
          currentMonth: currentMonth.RedGoldFee || 0,
        },
        previousBalance: {
          lastMonth: lastMonth.LastMonthCleanBetWinTotal || 0,
          currentMonth: currentMonth.LastMonthCleanBetWinTotal || 0,
        },
        depositRebate: {
          lastMonth: lastMonth.AdminChargeMoneyFee || 0,
          currentMonth: currentMonth.AdminChargeMoneyFee || 0,
        },
        rebateRate: {
          lastMonth: '-',
          currentMonth: '-',
        },
        subordinateContribution: {
          lastMonth: 0,
          currentMonth: 0,
        },
      },
      releaseDate: currentMonth.SettlementTime && currentMonth.SettlementTime !== 0
        ? dayjs.unix(currentMonth.SettlementTime).format('YYYY-MM-DD')
        : '尚未发放',
    }
    showDetailPopup.value = true
  }

  // 下级视图：使用 fullData 构建详情数据
  if (props.viewType === 2 && agent.fullData) {
    const currentMonth = agent.fullData.currentMonth
    const lastMonth = agent.fullData.lastMonth

    currentAgentDetail.value = {
      account: agent.account,
      label: agent.label || '',
      viewType: 2, // 下级视图
      basicInfo: {
        payableCommission: {
          lastMonth: lastMonth.CommissionChangeAfter || 0,
          currentMonth: currentMonth.CommissionChangeAfter || 0,
        },
        paidCommission: {
          lastMonth: lastMonth.IsSettlement === 1 ? (lastMonth.ActualCommissionChangeAfter || lastMonth.ActualCommissionTotal || 0) : 0,
          currentMonth: currentMonth.IsSettlement === 1 ? (currentMonth.ActualCommissionChangeAfter || currentMonth.ActualCommissionTotal || 0) : 0,
        },
        activeUsers: {
          lastMonth: lastMonth.ActivityUserNum || 0,
          currentMonth: currentMonth.ActivityUserNum || 0,
        },
        commissionRate: {
          lastMonth: lastMonth.CommissionRate ? formatCommissionRate(lastMonth.CommissionRate) : '-',
          currentMonth: currentMonth.CommissionRate ? formatCommissionRate(currentMonth.CommissionRate) : '-',
        },
      },
      detailInfo: {
        memberCommission: {
          lastMonth: isSingleAgent.value ? lastMonth.CommissionTotal : lastMonth.CommissionSelfTotal || 0,
          currentMonth: isSingleAgent.value ? currentMonth.CommissionTotal : currentMonth.CommissionSelfTotal || 0,
        },
        netProfit: {
          lastMonth: lastMonth.CleanBetWinTotal || 0,
          currentMonth: currentMonth.CleanBetWinTotal || 0,
        },
        totalProfit: {
          lastMonth: (lastMonth.BetGold || 0) - (lastMonth.WinGold || 0),
          currentMonth: (currentMonth.BetGold || 0) - (currentMonth.WinGold || 0),
        },
        winLossAdjustment: {
          lastMonth: lastMonth.MoneyChangeFee || 0,
          currentMonth: currentMonth.MoneyChangeFee || 0,
        },
        venueFee: {
          lastMonth: lastMonth.ApiFeeTotalFee || 0,
          currentMonth: currentMonth.ApiFeeTotalFee || 0,
        },
        depositWithdrawalFee: {
          lastMonth: (lastMonth.AdminChargeMoneyFee || 0) + (lastMonth.WithdrawMoneyFee || 0),
          currentMonth: (currentMonth.AdminChargeMoneyFee || 0) + (currentMonth.WithdrawMoneyFee || 0),
        },
        rebate: {
          lastMonth: lastMonth.BackWaterGoldFee || 0,
          currentMonth: currentMonth.BackWaterGoldFee || 0,
        },
        bonus: {
          lastMonth: lastMonth.RedGoldFee || 0,
          currentMonth: currentMonth.RedGoldFee || 0,
        },
        previousBalance: {
          lastMonth: lastMonth.LastMonthCleanBetWinTotal || 0,
          currentMonth: currentMonth.LastMonthCleanBetWinTotal || 0,
        },
        depositRebate: {
          lastMonth: lastMonth.RedAdminChargeCommissionGold || 0,
          currentMonth: currentMonth.RedAdminChargeCommissionGold || 0,
        },
        rebateRate: {
          lastMonth: '-',
          currentMonth: '-',
        },
        subordinateContribution: {
          lastMonth: lastMonth.CommissionChildTotal || 0,
          currentMonth: currentMonth.CommissionChildTotal || 0,
        },
      },
      releaseDate: currentMonth.SettlementTime && currentMonth.SettlementTime !== 0
        ? dayjs.unix(currentMonth.SettlementTime).format('YYYY-MM-DD')
        : '尚未发放',
    }
    showDetailPopup.value = true
  }
}

// 关闭详情弹窗
const closeDetailPopup = () => {
  showDetailPopup.value = false
}

// 调整佣金
const handleAdjust = (agent: AgentData, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡
  currentAdjustAgent.value = agent
  showAdjustSheet.value = true
}

// 确认调整佣金
const handleAdjustConfirm = (data: { adjustAmount: number; remark: string }) => {
  console.log('确认调整佣金:', {
    agent: currentAdjustAgent.value?.account,
    ...data
  })
  // API 调用已在 adjustCommissionSheet 中完成
  // 触发刷新：下级列表 + 个人佣金
  emit('refresh')
  emit('refreshCommission')
}

// 取消调整佣金
const handleAdjustCancel = () => {
  currentAdjustAgent.value = null
}

// 发放确认弹窗状态
const showReleaseConfirmPopup = ref(false)
const currentReleaseAgent = ref<{ account: string; dataId: number } | null>(null)

// 发放佣金（显示确认弹窗）
const handleReleaseCommission = (agent: AgentData, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡
  currentReleaseAgent.value = {
    account: agent.account,
    dataId: agent.dataId || 0
  }
  showReleaseConfirmPopup.value = true
}

// 取消发放
const handleReleaseCancel = () => {
  showReleaseConfirmPopup.value = false
  currentReleaseAgent.value = null
}

// 确认发放
const handleReleaseConfirm = async () => {
  if (!currentReleaseAgent.value) return

  try {
    // 显示加载提示
    showLoadingToast({
      message: '发放中...',
      forbidClick: true,
    })

    // 调用单个发放 API
    const response = await api.admin.postAgentSendCommission({
      Id: currentReleaseAgent.value.dataId,
      IsDeduct: 0, // 默认不抵扣欠款
      IsMulti: 1, // 多层单费率
    })

    // 打印响应结果
    console.log('单个发放佣金 API 响应:', response)
    console.log('响应数据:', JSON.stringify(response, null, 2))

    // 关闭加载提示
    showToast({
      message: '发放成功',
      position: 'bottom',
    })

    // 触发刷新：下级列表 + 个人佣金
    emit('refresh')
    emit('refreshCommission')
  } catch (error) {
    console.error('发放佣金失败:', error)
    showToast({
      message: `发放失败: ${error}`,
      position: 'bottom',
    })
  } finally {
    showReleaseConfirmPopup.value = false
    currentReleaseAgent.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <!-- 个人视图：两个固定卡片 -->
    <template v-if="props.viewType === 0">
      <!-- Loading 状态 -->
      <div v-if="props.loadingPersonalData" class="agent-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!props.commissionData" :style="{ minHeight: 'calc(100vh - 408px)' }" class="flex-1 flex items-center">
        <empty />
      </div>

      <!-- 数据内容 -->
      <template v-else>
        <!-- 卡片1：佣金 / 盈利总结 -->
        <div class="bg-white rounded-2xl shadow-sm">
        <div class="data-table">
          <!-- 表头 -->
          <div class="table-header">
            <div class="text-neutral-secondary text-sm">项目</div>
            <div class="text-neutral-secondary text-sm">上月</div>
            <div class="text-neutral-secondary text-sm font-semibold">本月</div>
          </div>

          <!-- 佣金比例 -->
          <div class="table-row">
            <div class="text-card">佣金比例</div>
            <div class="text-card">{{ personalData.card1.commissionRate.lastMonth }}</div>
            <div class="text-card font-semibold">{{ personalData.card1.commissionRate.currentMonth }}</div>
          </div>

          <!-- 净盈利 -->
          <div class="table-row">
            <div class="text-card">净盈利</div>
            <div class="text-card" :class="formatSignedMoney(personalData.card1.netProfit.lastMonth).color">
              {{ formatSignedMoney(personalData.card1.netProfit.lastMonth).text }}
            </div>
            <div class="text-card font-semibold" :class="formatSignedMoney(personalData.card1.netProfit.currentMonth).color">
              {{ formatSignedMoney(personalData.card1.netProfit.currentMonth).text }}
            </div>
          </div>

          <!-- 总盈利 -->
          <div class="table-row">
            <div class="text-card">总盈利</div>
            <div class="text-card" :class="formatSignedMoney(personalData.card1.totalProfit.lastMonth).color">
              {{ formatSignedMoney(personalData.card1.totalProfit.lastMonth).text }}
            </div>
            <div class="text-card font-semibold" :class="formatSignedMoney(personalData.card1.totalProfit.currentMonth).color">
              {{ formatSignedMoney(personalData.card1.totalProfit.currentMonth).text }}
            </div>
          </div>

          <!-- 当期结余 -->
          <div class="table-row">
            <div class="text-card">当期结余</div>
            <div class="text-card" :class="formatSignedMoney(personalData.card1.currentBalance.lastMonth).color">{{ formatSignedMoney(personalData.card1.currentBalance.lastMonth).text }}</div>
            <div class="text-card font-semibold" :class="formatSignedMoney(personalData.card1.currentBalance.currentMonth).color">{{ formatSignedMoney(personalData.card1.currentBalance.currentMonth).text }}</div>
          </div>

          <!-- 下级贡献 -->
          <div v-if="!isSingleAgent" class="table-row">
            <div class="text-card">下级贡献</div>
            <div class="text-card" :class="formatSignedMoney(personalData.card1.subordinateContribution.lastMonth).color">{{ formatSignedMoney(personalData.card1.subordinateContribution.lastMonth).text }}</div>
            <div class="text-card font-semibold" :class="formatSignedMoney(personalData.card1.subordinateContribution.currentMonth).color">{{ formatSignedMoney(personalData.card1.subordinateContribution.currentMonth).text }}</div>
          </div>

          <!-- 代存回馈 -->
          <div class="table-row">
            <div class="text-card">代存回馈</div>
            <div class="text-card">{{ formatMoneyWithCommas(personalData.card1.depositRebate.lastMonth) }}</div>
            <div class="text-card font-semibold">{{ formatMoneyWithCommas(personalData.card1.depositRebate.currentMonth) }}</div>
          </div>
        </div>
      </div>

      <!-- 卡片2：细项调整 / 费用 -->
      <div class="bg-white rounded-2xl shadow-sm">
        <div class="data-table">
          <!-- 表头 -->
          <div class="table-header">
            <div class="text-neutral-secondary text-sm">项目</div>
            <div class="text-neutral-secondary text-sm">上月</div>
            <div class="text-neutral-secondary text-sm font-semibold">本月</div>
          </div>

          <!-- 输赢调整 -->
          <div class="table-row">
            <div class="text-card">输赢调整</div>
            <div class="text-card">{{ formatMoneyWithCommas(personalData.card2.winLossAdjustment.lastMonth) }}</div>
            <div class="text-card font-semibold">{{ formatMoneyWithCommas(personalData.card2.winLossAdjustment.currentMonth) }}</div>
          </div>

          <!-- 场馆费 -->
          <div class="table-row">
            <div class="text-card">场馆费</div>
            <div class="text-card">{{ formatMoneyWithCommas(personalData.card2.venueFee.lastMonth) }}</div>
            <div class="text-card font-semibold">{{ formatMoneyWithCommas(personalData.card2.venueFee.currentMonth) }}</div>
          </div>

          <!-- 存提手续费 -->
          <div class="table-row">
            <div class="text-card">存提手续费</div>
            <div class="text-card">{{ formatMoneyWithCommas(personalData.card2.depositWithdrawalFee.lastMonth) }}</div>
            <div class="text-card font-semibold">{{ formatMoneyWithCommas(personalData.card2.depositWithdrawalFee.currentMonth) }}</div>
          </div>

          <!-- 返水 -->
          <div class="table-row">
            <div class="text-card">返水</div>
            <div class="text-card">{{ formatMoneyWithCommas(personalData.card2.rebate.lastMonth) }}</div>
            <div class="text-card font-semibold">{{ formatMoneyWithCommas(personalData.card2.rebate.currentMonth) }}</div>
          </div>

          <!-- 红利 -->
          <div class="table-row">
            <div class="text-card">红利</div>
            <div class="text-card">{{ formatMoneyWithCommas(personalData.card2.bonus.lastMonth) }}</div>
            <div class="text-card font-semibold">{{ formatMoneyWithCommas(personalData.card2.bonus.currentMonth) }}</div>
          </div>

          <!-- 上期结余 -->
          <div class="table-row">
            <div class="text-card">上期结余</div>
            <div class="text-card" :class="formatSignedMoney(personalData.card2.previousBalance.lastMonth).color">
              {{ formatSignedMoney(personalData.card2.previousBalance.lastMonth).text }}
            </div>
            <div class="text-card font-semibold" :class="formatSignedMoney(personalData.card2.previousBalance.currentMonth).color">
              {{ formatSignedMoney(personalData.card2.previousBalance.currentMonth).text }}
            </div>
          </div>
        </div>
      </div>
      </template>
    </template>

    <!-- 团队/下级视图：代理列表（使用 van-cell-group） -->
    <template v-else>
      <!-- Loading 状态（下级视图） -->
      <div v-if="props.viewType === 2 && props.loadingSubordinateList" class="agent-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- Loading 状态（团队视图） -->
      <div v-else-if="props.viewType === 1 && props.loadingTeamList" class="agent-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态（下级视图） -->
      <div v-else-if="props.viewType === 2 && agentList.length === 0" class="flex-1 flex items-center">
        <empty />
      </div>

      <!-- 空状态（团队视图） -->
      <div v-else-if="props.viewType === 1 && agentList.length === 0" class="flex-1 flex items-center">
        <empty />
      </div>

      <!-- 团队视图：简化卡片（只显示当月数据） -->
      <template v-if="props.viewType === 1">
        <van-cell-group
          v-for="agent in agentList"
          :key="agent.id"
          :border="false"
          class="agent-card"
          @click="handleAgentClick(agent)"
        >
          <!-- 代理账号 + 标签（作为第一行） -->
          <div class="agent-card-header">
            <div class="flex items-center gap-1">
              <span class="text-neutral-basic text-base font-semibold">{{ agent.account }}</span>
              <span v-if="agent.label" class="text-neutral-secondary text-xs px-2 py-0.5">{{ agent.label }}</span>
            </div>
            <!-- 显示箭头 -->
            <van-icon name="arrow" size="16" color="var(--color-neutral-secondary)" />
          </div>

          <!-- 数据表头（单列） -->
          <div class="table-header team-simple-header">
            <div class="text-neutral-secondary text-sm">项目</div>
            <div class="text-neutral-secondary text-sm font-semibold">本月</div>
          </div>

          <!-- 当期佣金 -->
          <van-cell :border="true" class="data-cell">
            <template #title>
              <div class="team-simple-grid">
                <div class="team-text-card">当期佣金</div>
                <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(agent.commission || 0) }}</div>
              </div>
            </template>
          </van-cell>

          <!-- 活跃会员 -->
          <van-cell :border="true" class="data-cell">
            <template #title>
              <div class="team-simple-grid">
                <div class="team-text-card">活跃会员</div>
                <div class="team-text-card font-semibold">{{ agent.activeUsers }}</div>
              </div>
            </template>
          </van-cell>

          <!-- 佣金比例 -->
          <van-cell :border="false" class="data-cell">
            <template #title>
              <div class="team-simple-grid">
                <div class="team-text-card">佣金比例</div>
                <div class="team-text-card font-semibold">{{ agent.commissionRate || '-' }}</div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </template>

      <!-- 下级视图：完整卡片（显示上月/本月对比） -->
      <template v-else-if="props.viewType === 2">
        <van-cell-group
          v-for="agent in agentList"
          :key="agent.id"
          :border="false"
          class="agent-card"
          @click="handleAgentClick(agent)"
        >
          <!-- 代理账号 + 标签（作为第一行） -->
          <div class="agent-card-header">
            <div class="flex items-center gap-1">
              <span class="text-neutral-basic text-base font-semibold">{{ agent.account }}</span>
              <span class="text-neutral-secondary text-xs px-2 py-0.5">{{ agent.label }}</span>
            </div>
            <!-- 显示箭头 -->
            <van-icon name="arrow" size="16" color="var(--color-neutral-secondary)" />
          </div>

          <!-- 数据表头（不使用 van-cell，自定义样式） -->
          <div class="table-header team-header-override">
            <div class="text-neutral-secondary text-sm">项目</div>
            <div class="text-neutral-secondary text-sm">上月</div>
            <div class="text-neutral-secondary text-sm font-semibold">本月</div>
          </div>

          <!-- 应发佣金（使用 van-cell） -->
          <van-cell :border="true" class="data-cell">
            <template #title>
              <div class="cell-grid">
                <div class="team-text-card">应发佣金</div>
                <div class="team-text-card">{{ formatMoneyWithCommas(agent.payableCommission?.lastMonth || 0) }}</div>
                <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(agent.payableCommission?.currentMonth || 0) }}</div>
              </div>
            </template>
          </van-cell>

          <!-- 已发佣金（使用 van-cell） -->
          <van-cell :border="true" class="data-cell">
            <template #title>
              <div class="cell-grid">
                <div class="team-text-card">已发佣金</div>
                <div class="team-text-card">{{ formatMoneyWithCommas(agent.paidCommission?.lastMonth || 0) }}</div>
                <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(agent.paidCommission?.currentMonth || 0) }}</div>
              </div>
            </template>
          </van-cell>

          <!-- 活跃会员 -->
          <van-cell :border="true" class="data-cell">
            <template #title>
              <div class="cell-grid">
                <div class="team-text-card">活跃会员</div>
                <div class="team-text-card">{{ typeof agent.activeUsers === 'object' ? agent.activeUsers?.lastMonth : '-' }}</div>
                <div class="team-text-card font-semibold">{{ typeof agent.activeUsers === 'object' ? agent.activeUsers?.currentMonth : agent.activeUsers }}</div>
              </div>
            </template>
          </van-cell>

          <!-- 佣金比例 -->
          <van-cell :border="true" class="data-cell">
            <template #title>
              <div class="cell-grid">
                <div class="team-text-card">佣金比例</div>
                <div class="team-text-card">{{ typeof agent.commissionRate === 'object' ? (agent.commissionRate?.lastMonth || '-') : '-' }}</div>
                <div class="team-text-card font-semibold">{{ typeof agent.commissionRate === 'object' ? (agent.commissionRate?.currentMonth || '-') : (agent.commissionRate || '-') }}</div>
              </div>
            </template>
          </van-cell>

          <!-- 修改时间（仅下级视图显示） -->
          <van-cell
            :border="false"
            class="data-cell modify-cell"
          >
            <template #title>
              <div class="modify-time-grid">
                <div class="modify-time">修改时间:</div>
                <div class="modify-time">{{ agent.modifyTime || '无' }}</div>
                <!-- 下级视图：显示发放状态/按钮 -->
                <div class="flex items-center gap-2 justify-end">
                  <template v-if="agent.isReleased">
                    <span class="released-tag">已发放</span>
                  </template>
                  <template v-else-if="!agent.isReleased && agent.SendType === 2 && sendCommissionType === 1">
                    <button
                      class="action-btn adjust-btn"
                      @click="handleAdjust(agent, $event)"
                    >调整</button>
                    <button
                      class="action-btn release-btn"
                      :disabled="props.commissionData?.currentMonth?.IsSettlement === -1 && props.commissionData?.currentMonth?.SettlementTime === 0"
                      @click="handleReleaseCommission(agent, $event)"
                    >发放</button>
                  </template>
                  <template v-else>
                    <span class="not-released-tag">未发放</span>
                  </template>
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </template>
    </template>

    <!-- 发放时间分隔线（在整个列表最下方） -->
    <div v-if="props.viewType === 0 && props.commissionData && !props.loadingPersonalData" class="flex items-center gap-3 mt-4 px-1">
      <div class="flex-1 h-px divider-line"></div>
      <span class="release-date-text">发放时间：{{ releaseDate }}</span>
      <div class="flex-1 h-px divider-line"></div>
    </div>

    <!-- 底部占位空间（防止被悬浮按钮遮挡） -->
    <div class="h-8"></div>

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :overlay="true"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
      :close-on-click-overlay="true"
      :safe-area-inset-bottom="true"
      :style="{ height: '90%' }"
      teleport="body"
      :z-index="9999"
    >
      <div v-if="currentAgentDetail" class="detail-popup">
        <!-- 顶部指示器 -->
        <div class="popup-indicator"></div>

        <!-- 标题栏 -->
        <div class="popup-header">
          <h3 class="popup-title">详情</h3>
          <button @click="closeDetailPopup" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- 内容区域（可滚动） -->
        <div class="popup-content">
          <!-- 代理信息 -->
          <div class="agent-info">
            <span class="agent-account">{{ currentAgentDetail.account }}</span>
            <span class="agent-label">{{ currentAgentDetail.label }}</span>
          </div>

          <!-- 基础信息卡片 -->
          <div class="detail-card">
            <div class="table-header team-header-override">
              <div class="text-neutral-secondary text-sm">项目</div>
              <div class="text-neutral-secondary text-sm">上月</div>
              <div class="text-neutral-secondary text-sm font-semibold">本月</div>
            </div>

            <!-- 团队视图：当期佣金 -->
            <div v-if="currentAgentDetail.viewType === 1" class="team-table-row">
              <div class="team-text-card">当期佣金</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.basicInfo.payableCommission.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.basicInfo.payableCommission.currentMonth) }}</div>
            </div>

            <!-- 下级视图：应发佣金 -->
            <div v-if="currentAgentDetail.viewType === 2" class="team-table-row">
              <div class="team-text-card">应发佣金</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.basicInfo.payableCommission.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.basicInfo.payableCommission.currentMonth) }}</div>
            </div>

            <!-- 下级视图：已发佣金 -->
            <div v-if="currentAgentDetail.viewType === 2" class="team-table-row">
              <div class="team-text-card">已发佣金</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.basicInfo.paidCommission.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.basicInfo.paidCommission.currentMonth) }}</div>
            </div>

            <!-- 活跃会员 -->
            <div class="team-table-row">
              <div class="team-text-card">活跃会员</div>
              <div class="team-text-card">{{ currentAgentDetail.basicInfo.activeUsers.lastMonth }}</div>
              <div class="team-text-card font-semibold">{{ currentAgentDetail.basicInfo.activeUsers.currentMonth }}</div>
            </div>

            <!-- 佣金比例 -->
            <div class="team-table-row">
              <div class="team-text-card">佣金比例</div>
              <div class="team-text-card">{{ currentAgentDetail.basicInfo.commissionRate.lastMonth }}</div>
              <div class="team-text-card font-semibold">{{ currentAgentDetail.basicInfo.commissionRate.currentMonth }}</div>
            </div>
          </div>

          <!-- 佣金明细卡片 -->
          <div class="detail-card">
            <div class="table-header team-header-override">
              <div class="text-neutral-secondary text-sm">佣金明细</div>
              <div class="text-neutral-secondary text-sm">上月</div>
              <div class="text-neutral-secondary text-sm font-semibold">本月</div>
            </div>

            <!-- 会员佣金(仅下级视图显示) -->
            <div v-if="currentAgentDetail.viewType === 2" class="team-table-row">
              <div class="team-text-card">会员佣金</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.memberCommission.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.memberCommission.currentMonth) }}</div>
            </div>

            <!-- 净盈利 -->
            <div class="team-table-row">
              <div class="team-text-card">净盈利</div>
              <div class="team-text-card" :class="formatSignedMoney(currentAgentDetail.detailInfo.netProfit.lastMonth).color">
                {{ formatSignedMoney(currentAgentDetail.detailInfo.netProfit.lastMonth).text }}
              </div>
              <div class="team-text-card font-semibold" :class="formatSignedMoney(currentAgentDetail.detailInfo.netProfit.currentMonth).color">
                {{ formatSignedMoney(currentAgentDetail.detailInfo.netProfit.currentMonth).text }}
              </div>
            </div>

            <!-- 总盈利 -->
            <div class="team-table-row">
              <div class="team-text-card">总盈利</div>
              <div class="team-text-card" :class="formatSignedMoney(currentAgentDetail.detailInfo.totalProfit.lastMonth).color">
                {{ formatSignedMoney(currentAgentDetail.detailInfo.totalProfit.lastMonth).text }}
              </div>
              <div class="team-text-card font-semibold" :class="formatSignedMoney(currentAgentDetail.detailInfo.totalProfit.currentMonth).color">
                {{ formatSignedMoney(currentAgentDetail.detailInfo.totalProfit.currentMonth).text }}
              </div>
            </div>

            <!-- 输赢调整 -->
            <div class="team-table-row">
              <div class="team-text-card">输赢调整</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.winLossAdjustment.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.winLossAdjustment.currentMonth) }}</div>
            </div>

            <!-- 场馆费 -->
            <div class="team-table-row">
              <div class="team-text-card">场馆费</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.venueFee.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.venueFee.currentMonth) }}</div>
            </div>

            <!-- 存提手续费 -->
            <div class="team-table-row">
              <div class="team-text-card">存提手续费</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.depositWithdrawalFee.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.depositWithdrawalFee.currentMonth) }}</div>
            </div>

            <!-- 返水 -->
            <div class="team-table-row">
              <div class="team-text-card">返水</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.rebate.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.rebate.currentMonth) }}</div>
            </div>

            <!-- 红利 -->
            <div class="team-table-row">
              <div class="team-text-card">红利</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.bonus.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.bonus.currentMonth) }}</div>
            </div>

            <!-- 上期结余 -->
            <div class="team-table-row">
              <div class="team-text-card">上期结余</div>
              <div class="team-text-card" :class="formatSignedMoney(currentAgentDetail.detailInfo.previousBalance.lastMonth).color">
                {{ formatSignedMoney(currentAgentDetail.detailInfo.previousBalance.lastMonth).text }}
              </div>
              <div class="team-text-card font-semibold" :class="formatSignedMoney(currentAgentDetail.detailInfo.previousBalance.currentMonth).color">
                {{ formatSignedMoney(currentAgentDetail.detailInfo.previousBalance.currentMonth).text }}
              </div>
            </div>

            <!-- 代存回馈 -->
            <div class="team-table-row">
              <div class="team-text-card">代存回馈</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.depositRebate.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.depositRebate.currentMonth) }}</div>
            </div>

            <!-- 回馈比例 -->
            <div class="team-table-row">
              <div class="team-text-card">回馈比例</div>
              <div class="team-text-card">{{ currentAgentDetail.detailInfo.rebateRate.lastMonth }}</div>
              <div class="team-text-card font-semibold">{{ currentAgentDetail.detailInfo.rebateRate.currentMonth }}</div>
            </div>

            <!-- 下级贡献（仅下级视图显示） -->
            <div v-if="currentAgentDetail.viewType === 2" class="team-table-row">
              <div class="team-text-card">下级贡献</div>
              <div class="team-text-card">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.subordinateContribution.lastMonth) }}</div>
              <div class="team-text-card font-semibold">{{ formatMoneyWithCommas(currentAgentDetail.detailInfo.subordinateContribution.currentMonth) }}</div>
            </div>
          </div>

          <!-- 发放时间 -->
          <div class="flex items-center gap-3 mt-4 mb-6">
            <div class="flex-1 h-px divider-line"></div>
            <span class="release-date-text">发放时间：{{ currentAgentDetail.releaseDate }}</span>
            <div class="flex-1 h-px divider-line"></div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 调整佣金弹窗 -->
    <AdjustCommissionSheet
      v-model:show="showAdjustSheet"
      :agent-account="currentAdjustAgent?.account || ''"
      :payable-amount="currentAdjustAgent?.payableCommission?.currentMonth || 0"
      :data-id="currentAdjustAgent?.dataId || 0"
      :is-multi="1"
      @confirm="handleAdjustConfirm"
      @cancel="handleAdjustCancel"
    />

    <!-- 发放确认弹窗 -->
    <van-popup
      v-model:show="showReleaseConfirmPopup"
      position="center"
      round
      :overlay="true"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
      :style="{ width: '85%', maxWidth: '400px' }"
    >
      <div class="confirm-dialog">
        <!-- 标题 -->
        <h3 class="dialog-title">发放确认</h3>

        <!-- 分隔线 -->
        <div class="dialog-divider"></div>

        <!-- 内容 -->
        <div class="dialog-content">
          是否发放佣金给{{ currentReleaseAgent?.account }}?
        </div>

        <!-- 按钮组 -->
        <div class="dialog-footer">
          <button class="dialog-btn cancel-btn" @click="handleReleaseCancel">取消</button>
          <button class="dialog-btn confirm-btn" @click="handleReleaseConfirm">确认</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.shadow-sm {
  box-shadow: -0.5px 0.5px 3px 0px rgba(0, 0, 0, 0.15);
}

/* 数据表格容器 */
.data-table {
  display: flex;
  flex-direction: column;
}

/* 个人视图表头样式 */
.table-header {
  display: grid;
  grid-template-columns: 1fr 80px 80px; /* 与 table-row 一致 */
  align-items: center;
  background-color: #F8FAFD;
  padding: 6px 16px;
  border-radius: 16px 16px 0 0;
  margin-bottom: 0;
  gap: 16px;
}

/* 表头文字对齐 */
.table-header > div:first-child {
  text-align: left;
}

.table-header > div:nth-child(2),
.table-header > div:nth-child(3) {
  text-align: right;
}

/* 团队/下级视图表头覆盖样式（在 van-cell-group 中） */
.team-header-override {
  border-radius: 0;
  margin: 0;
}

/* 团队视图简化表头（只有项目和本月两列） */
.team-simple-header {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列等宽 */
  padding: 8px 16px;
  background-color: #F8FAFD;
  border-radius: 0;
  margin: 0;
}

/* 团队视图简化数据网格（两列） */
.team-simple-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列等宽 */
  align-items: center;
  gap: 16px;
}

/* 个人视图表格行样式 */
.table-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px; /* 右两栏固定宽度 */
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
  position: relative;
}

/* 使用伪元素创建带左右间距的分隔线 */
.table-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background-color: var(--color-neutral2-sixth);
}

.table-row:last-child::after {
  display: none;
}

/* 个人视图卡片文字样式 */
.text-card {
  font-size: 14px;
  font-weight: 400;
  font-variant-numeric: tabular-nums; /* 等宽数字，垂直对齐 */
}

/* 默认颜色（没有动态颜色类时使用） */
.text-card:not(.text-error-normal):not(.text-success-normal):not(.text-neutral2-basic) {
  color: var(--color-text-neutral-basic);
}

.text-card.font-semibold {
  font-weight: 600;
}

/* 左侧标题列 */
.text-card:first-child {
  text-align: left;
}

/* 中间列（上月）对齐 */
.text-card:nth-child(2) {
  text-align: right;
}

/* 右侧列（本月）对齐 */
.text-card:nth-child(3) {
  text-align: right;
}

/* van-cell-group 代理卡片样式 */
.agent-card {
  background-color: white;
  border-radius: 16px;
  border: 1px solid var(--color-neutral2-sixth);
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
}

/* 移除 van-cell-group 默认样式 */
.agent-card :deep(.van-cell-group__title) {
  padding: 0;
  margin: 0;
}

.agent-card :deep(.van-cell) {
  padding: 0;
  background-color: white;
}

.agent-card :deep(.van-cell::after) {
  left: 16px;
  right: 16px;
}

/* 代理卡片头部 */
.agent-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  background-color: white;
}

/* van-cell 数据单元格样式 */
.data-cell {
  padding: 0 !important;
}

.data-cell :deep(.van-cell__title) {
  padding: 12px 16px;
}

/* 修改时间单元格：移除默认 padding，让内部 grid 控制 */
.modify-cell :deep(.van-cell__title) {
  padding: 0;
}

/* cell-grid 布局（与原 team-table-row 一致） */
.cell-grid {
  display: grid;
  grid-template-columns: 1fr 80px 80px;
  align-items: center;
  gap: 16px;
}

/* 修改时间网格布局 */
.modify-time-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
}

/* 团队/下级视图表格行样式 */
.team-table-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px; /* 右两栏固定宽度 */
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
  position: relative;
}

/* 使用伪元素创建带左右间距的分隔线 */
.team-table-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 0.5px;
  background-color: var(--color-neutral2-sixth);
}

.team-table-row:last-child::after {
  display: none;
}

/* 团队/下级视图卡片文字样式 */
.team-text-card {
  font-size: 14px;
  font-weight: 400;
  font-variant-numeric: tabular-nums; /* 等宽数字，垂直对齐 */
}

/* 默认颜色（没有动态颜色类时使用） */
.team-text-card:not(.text-error-normal):not(.text-success-normal):not(.text-neutral2-basic) {
  color: var(--color-text-neutral-basic);
}

.team-text-card.font-semibold {
  font-weight: 600;
}

/* 左侧标题列 */
.team-text-card:first-child {
  text-align: left;
}

/* 中间列（上月）和右侧列（本月）对齐 */
.team-text-card:nth-child(2),
.team-text-card:nth-child(3) {
  text-align: right;
}

/* 分隔线 */
.divider-line {
  background-color: var(--color-neutral2-sixth);
  height: 0.5px;
}

/* 发放时间文字 */
.release-date-text {
  color: var(--color-neutral2-tertiary);
  font-size: 12px;
  font-weight: 400;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}

/* 详情弹窗样式 */
.detail-popup {
  padding: 12px 16px 24px;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部指示器 */
.popup-indicator {
  width: 22px;
  height: 4px;
  background-color: var(--color-neutral2-sixth);
  border-radius: 2px;
  margin: 0 auto;
  margin-top: -6px;
  margin-bottom: 6px;
}

/* 弹窗标题栏 */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 16px;
}

/* 标题文字 */
.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-neutral-basic);
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* 关闭按钮 */
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-neutral2-secondary);
  cursor: pointer;
  margin-left: auto;
}

/* 内容区域（可滚动） */
.popup-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

/* 代理信息区域 */
.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 4px;
}

/* 代理账号 */
.agent-account {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-neutral-basic);
}

/* 代理标签 */
.agent-label {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-neutral-secondary);
  padding: 2px 8px;
}

/* 详情卡片 */
.detail-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid var(--color-neutral2-seventh);
}

/* 详情弹窗内的表格列宽覆盖 */
.detail-popup {
  .table-header {
    grid-template-columns: 1fr 110px 110px; /* 右两栏固定宽度 */
  }

  .team-table-row {
    grid-template-columns: 1fr 110px 110px; /* 右两栏固定宽度 */
  }
}

/* 修改时间行样式 */
.modify-time-row {
  grid-template-columns: auto 1fr auto !important;
  gap: 10px !important;
  padding: 8px 16px;
}

.modify-time {
  text-align: left !important;
  font-size: 12px;
  font-weight: 400;
  color: var(--color-neutral2-secondary);
}

/* 已发放标签 */
.released-tag {
  padding: 1px 6px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 400;
  border: 1px solid var(--color-success-50);
  background-color: var(--color-success-10);
  color: var(--color-success-normal);
}
/* 未已发放标签 */
.not-released-tag {
  padding: 1px 6px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 400;
  border: 1px solid var(--color-primary-50);
  background-color: var(--color-primary-10);
  color: var(--color-primary-normal);
}

/* 操作按钮基础样式 */
.action-btn {
  font-size: 12px;
  font-weight: 400;
  padding: 5px 12px;
  border-radius: 100px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* 调整按钮 */
.adjust-btn {
  color: var(--color-primary-normal);
  background-color: var(--color-white);
  border-color: var(--color-primary-normal);
}

.adjust-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 发放按钮 */
.release-btn {
  color: white;
  background-color: var(--color-primary-normal);
  border-color: var(--color-primary-normal);

  &:disabled {
    background-color: var(--color-neutral2-fifth) !important;
    color: white !important;
    border: 0 !important;
    cursor: not-allowed;
    opacity: 1;
  }
}

.release-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* Loading 状态样式 */
.agent-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
}

/* 确认弹窗样式 */
.confirm-dialog {
  background: white;
}

/* 标题 */
.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-neutral-basic);
  text-align: center;
  margin: 12px 0;
}

/* 分隔线 */
.dialog-divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-neutral2-sixth);
  margin-bottom: 12px;
}

/* 内容 */
.dialog-content {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-neutral2-secondary);
  text-align: center;
  margin: 41px 16px;
  line-height: 1.5;
}

/* 按钮组 */
.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px 16px;
}

/* 按钮基础样式 */
.dialog-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 取消按钮 */
.cancel-btn {
  color: var(--color-primary-normal);
  background-color: white;
  border: 1px solid var(--color-primary-normal);
}

.cancel-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 确认按钮 */
.confirm-btn {
  color: white;
  background-color: var(--color-primary-normal);
  border: none;
}

.confirm-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
