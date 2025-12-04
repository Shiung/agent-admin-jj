<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FinanceCard from './components/financeCard.vue'
import OrderCard from './components/orderCard.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import { useSticky } from '@/composables/useSticky'
import dayjs from 'dayjs'
import apis from '@/apis'
import type { GameDetailData, GameDetailItem } from '@/apis/codegen/data-contracts'
import { formatMoneyWithCommas, formatNumberWithCommas } from '@/utils/formatNumber'
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)

// 游戏类型映射
const gameStore = useGameStore()
const { gamesMapping } = storeToRefs(gameStore)

// From route query
const gameName = computed(() => route.query.game as string || '游戏详情')

// 游戏注单数据
const gameDetailData = ref<GameDetailData | null>(null)

// Sticky header logic
const { isFilterBarFixed, filterBarHeight, pullRefreshDisabled } = useSticky({
  containerRef,
  tabQueryIndex: 'none', // This page is not controlled by a tab query
  stickyTop: 84 // Height of the fixed header
})

// 游戏数据汇总
const gameData = computed(() => {
  if (!gameDetailData.value) return {
    totalProfit: 0,
    venueFee: 0,
    betAmount: 0,
    validBet: 0
  }

  const summary = gameDetailData.value.MoreItems
  return {
    totalProfit: summary.SumPlayerWinLose, // 会员总输赢
    venueFee: 0, // API 中没有场馆费字段
    betAmount: summary.SumTotalBetGold, // 总投注金额
    validBet: summary.SumValidWater // 总有效流水
  }
})
const searchKeyword = ref('')
// 结算时间选择（从 URL query 初始化，实现页面间连动）
const selectedDate = ref((route.query.date as string) || '本月')
const statusFilter = ref('全部状态')
const sortType = ref('结算时间降序')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 根据选择的日期获取时间戳范围
const getTimeRange = (dateStr: string): { BeginTime: number; EndTime: number } => {
  let startDate: dayjs.Dayjs
  let endDate: dayjs.Dayjs

  if (dateStr === '本月') {
    startDate = dayjs().startOf('month')
    endDate = dayjs().endOf('month')
  } else {
    startDate = dayjs(dateStr).startOf('month')
    endDate = dayjs(dateStr).endOf('month')
  }

  return {
    BeginTime: startDate.unix(),
    EndTime: endDate.unix(),
  }
}

// 状态映射：UI显示 -> API参数
const statusMap: Record<string, number> = {
  '全部状态': 0,
  '已结算': 1,
  '已取消': 2,
  '未结算': -1
}

// 排序映射：UI显示 -> API参数
// 可用字段：TotalBetGold(总投注), ValidWater(有效投注), WinGold(派彩), CompanyWinLose(总盈利), SettlementTime(结算时间)
const sortMap: Record<string, string> = {
  '结算时间降序': '-SettlementTime',
  '结算时间升序': 'SettlementTime',
  '盈利降序': '-CompanyWinLose',
  '盈利升序': 'CompanyWinLose'
}

// 加载数据
const loading = ref(true) // 初始为 true，避免进入页面时先显示空状态
const fetchGameDetail = async (isRefreshing = false) => {
  try {
    // 下拉刷新时不显示 loading（顶部已有刷新动画）
    if (!isRefreshing) {
      loading.value = true
    }
    const { BeginTime, EndTime } = getTimeRange(selectedDate.value)

    const response = await apis.admin.getGameDetail({
      Page: currentPage.value,
      PageSize: pageSize.value,
      BeginTime,
      EndTime,
      GameType: gameName.value, // 游戏场馆代码
      LoginAccount: searchKeyword.value || undefined, // 会员账号搜索
      SelectTimeType: 2, // 2=结算时间
      Status: statusMap[statusFilter.value],
      Sort: sortMap[sortType.value]
    })

    if (response.data.Code === 200 && response.data.Data) {
      gameDetailData.value = response.data.Data
    } else {
      showToast({
        message: response.data.Msg || '加载失败',
        position: 'bottom',
      })
    }
  } catch (error) {
    console.error('获取游戏注单详情失败:', error)
    showToast({
      message: '加载失败，请稍后重试',
      position: 'bottom',
    })
  } finally {
    if (!isRefreshing) {
      loading.value = false
    }
  }
}

// 格式化注单状态
const formatStatus = (status: number): 'completed' | 'pending' | 'cancelled' => {
  if (status === 1) return 'completed' // 已结算
  if (status === 2) return 'cancelled' // 已取消
  return 'pending' // 未结算
}

// 格式化注单列表数据
const orderList = computed(() => {
  if (!gameDetailData.value) return []

  return gameDetailData.value.Items.map(item => ({
    orderNo: item.TransactionId,
    status: formatStatus(item.Status),
    betAmount: formatMoneyWithCommas(item.TotalBetGold, 2, true),
    validBet: formatMoneyWithCommas(item.ValidWater, 2, true),
    profit: formatMoneyWithCommas(item.PlayerWinLose, 2, true),
    username: item.LoginAccount,
    vipLevel: `VIP${item.VipLevel || 0}`,
    time: dayjs.unix(item.SettlementTime).format('YYYY-MM-DD HH:mm:ss'),
    rawData: item // 保留原始数据用于详情展示
  }))
})
const dateOptions = computed(() => {
  const options = [{ label: '结算时间｜本月', value: '本月' }]
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
const statusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '已结算', value: '已结算' },
  { label: '未结算', value: '未结算' },
  { label: '已取消', value: '已取消' },
]
const sortOptions = [
  { label: '结算时间降序', value: '结算时间降序' },
  { label: '结算时间升序', value: '结算时间升序' },
  { label: '盈利降序', value: '盈利降序' },
  { label: '盈利升序', value: '盈利升序' },
]

// Pull to refresh
const refreshing = ref(false)
const onRefresh = async () => {
  currentPage.value = 1 // 重置到第一页
  await fetchGameDetail(true) // 传入 true 表示是下拉刷新
  refreshing.value = false
}

// Navigation
const handleBack = () => {
  const tab = route.query.tab || '1'
  router.push({
    name: 'financeGameRecord',
    query: { tab, date: selectedDate.value } // 传递日期参数回游戏记录页
  })
}

// Search
const handleSearch = () => {
  console.log('搜索会员账号:', searchKeyword.value)
  currentPage.value = 1 // 重置到第一页
  fetchGameDetail()
}

// 监听筛选条件变化，并更新 URL query
watch([selectedDate, statusFilter, sortType], ([newDate]) => {
  currentPage.value = 1 // 重置到第一页
  fetchGameDetail()
  // 更新 URL query 参数（不添加历史记录）
  router.replace({
    name: 'financeGameOrderDetail',
    query: {
      ...route.query,
      date: newDate
    }
  })
})

// 页面挂载时加载数据
onMounted(async () => {
  // 加载游戏配置数据
  await gameStore.fetchSolidConfig()
  // 加载游戏注单详情
  fetchGameDetail()
})

// Order Detail Popup
const showOrderDetail = ref(false)
const selectedOrder = ref<any>(null)
const orderDetailData = ref<any>(null)

// 游戏结果映射（英文 -> 中文）
const gameResultMap: Record<string, string> = {
  'half won': '赢半',
  'half lose': '输半',
  'won': '赢',
  'lose': '输',
  'void': '取消',
  'running': '未结算',
  'draw': '和局',
  'reject': '取消',
  'refund': '取消',
  'waiting': '待确认'
}

// 获取游戏结果中文字符串
const getGameResultString = (result: string | undefined): string => {
  if (!result) return '-'
  const lowerResult = result.toLowerCase()
  return gameResultMap[lowerResult] || result
}

// 直播竞猜盘口结果映射（英文 -> 中文）
const liveGuessingMarketResultMap: Record<string, string> = {
  'Winner': '赢',
  'Loser': '输',
  'Refund': '已取消',
  'Irrelevant': '已取消'
}

// 获取直播竞猜盘口结果中文字符串
const getLiveGuessingMarketResultString = (result: string | undefined): string => {
  if (!result) return '-'
  return liveGuessingMarketResultMap[result] || result
}

// 赔率类型映射（英文 -> 中文）
const oddsTypeMap: Record<string, string> = {
  'EUROPE': '欧洲盘',
  'HONGKONG': '香港盘',
  'MALAY': '马来盘',
  'INDONESIA': '印尼盘'
}

// 获取赔率类型中文字符串
const getOddsTypeString = (type: string | undefined): string => {
  if (!type) return ''
  return oddsTypeMap[type] || ''
}

// 获取游戏名称（根据游戏ID）
const getGameName = (gameId: string | number | undefined): string => {
  if (!gameId) return '-'
  const gameIdStr = String(gameId)
  return gamesMapping.value[gameIdStr].gameName || '-'
}

// 解析订单详情数据
const parseOrderDetail = (rawData: GameDetailItem) => {
  try {
    // 尝试解析 Detail 字段（可能是 JSON 字符串）
    let detailObj: any = null
    if (rawData.Detail) {
      try {
        detailObj = typeof rawData.Detail === 'string' ? JSON.parse(rawData.Detail) : rawData.Detail
      } catch (e) {
        console.warn('无法解析 Detail 字段:', e)
      }
    }

    // 根据不同游戏类型返回相应的详情数据
    // 体育投注
    if (rawData.SportDetails && rawData.SportDetails.length > 0) {
      const sportDetail = rawData.SportDetails[0]
      if (!sportDetail) return null

      const league = sportDetail.LeagueName || '-'
      const match = sportDetail.HomeTeam && sportDetail.AwayTeam ? `${sportDetail.HomeTeam} vs ${sportDetail.AwayTeam}` : '-'
      const startTime = sportDetail.GameStartTime ? `${sportDetail.GameType} ｜ ${dayjs.unix(sportDetail.GameStartTime).format('YYYY-MM-DD HH:mm:ss')}` : '-'
      const betItem = sportDetail.OptionName || sportDetail.InPlayScore || '-'
      const betType = sportDetail.BetTypeString || '-'
      const oddsType = getOddsTypeString(sportDetail.MarketType)
      const odds = sportDetail.Odds ? `@${sportDetail.Odds}${oddsType ? ' (' + oddsType + ')' : ''}` : '-'
      const result = getGameResultString(sportDetail.GameResult)

      return {
        type: 'sport',
        fields: [
          // { label: '注单号', value: sportDetail.TransactionId || '-' },
          // { label: '场馆代号', value: sportDetail.VenueName || '-' },
          //{ label: '球种', value: sportDetail.GameType || '-' },
          { label: '联赛', value: league },
          { label: '赛事', value: match },
          { label: '开赛时间', value: startTime },
          { label: '投注项', value: `${sportDetail.IsInPlay ? '滚球' : ''} ${sportDetail.MarketName || '-'} ${sportDetail.OptionName || '-'}` },
          { label: '投注类型', value: betType },
          { label: '赔率', value: odds },
          { label: '投注结果', value: result, isResult: true },
          // { label: '下注金额', value: sportDetail.BetStake ? formatNumberWithCommas(sportDetail.BetStake, 2, true) : '-' },
          // { label: '有效投注', value: sportDetail.ValidStake ? formatNumberWithCommas(sportDetail.ValidStake, 2, true) : '-' },
          // { label: '会员输赢', value: sportDetail.PlayerWinLoss ? formatNumberWithCommas(sportDetail.PlayerWinLoss, 2, true) : '-' },
          // { label: '下注时间', value: sportDetail.BetTime ? dayjs.unix(sportDetail.BetTime).format('YYYY-MM-DD HH:mm:ss') : '-' }
        ],
        // 保留原始字段用于向后兼容
        league,
        match,
        startTime,
        betItem,
        betType,
        odds,
        result,
        ...sportDetail
      }
    }

    // 真人游戏
    if (rawData.GameLiveDetails && rawData.GameLiveDetails.length > 0) {
      const liveDetail = rawData.GameLiveDetails[0]
      if (!liveDetail) return null

      return {
        type: 'live',
        fields: [
          { label: '注单号', value: liveDetail.TransactionId || '-' },
          { label: '厅名称', value: liveDetail.PlatformName || '-' },
          { label: '游戏模式', value: liveDetail.GameMode || '-' },
          { label: '靴号', value: liveDetail.BootNo || '-' },
          { label: '局号', value: liveDetail.RoundNo || '-' },
          { label: '局数', value: liveDetail.RoundCount || '-' },
          { label: '玩法', value: liveDetail.BetPointName || '-' },
          { label: '赔率', value: liveDetail.Odds || '-' },
          { label: '牌型', value: liveDetail.CardResult || '-' },
          { label: '结果', value: liveDetail.Result || '-', isResult: true }
        ],
        ...liveDetail
      }
    }

    // Funky火箭
    if (rawData.FunkyDetails && rawData.FunkyDetails.length > 0) {
      const funkyDetail = rawData.FunkyDetails[0]
      if (!funkyDetail) return null

      return {
        type: 'funky',
        fields: [
          { label: '游戏名称', value: funkyDetail.GameName || '-' },
          { label: '游戏编号', value: funkyDetail.RoundId || '-' },
          ...(funkyDetail.LiveId ? [
            { label: '直播间ID', value: funkyDetail.LiveId },
            { label: '主播名称', value: funkyDetail.LiveStreamerName || '-' },
            { label: '直播间名称', value: funkyDetail.LiveStreamingTitle || '-' }
          ] : []),
          { label: '玩家账号', value: funkyDetail.PlayerAccount || '-' },
          { label: '总投注', value: formatMoneyWithCommas(funkyDetail.TotalBet || 0, 2, true) },
          { label: '有效投注', value: formatMoneyWithCommas(funkyDetail.ValidBet || 0, 2, true) },
          { label: '开伞倍率', value: funkyDetail.PlayerCashOutResult ? `x${funkyDetail.PlayerCashOutResult}` : '0（未开伞）' },
          { label: '玩家盈利', value: formatMoneyWithCommas(funkyDetail.PlayerWin || 0, 2, true) },
          { label: '结算时间', value: funkyDetail.SettleTime ? dayjs.unix(funkyDetail.SettleTime).format('YYYY-MM-DD HH:mm:ss') : '-' }
        ],
        ...funkyDetail
      }
    }

    // 直播竞猜
    if (rawData.LiveDetails && rawData.LiveDetails.length > 0) {
      const streamDetail = rawData.LiveDetails[0]
      if (!streamDetail) return null

      return {
        type: 'stream',
        fields: [
          { label: '直播间ID', value: streamDetail.LiveId },
          // { label: '交易ID', value: streamDetail.TransactionId || '-' },
          { label: '直播间标题', value: streamDetail.LiveStreamingTitle || '-' },
          { label: '直播主名称', value: streamDetail.StreamerName || '-' },
          { label: '投注项', value: streamDetail.BetOnName || '-' },
          // { label: '局号', value: streamDetail.Round || '-' },
          { label: '投注类型', value: getGameName(streamDetail.GameId) },
          { label: '投注赛事', value: streamDetail.MarketName || '-' },
          { label: '赔率', value: (streamDetail.MarketType === 'PK' || streamDetail.MarketType === 'Pool') ? '-' : streamDetail.Odds },
          // { label: '底注', value: formatMoneyWithCommas(streamDetail.Ante || 0, 2, true) },
          // { label: '派彩', value: formatMoneyWithCommas(streamDetail.Payout || 0, 2, true) },
          { label: '注单结果', value: getLiveGuessingMarketResultString(streamDetail.MarketResult) },
          { label: '赛果', value: streamDetail.OrderStatus !== 'Confirmed' ? streamDetail.MarketWinner : '' },
          // { label: '订单状态', value: streamDetail.OrderStatus || '-' },
          // { label: '投注时间', value: streamDetail.BetTime ? dayjs.unix(streamDetail.BetTime).format('YYYY-MM-DD HH:mm:ss') : '-' }
        ],
        ...streamDetail
      }
    }

    // 如果有解析的 Detail 对象，使用它
    if (detailObj) {
      return detailObj
    }

    // 返回 null 表示没有详情数据
    return null
  } catch (error) {
    console.error('解析订单详情失败:', error)
    return null
  }
}

const handleOrderClick = (order: any) => {
  selectedOrder.value = order
  // 直接使用 rawData 解析订单详情
  orderDetailData.value = parseOrderDetail(order.rawData)
  showOrderDetail.value = true
}

// 获取订单详情的游戏名称（根据游戏类型）
const orderGameName = computed(() => {
  if (!selectedOrder.value?.rawData) return '-'

  const rawData = selectedOrder.value.rawData

  // Funky火箭
  if (rawData.FunkyDetails && rawData.FunkyDetails.length > 0) {
    return rawData.FunkyDetails[0]?.GameName || 'Funky火箭'
  }

  // 真人游戏
  if (rawData.GameLiveDetails && rawData.GameLiveDetails.length > 0) {
    return rawData.GameLiveDetails[0]?.PlatformName || '真人游戏'
  }

  // 直播竞猜
  if (rawData.LiveDetails && rawData.LiveDetails.length > 0) {
    return '直播竞猜'
  }

  // 体育投注
  if (rawData.SportDetails && rawData.SportDetails.length > 0) {
    const sport = rawData.SportDetails[0]
    return sport?.VenueName || sport?.GameType || '体育投注'
  }

  // 默认使用场馆代码
  return rawData.GameType || '-'
})

// 获取订单摘要字段（根据游戏类型动态显示）
const orderSummaryFields = computed(() => {
  if (!selectedOrder.value?.rawData) {
    return [
      { label: '投注金额', value: '-' },
      { label: '有效投注', value: '-' },
      { label: '盈利', value: '-' }
    ]
  }

  const rawData = selectedOrder.value.rawData

  // Funky火箭 - 显示 Funky 特有字段
  if (rawData.FunkyDetails && rawData.FunkyDetails.length > 0) {
    const funky = rawData.FunkyDetails[0]
    return [
      {
        label: '投注金额',
        value: formatMoneyWithCommas(funky.TotalBet || 0, 2, true)
      },
      {
        label: '有效投注',
        value: formatMoneyWithCommas(funky.ValidBet || 0, 2, true)
      },
      {
        label: '盈利',
        value: formatMoneyWithCommas(funky.PlayerWin || 0, 2, true),
        isProfit: true
      }
    ]
  }

  // 真人游戏 - 显示真人游戏特有字段
  if (rawData.GameLiveDetails && rawData.GameLiveDetails.length > 0) {
    const live = rawData.GameLiveDetails[0]
    return [
      {
        label: '投注金额',
        value: formatMoneyWithCommas(live.BetAmount || 0, 2, true)
      },
      {
        label: '有效投注',
        value: formatMoneyWithCommas(live.ValidBetAmount || 0, 2, true)
      },
      {
        label: '盈利',
        value: formatMoneyWithCommas(live.WinLoss || 0, 2, true),
        isProfit: true
      }
    ]
  }

  // 直播竞猜 - 显示直播特有字段
  if (rawData.LiveDetails && rawData.LiveDetails.length > 0) {
    const stream = rawData.LiveDetails[0]
    return [
      {
        label: '投注金额',
        value: formatMoneyWithCommas(stream.TotalBetAmount || 0, 2, true)
      },
      {
        label: '投注数量',
        value: formatNumberWithCommas(stream.BetCount || 0, 0, true)
      },
      {
        label: '派彩',
        value: formatMoneyWithCommas(stream.Payout || 0, 2, true),
        isProfit: true
      }
    ]
  }

  // 体育投注 - 显示体育特有字段
  if (rawData.SportDetails && rawData.SportDetails.length > 0) {
    const sport = rawData.SportDetails[0]
    return [
      {
        label: '投注金额',
        value: formatMoneyWithCommas(sport.BetStake || 0, 2, true)
      },
      {
        label: '有效投注',
        value: formatMoneyWithCommas(sport.ValidBetAmount || 0, 2, true)
      },
      {
        label: '盈利',
        value: formatMoneyWithCommas(sport.PlayerWinLoss || 0, 2, true),
        isProfit: true
      }
    ]
  }

  // 默认使用父级字段（通用字段）
  return [
    {
      label: '投注金额',
      value: formatMoneyWithCommas(rawData.TotalBetGold || 0, 2, true)
    },
    {
      label: '有效投注',
      value: formatMoneyWithCommas(rawData.ValidWater || 0, 2, true)
    },
    {
      label: '盈利',
      value: formatMoneyWithCommas(rawData.PlayerWinLose || 0, 2, true),
      isProfit: true
    }
  ]
})

const copyOrderNo = (orderNo: string) => {
  navigator.clipboard.writeText(orderNo)
  showToast({
    message: '复制成功',
    position: 'center',
    zIndex: 10000, // 确保在 popup 之上显示
  })
}
</script>

<template>
  <div class="game-order-container" ref="containerRef">
    <!-- 头部导航 -->
    <div class="fixed-header">
      <div class="flex items-center justify-between h-11 px-3 bg-white">
        <van-icon name="arrow-left" size="24" @click="handleBack" />
        <span class="text-base font-semibold text-neutral-basic">{{ gameName }}</span>
        <div style="width: 24px;"></div>
      </div>
      <!-- 提示信息 -->
      <div class="px-3">
        <div class="info-tip">
          <img src="/static/images/common/light_bulb.png" alt="提示" class="tip-icon" />
          <span class="tip-text">以下数据仅统计「已结算」的订单</span>
        </div>
      </div>
    </div>

    <!-- 下拉刷新容器 -->
    <van-pull-refresh
      v-model="refreshing"
      :disabled="pullRefreshDisabled"
      @refresh="onRefresh"
      class="game-order-pull-refresh"
    >
      <!-- 总计卡片 -->
      <div class="px-3 py-2 pt-[94px]">
        <FinanceCard
          class="shadow-sm"
          title=""
          :show-arrow="false"
          :show-background-color="false"
          :data="[
            [
              { label: '总盈利', value: gameData.totalProfit, isMoney: true },
              { label: '场馆费', value: formatMoneyWithCommas(gameData.venueFee, 2, true) }
            ],
            [
              { label: '投注金额', value: formatMoneyWithCommas(gameData.betAmount, 2, true) },
              { label: '有效投注', value: formatMoneyWithCommas(gameData.validBet, 2, true) }
            ]
          ]"
        />
      </div>

      <!-- 搜索和筛选器（sticky 固定） -->
      <div>
        <div v-if="isFilterBarFixed" class="filter-bar-placeholder" :style="{ height: `${filterBarHeight}px` }" />
        <div class="sticky-filter-bar px-3 py-2 space-y-3" :class="{ 'is-fixed': isFilterBarFixed }">
          <!-- 会员账号搜索框 -->
          <van-search
            v-model="searchKeyword"
            placeholder="会员账号"
            shape="round"
            background="transparent"
            clearable
            left-icon=""
            @search="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #right-icon>
              <van-icon name="search" size="18" @click="handleSearch" />
            </template>
          </van-search>

          <!-- 筛选条件行 -->
          <div class="filter-scroll-container">
            <!-- 结算时间 -->
            <Dropdown
              v-model="selectedDate"
              :options="dateOptions"
              height="1.5rem"
              class="filter-dropdown !w-auto !bg-[#F8FAFD] hover:!bg-[#F8FAFD]"
            />

            <!-- 状态筛选 -->
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
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
      <div v-if="loading" class="order-list-loading">
        <van-loading size="32px" vertical>
          <template #default>加载中...</template>
        </van-loading>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!gameDetailData || orderList.length === 0" class="order-list-empty">
        <img src="/static/images/promote/empty.png" alt="暂无数据" class="empty-icon" />
        <span class="empty-text">暂无数据</span>
      </div>

      <!-- 订单列表 -->
      <div v-else class="order-list-container">
        <OrderCard
          v-for="(order, index) in orderList"
          :key="index"
          :order="order"
          @click="handleOrderClick(order)"
        />
      </div>
    </van-pull-refresh>
    <!-- 订单详情弹窗 -->
    <van-popup
      v-model:show="showOrderDetail"
      position="bottom"
      round
      :overlay="true"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
      :close-on-click-overlay="true"
      :safe-area-inset-bottom="true"
      :style="{ maxHeight: '740px', minHeight: '33.4375rem' }"
      teleport="body"
      :z-index="9999"
    >
      <div v-if="selectedOrder" class="order-detail-sheet">
        <!-- 顶部指示器 -->
        <div class="sheet-indicator"></div>

        <!-- 头部 -->
        <div class="sheet-header">
          <div class="header-left"></div>
          <h3 class="sheet-title">注单详情</h3>
          <button class="close-btn" @click="showOrderDetail = false">
            <van-icon name="cross" size="24" />
          </button>
        </div>

        <!-- 订单摘要 -->
        <div class="order-summary">
          <div class="order-no-row">
            <div class="order-no-wrapper">
              <span class="label">订单号</span>
              <span class="value">{{ selectedOrder.orderNo }}</span>
              <van-image
                width="12"
                height="12"
                src="./static/images/common/copy.png"
                @click.stop="copyOrderNo(selectedOrder.orderNo)"
                style="cursor: pointer;"
              />
            </div>
            <div class="status-tag" :class="`status-${selectedOrder.status}`">
              {{ selectedOrder.status === 'completed' ? '已结算' : selectedOrder.status === 'pending' ? '未结算' : '已取消' }}
            </div>
          </div>

          <div class="summary-data">
            <div
              v-for="(field, index) in orderSummaryFields"
              :key="index"
              class="data-col"
            >
              <span class="data-label">{{ field.label }}</span>
              <span
                class="data-value"
                :class="{ 'profit': field.isProfit }"
              >
                {{ field.value }}
              </span>
            </div>
          </div>

          <div class="game-info">
            <span class="game-name">{{ orderGameName }}</span>
            <span class="game-time">{{ selectedOrder.time }}</span>
          </div>
        </div>

        <!-- 投注详情 -->
        <!-- 空状态 -->
        <div v-if="!orderDetailData" class="bet-details-empty">
          <img src="/static/images/promote/empty.png" alt="暂无数据" class="empty-icon" />
          <span class="empty-text">尚无资料</span>
        </div>

        <!-- 数据内容 -->
        <div v-else class="bet-details">
          <!-- 使用 fields 数组动态渲染（支持不同游戏类型） -->
          <template v-if="orderDetailData.fields">
            <div
              v-for="(field, index) in orderDetailData.fields"
              :key="index"
              class="detail-row"
            >
              <span class="row-label">{{ field.label }}</span>
              <span
                class="row-value"
                :class="{ 'result-win': field.isResult }"
              >
                {{ field.value }}
              </span>
            </div>
          </template>

          <!-- 向后兼容：如果没有 fields，使用原有的固定字段显示（体育投注） -->
          <template v-else>
            <div class="detail-row">
              <span class="row-label">联赛</span>
              <span class="row-value">{{ orderDetailData.league }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">赛事</span>
              <span class="row-value">{{ orderDetailData.match }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">开赛时间</span>
              <span class="row-value">{{ orderDetailData.startTime }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">投注项</span>
              <span class="row-value">{{ orderDetailData.betItem }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">投注类型</span>
              <span class="row-value">{{ orderDetailData.betType }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">赔率</span>
              <span class="row-value">{{ orderDetailData.odds }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">投注结果</span>
              <span class="row-value result-win">{{ orderDetailData.result }}</span>
            </div>
          </template>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.game-order-container {
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

.game-order-pull-refresh {
  :deep(.van-pull-refresh__track) {
    overflow: visible !important;
  }
  :deep(.van-pull-refresh__head) {
    top: 92px;
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
    top: 84px; /* Header 高度 (h-11 + info-tip) */
    left: 0;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

/* 用於吸頂定位的佔位元素 */
.filter-bar-placeholder {
  /* 高度由JS動態設定 */
}

.order-list-container {
  flex: 1;
  margin-top: 8px;
  padding: 0 0.75rem;
  padding-bottom: calc(var(--van-tabbar-height, 0px) + env(safe-area-inset-bottom, 0px) + 2rem);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Loading 状态 */
.order-list-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
}

/* 空状态 */
.order-list-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  min-height: 300px;
  gap: 16px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.empty-text {
  font-size: 14px;
  color: var(--color-neutral2-tertiary);
  font-weight: 400;
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

  /* 输入框样式 */
  .van-field__control {
    font-size: 14px;
    color: var(--color-neutral-basic);
  }

  .van-field__control::placeholder {
    color: var(--color-neutral-secondary);
  }

  /* 右侧图标区域 */
  .van-field__right-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-neutral-secondary);
  }

  /* 清除按钮样式 */
  .van-field__clear {
    color: var(--color-neutral-secondary);
  }

  /* 搜索图标样式 */
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
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
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

/* 订单详情弹窗 */
.order-detail-sheet {
  background: white;
  padding: 16px;
  height: 100%;
  overflow-y: auto;

  /* 状态标签样式 */
  .status-tag {
    padding: 1px 6px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 400;
  }
  .status-completed {
    border: 1px solid var(--color-success-50);
    background-color: var(--color-success-10);
    color: var(--color-success-normal);
  }

  .status-pending {
    border: 1px solid var(--color-neutral2-fifth);
    background-color: var(--color-neutral2-seventh);
    color: var(--color-neutral2-secondary);
  }

  .status-cancelled {
    border: 1px solid var(--color-error-50);
    background-color: var(--color-error-10);
    color: var(--color-error-normal);
  }
}

/* 顶部指示器 */
.sheet-indicator {
  width: 22px;
  height: 4px;
  background-color: rgba(29, 39, 86, 0.1);
  border-radius: 2px;
  margin: 0 auto;
  margin-top: -6px;
  margin-bottom: 6px;
}

/* 头部 */
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 16px;
}

/* 左侧占位，让 title 可以真正居中 */
.header-left {
  width: 24px;
  height: 24px;
}

/* Title 自动居中 */
.sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-neutral-basic);
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

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
}

/* 订单摘要 */
.order-summary {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-neutral2-seventh);
  padding: 12px;
  margin-bottom: 12px;
}

.order-no-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-no-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;

  .label {
    font-size: 12px;
    color: var(--color-neutral-secondary);
  }

  .value {
    font-size: 12px;
    color: var(--color-neutral-basic);
    font-weight: 400;
  }
}

.summary-data {
  display: flex;
  background: var(--color-bg-floor-1-2);
  border-radius: 16px;
  height: 62px;
  margin-bottom: 12px;
}

.data-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.data-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

.data-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-basic);

  &.profit {
    color: var(--color-error-normal);
  }
}

.game-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-name {
  font-size: 12px;
  color: var(--color-neutral-basic);
  font-weight: 400;
}

.game-time {
  font-size: 12px;
  color: var(--color-neutral-basic);
}

/* 投注详情 - 空状态 */
.bet-details-empty {
  background: white;
  padding: 60px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

.empty-icon {
  width: 6.25rem;
  height: 6.25rem;
  object-fit: contain;
}

.empty-text {
  font-size: 14px;
  color: var(--color-neutral-secondary);
}

/* 投注详情 */
.bet-details {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-neutral2-seventh);
  padding: 0px 12px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-neutral2-seventh);

  &:last-child {
    border-bottom: none;
  }
}

.row-label {
  font-size: 14px;
  color: var(--color-neutral-basic);
  flex-shrink: 0;
  margin-right: 16px;
}

.row-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-basic);
  text-align: right;
  word-break: break-word;

  &.result-win {
    color: var(--color-error-normal);
    font-weight: 600;
  }
}
</style>
