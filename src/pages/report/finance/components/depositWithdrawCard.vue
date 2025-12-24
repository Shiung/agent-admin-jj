<script setup lang="ts">
import { formatMoneyWithCommas } from '@/utils/formatNumber'

interface DepositWithdrawRecord {
  orderNo: string
  status: 'completed' | 'failed' | 'primary' | 'cancelled'
  statusText?: string // 可选的自定义状态文本
  username: string
  vipLevel: string
  applyAmount: number
  actualAmount: number
  depositType: string
  depositRate: string
  depositFee: number
  time: string
}

interface Props {
  record: DepositWithdrawRecord
  type: 'deposit' | 'withdraw'
  isDepositWithdrawFee: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
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

// 状态标签配置（只负责返回文本和样式类）
const getStatusConfig = (status: string, customText?: string): { text: string; class: string } => {
  // 状态到样式类的映射
  const statusToClass: Record<string, string> = {
    completed: 'status-completed',
    failed: 'status-failed',
    primary: 'status-primary',
    cancelled: 'status-cancelled'
  }

  return {
    text: customText || '未知状态',
    class: statusToClass[status] || 'status-failed'
  }
}
</script>

<template>
  <div class="deposit-withdraw-card" @click="handleClick">
          <!-- 用户信息和状态 -->
      <div class="card-header">
        <div class="user-info">
          <span class="username">{{ record.username }}</span>
          <span class="vip-badge">{{ record.vipLevel }}</span>
        </div>
        <div v-if="!isDepositWithdrawFee" class="status-tag" :class="getStatusConfig(record.status, record.statusText).class">
          {{ getStatusConfig(record.status, record.statusText).text }}
        </div>
      </div>
    <!-- 内层白色表格 -->
    <div class="card-inner">
      <!-- 详细信息列表 -->
      <ul class="detail-list">
        <li class="detail-item">
          <span class="detail-label">订单号</span>
          <div class="detail-value-wrapper">
            <span class="detail-value">{{ record.orderNo }}</span>
            <van-image
              width="12"
              height="12"
              src="./static/images/common/copy.png"
              @click.stop="copyOrderNo(record.orderNo)"
              style="cursor: pointer;"
            />
          </div>
        </li>
        <li v-if="!isDepositWithdrawFee" class="detail-item">
          <span class="detail-label">{{ type === 'deposit' ? '申请充值' : '申请提现' }}</span>
          <span class="detail-value">{{ formatMoneyWithCommas(record.applyAmount, 2, true) }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">{{ type === 'deposit' ? '实际充值' : '实际提现' }}</span>
          <span class="detail-value">{{ formatMoneyWithCommas(record.applyAmount, 2, true) }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">{{ type === 'deposit' ? '充值类型' : '提现类型' }}</span>
          <span class="detail-value">{{ record.depositType }}</span>
        </li>
        <li v-if="isDepositWithdrawFee" class="detail-item">
          <span class="detail-label">{{ type === 'deposit' ? '充值费率' : '提现费率' }}</span>
          <span class="detail-value">{{ record.depositRate }}</span>
        </li>
        <li v-if="isDepositWithdrawFee" class="detail-item">
          <span class="detail-label">{{ type === 'deposit' ? '充值手续费' : '提现手续费' }}</span>
          <span class="detail-value">{{ formatMoneyWithCommas(record.depositFee, 2, true) }}</span>
        </li>
      </ul>
    </div>

    <!-- 账变时间 -->
    <div class="time-row">
      <span class="time-label">账变时间</span>
      <span class="time-value">{{ record.time }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 外层灰色容器 */
.deposit-withdraw-card {
  position: relative;
  background: var(--color-bg-floor-1-2);
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  overflow: visible;
}

/* 内层白色表格 */
.card-inner {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: var(--color-neutral-basic);
  font-weight: 600;
}

.vip-badge {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

/* 状态标签 */
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

.status-failed {
  border: 1px solid var(--color-error-50);
  background-color: var(--color-error-10);
  color: var(--color-error-normal);
}

.status-primary {
  border: 1px solid var(--color-primary-50);
  background-color: var(--color-primary-10);
  color: var(--color-primary-normal);
}

.status-cancelled {
  border: 1px solid var(--color-error-50);
  background-color: var(--color-error-10);
  color: var(--color-error-normal);
}


/* 详细信息列表 */
.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

/* 使用伪元素创建带左右间距的分隔线 */
.detail-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background-color: var(--color-neutral2-sixth);
}

.detail-item:last-child::after {
  display: none;
}

.detail-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-neutral-basic);
  text-align: right;
}

.detail-value-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 账变时间 */
.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.time-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

.time-value {
  font-size: 14px;
  color: var(--color-neutral-basic);
}
</style>
