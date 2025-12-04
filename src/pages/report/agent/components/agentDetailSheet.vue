<script setup lang="ts">
import { computed } from 'vue'

interface AgentDetail {
  username: string
  level: string
  totalProfit: number
  betUserCount: number
  betAmount: number
  profitMargin: string
  firstDepositCount: number
  conversionRate: string
  registerCount: number
  loginCount: number
  firstDepositAmount: number
  avgFirstDeposit: number
  depositCount: number
  depositAmount: number
  withdrawCount: number
  withdrawAmount: number
  winLossAdjustment: number
  bonus: number
  rebate: number
  agentCommission: number
  date: string
}

interface Props {
  show: boolean
  detail: AgentDetail | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

// 创建可写的 computed 来处理 v-model
const showPopup = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const closeSheet = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<template>
  <van-popup
    v-model:show="showPopup"
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
    <div v-if="detail" class="detail-sheet">
      <!-- 顶部指示器 -->
      <div class="sheet-indicator"></div>

      <!-- 标题栏 -->
      <div class="sheet-header">
        <h3 class="sheet-title">详情</h3>
        <button @click="closeSheet" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 内容区域（可滚动） -->
      <div class="sheet-content">
        <!-- 代理信息 -->
        <div class="agent-info">
          <span class="agent-name">{{ detail.username }}</span>
          <span class="agent-level">{{ detail.level }}</span>
        </div>

        <!-- 数据列表 -->
        <div class="detail-list">
          <!-- 总盈利 -->
          <div class="detail-item">
            <span class="detail-label">总盈利</span>
            <span class="detail-value highlight">{{ detail.totalProfit >= 0 ? '+' : '' }}{{ detail.totalProfit.toLocaleString() }}</span>
          </div>

          <!-- 投注人数 -->
          <div class="detail-item">
            <span class="detail-label">投注人数</span>
            <span class="detail-value">{{ detail.betUserCount.toLocaleString() }}</span>
          </div>

          <!-- 投注金额 -->
          <div class="detail-item">
            <span class="detail-label">投注金额</span>
            <span class="detail-value">{{ detail.betAmount.toLocaleString() }}</span>
          </div>

          <!-- 盈余比例 -->
          <div class="detail-item">
            <span class="detail-label">盈余比例</span>
            <span class="detail-value">{{ detail.profitMargin }}</span>
          </div>

          <!-- 首存人数 -->
          <div class="detail-item">
            <span class="detail-label">首存人数</span>
            <span class="detail-value">{{ detail.firstDepositCount.toLocaleString() }}</span>
          </div>

          <!-- 转化率 -->
          <div class="detail-item">
            <span class="detail-label">转化率</span>
            <span class="detail-value">{{ detail.conversionRate }}</span>
          </div>

          <!-- 注册账号 -->
          <div class="detail-item">
            <span class="detail-label">注册账号</span>
            <span class="detail-value">{{ detail.registerCount.toLocaleString() }}</span>
          </div>

          <!-- 登录账户 -->
          <div class="detail-item">
            <span class="detail-label">登录账户</span>
            <span class="detail-value">{{ detail.loginCount.toLocaleString() }}</span>
          </div>

          <!-- 首存金额 -->
          <div class="detail-item">
            <span class="detail-label">首存金额</span>
            <span class="detail-value">{{ detail.firstDepositAmount.toLocaleString() }}</span>
          </div>

          <!-- 人均首存 -->
          <div class="detail-item">
            <span class="detail-label">人均首存</span>
            <span class="detail-value">{{ detail.avgFirstDeposit.toLocaleString() }}</span>
          </div>

          <!-- 充值人数 -->
          <div class="detail-item">
            <span class="detail-label">充值人数</span>
            <span class="detail-value">{{ detail.depositCount.toLocaleString() }}</span>
          </div>

          <!-- 充值金额 -->
          <div class="detail-item">
            <span class="detail-label">充值金额</span>
            <span class="detail-value">{{ detail.depositAmount.toLocaleString() }}</span>
          </div>

          <!-- 提现人数 -->
          <div class="detail-item">
            <span class="detail-label">提现人数</span>
            <span class="detail-value">{{ detail.withdrawCount.toLocaleString() }}</span>
          </div>

          <!-- 提现金额 -->
          <div class="detail-item">
            <span class="detail-label">提现金额</span>
            <span class="detail-value">{{ detail.withdrawAmount.toLocaleString() }}</span>
          </div>

          <!-- 输赢调整 -->
          <div class="detail-item">
            <span class="detail-label">输赢调整</span>
            <span class="detail-value">{{ detail.winLossAdjustment.toLocaleString() }}</span>
          </div>

          <!-- 红利 -->
          <div class="detail-item">
            <span class="detail-label">红利</span>
            <span class="detail-value">{{ detail.bonus.toLocaleString() }}</span>
          </div>

          <!-- 返水 -->
          <div class="detail-item">
            <span class="detail-label">返水</span>
            <span class="detail-value">{{ detail.rebate.toLocaleString() }}</span>
          </div>

          <!-- 代理佣金 -->
          <div class="detail-item">
            <span class="detail-label">代理佣金</span>
            <span class="detail-value">{{ detail.agentCommission.toLocaleString() }}</span>
          </div>
        </div>

         <!-- 时间分隔线（在整个列表最下方） -->
        <div class="flex items-center gap-3 mt-4 px-4">
          <div class="flex-1 h-px divider-line"></div>
          <span class="date-text">{{ detail.date }}</span>
          <div class="flex-1 h-px divider-line"></div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.detail-sheet {
  padding: 12px 16px 24px;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部指示器 */
.sheet-indicator {
  width: 22px;
  height: 4px;
  background-color: var(--color-neutral2-sixth);
  border-radius: 2px;
  margin: 0 auto;
  margin-top: -6px;
  margin-bottom: 6px;
}

/* 标题栏 */
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 16px;
}

.sheet-title {
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

/* 内容区域 */
.sheet-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

/* 代理信息 */
.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-neutral-basic);
}

.agent-level {
  font-size: 14px;
  color: var(--color-neutral-secondary);
}

/* 数据列表 */
.detail-list {
  background: var(--color-white);
  border-radius: 16px;
  padding: 0 12px;
  border: 1px solid var(--color-neutral2-sixth);
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-neutral2-sixth);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: var(--color-neutral-basic);
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-basic);
}

.detail-value.highlight {
  color: var(--color-error-normal);
}

/* 分隔线 */
.divider-line {
  background-color: var(--color-neutral2-sixth);
  height: 0.5px;
}

/* 时间文字 */
.date-text {
  color: var(--color-neutral2-tertiary);
  font-size: 12px;
  font-weight: 400;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}
</style>
