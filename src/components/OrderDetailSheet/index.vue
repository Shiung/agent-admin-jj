<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { formatMoneyWithCommas, formatNumberWithCommas } from '@/utils/formatNumber'
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'
import type { GameDetailItem } from '@/apis/codegen/data-contracts'

interface DetailField {
  label: string
  value: string | number
  isResult?: boolean
}

interface OrderDetail {
  type?: 'sport' | 'live' | 'funky' | 'stream'
  fields?: DetailField[]
  [key: string]: any
}

interface Props {
  rawData?: GameDetailItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const show = defineModel<boolean>('show', {
  required: true
})
// 游戏类型映射
const gameStore = useGameStore()
const { gamesMapping } = storeToRefs(gameStore)

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
const parseOrderDetail = (rawData: GameDetailItem): OrderDetail | null => {
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
          { label: '联赛', value: league },
          { label: '赛事', value: match },
          { label: '开赛时间', value: startTime },
          { label: '投注项', value: `${sportDetail.IsInPlay ? '滚球' : ''} ${sportDetail.MarketName || '-'} ${sportDetail.OptionName || '-'}` },
          { label: '投注类型', value: betType },
          { label: '赔率', value: odds },
          { label: '投注结果', value: result, isResult: true },
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
          { label: '直播间ID', value: streamDetail.LiveId || '-' },
          { label: '直播间标题', value: streamDetail.LiveStreamingTitle || '-' },
          { label: '直播主名称', value: streamDetail.StreamerName || '-' },
          { label: '投注项', value: streamDetail.BetOnName || '-' },
          { label: '投注类型', value: getGameName(streamDetail.GameId) },
          { label: '投注赛事', value: streamDetail.MarketName || '-' },
          { label: '赔率', value: (streamDetail.MarketType === 'PK' || streamDetail.MarketType === 'Pool') ? '-' : (streamDetail.Odds || '-') },
          { label: '注单结果', value: getLiveGuessingMarketResultString(streamDetail.MarketResult) },
          { label: '赛果', value: streamDetail.OrderStatus !== 'Confirmed' ? (streamDetail.MarketWinner || '') : '' },
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

// 获取订单详情的游戏名称（根据游戏类型）
const orderGameName = computed(() => {
  if (!props.rawData) return '-'

  const rawData = props.rawData

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
  if (!props.rawData) {
    return [
      { label: '投注金额', value: '-' },
      { label: '有效投注', value: '-' },
      { label: '盈利', value: '-' }
    ]
  }

  const rawData = props.rawData

  // Funky火箭 - 显示 Funky 特有字段
  if (rawData.FunkyDetails && rawData.FunkyDetails.length > 0) {
    const funky = rawData.FunkyDetails[0]
    if (funky) {
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
  }

  // 真人游戏 - 显示真人游戏特有字段
  if (rawData.GameLiveDetails && rawData.GameLiveDetails.length > 0) {
    const live = rawData.GameLiveDetails[0]
    if (live) {
      return [
        {
          label: '投注金额',
          value: formatMoneyWithCommas((live as any).BetAmount || 0, 2, true)
        },
        {
          label: '有效投注',
          value: formatMoneyWithCommas((live as any).ValidBetAmount || 0, 2, true)
        },
        {
          label: '盈利',
          value: formatMoneyWithCommas((live as any).WinLoss || 0, 2, true),
          isProfit: true
        }
      ]
    }
  }

  // 直播竞猜 - 显示直播特有字段
  if (rawData.LiveDetails && rawData.LiveDetails.length > 0) {
    const stream = rawData.LiveDetails[0]
    if (stream) {
      return [
        {
          label: '投注金额',
          value: formatMoneyWithCommas((stream as any).TotalBetAmount || 0, 2, true)
        },
        {
          label: '投注数量',
          value: formatNumberWithCommas((stream as any).BetCount || 0, 0, true)
        },
        {
          label: '派彩',
          value: formatMoneyWithCommas(stream.Payout || 0, 2, true),
          isProfit: true
        }
      ]
    }
  }

  // 体育投注 - 显示体育特有字段
  if (rawData.SportDetails && rawData.SportDetails.length > 0) {
    const sport = rawData.SportDetails[0]
    if (sport) {
      return [
        {
          label: '投注金额',
          value: formatMoneyWithCommas(sport.BetStake || 0, 2, true)
        },
        {
          label: '有效投注',
          value: formatMoneyWithCommas((sport as any).ValidBetAmount || 0, 2, true)
        },
        {
          label: '盈利',
          value: formatMoneyWithCommas(sport.PlayerWinLoss || 0, 2, true),
          isProfit: true
        }
      ]
    }
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

// 订单详情数据
const orderDetailData = computed(() => {
  if (!props.rawData) return null
  return parseOrderDetail(props.rawData)
})

// 订单基本信息（从 rawData 中提取）
const orderInfo = computed(() => {
  if (!props.rawData) return null

  // 格式化状态
  const formatStatus = (status: number): 'completed' | 'pending' | 'cancelled' => {
    if (status === 1) return 'completed' // 已结算
    if (status === 2) return 'cancelled' // 已取消
    return 'pending' // 未结算
  }

  return {
    orderNo: props.rawData.TransactionId,
    status: formatStatus(props.rawData.Status),
    time: dayjs.unix(props.rawData.SettlementTime).format('YYYY-MM-DD HH:mm:ss')
  }
})

// 关闭弹窗
const closeSheet = () => {
  show.value = false
  emit('close')
}

// 复制订单号
const copyOrderNo = (orderNo: string) => {
  navigator.clipboard.writeText(orderNo)
  showToast({
    message: '复制成功',
    position: 'middle',
    zIndex: 10000,
  })
}
</script>

<template>
  <van-popup
    v-model:show="show"
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
    <div v-if="orderInfo" class="order-detail-sheet">
      <!-- 顶部指示器 -->
      <div class="sheet-indicator"></div>

      <!-- 头部 -->
      <div class="sheet-header">
        <div class="header-left"></div>
        <h3 class="sheet-title">注单详情</h3>
        <button class="close-btn" @click="closeSheet">
          <van-icon name="cross" size="24" />
        </button>
      </div>

      <!-- 订单摘要 -->
      <div class="order-summary">
        <div class="order-no-row">
          <div class="order-no-wrapper">
            <span class="label">订单号</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
            <van-image
              width="12"
              height="12"
              src="/static/images/common/copy.png"
              @click.stop="copyOrderNo(orderInfo.orderNo)"
              style="cursor: pointer;"
            />
          </div>
          <div class="status-tag" :class="`status-${orderInfo.status}`">
            {{ orderInfo.status === 'completed' ? '已结算' : orderInfo.status === 'pending' ? '未结算' : '已取消' }}
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
          <span class="game-time">{{ orderInfo.time }}</span>
        </div>
      </div>

      <!-- 投注详情 -->
      <!-- 空状态 -->
      <div v-if="!orderDetailData" :style="{ minHeight: 'calc(100vh - 346px)' }" class="flex-1 flex items-center">
        <empty />
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
</template>

<style lang="scss" scoped>
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
