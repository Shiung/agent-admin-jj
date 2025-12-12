<script setup lang="ts">
import { formatSignedMoney } from '@/utils/formatNumber'
interface Order {
  orderNo: string
  status: 'completed' | 'pending' | 'cancelled'
  betAmount: number | string
  validBet: number | string
  profit: number | string
  username: string
  vipLevel: string
  time: string
}

interface Props {
  order: Order
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
    zIndex: 10000, // 确保在 popup 之上显示
  })
}

// 状态标签配置
const getStatusConfig = (status: string) => {
  const configs = {
    completed: { text: '已结算', class: 'status-completed' },
    pending: { text: '未结算', class: 'status-pending' },
    cancelled: { text: '已取消', class: 'status-cancelled' }
  }
  return configs[status as keyof typeof configs] || configs.pending
}
</script>

<template>
  <div class="order-card" @click="handleClick">
    <!-- 订单号和状态 -->
    <div class="order-header">
      <div class="order-no-wrapper">
        <span class="order-label">订单号</span>
        <span class="order-no">{{ order.orderNo }}</span>
        <van-image width="12" height="12" src="/static/images/common/copy.png" @click.stop="copyOrderNo(order.orderNo)" />
      </div>
      <div class="status-tag" :class="getStatusConfig(order.status).class">
        {{ getStatusConfig(order.status).text }}
      </div>
    </div>

    <!-- 数据行 -->
    <div class="order-data">
      <div class="data-item">
        <span class="data-label">投注金额</span>
        <span class="data-value">{{ order.betAmount }}</span>
      </div>
      <div class="data-item">
        <span class="data-label">有效投注</span>
        <span class="data-value">{{ order.validBet }}</span>
      </div>
      <div class="data-item">
        <span class="data-label">盈利</span>
        <span class="text-[14px] font-semibold" :class="formatSignedMoney(order.profit).color">{{ formatSignedMoney(order.profit).text }}</span>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="order-footer">
      <div class="user-info">
        <span class="username">{{ order.username }}</span>
        <span class="vip-badge">{{ order.vipLevel }}</span>
      </div>
      <span class="order-time">{{ order.time }}</span>
    </div>

    <!-- 右箭头 -->
    <van-icon name="arrow" class="arrow-icon" />
  </div>
</template>

<style scoped>
.order-card {
  position: relative;
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-neutral2-seventh);
  padding: 12px;
  padding-right: 24px; /* 为悬浮箭头留出空间 */
  cursor: pointer;
  overflow: visible;
}

/* 订单头部 */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-right: -12px;
}

.order-no-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.order-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

.order-no {
  font-size: 12px;
  color: var(--color-neutral-basic);
  font-weight: 500;
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

/* 数据区域 */
.order-data {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-floor-1-2);
  height: 52px;
  border-radius: 16px;
  margin: 12px 0;
  margin-right: -12px;
}

.data-item {
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
}

/* 底部信息 */
.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: -12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: var(--color-neutral-basic);
  font-weight: 500;
}

.vip-badge {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

.order-time {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

/* 右箭头 - 白色圆形悬浮效果 */
.arrow-icon {
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -1px 2px 8px rgba(0, 0, 0, 0.2);
  color: var(--color-neutral-secondary);
}
</style>
