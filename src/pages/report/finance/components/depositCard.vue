<script setup lang="ts">
interface Record {
  orderNo: string
  username: string
  vipLevel: string
  depositAmount: number
  flowMultiplier: number
  depositRebate: number
  depositFee: number
  topUpType: string
  notes: string
  transactionTime: string
}

interface Props {
  record: Record
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
</script>

<template>
  <div class="deposit-card" @click="handleClick">
    <!-- 用户信息 -->
    <div class="card-header">
      <div class="user-info">
        <span class="username">{{ record.username }}</span>
        <span class="vip-badge">{{ record.vipLevel }}</span>
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
        <li class="detail-item">
          <span class="detail-label">代存金额</span>
          <span class="detail-value">{{ record.depositAmount.toLocaleString() }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">流水倍数</span>
          <span class="detail-value">{{ record.flowMultiplier }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">代存回馈</span>
          <span class="detail-value">{{ record.depositRebate }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">代存手续费</span>
          <span class="detail-value">{{ record.depositFee.toLocaleString() }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">充值类型</span>
          <span class="detail-value">{{ record.topUpType }}</span>
        </li>
        <li class="detail-item">
          <span class="detail-label">备注</span>
          <span class="detail-value">{{ record.notes }}</span>
        </li>
      </ul>
    </div>

    <!-- 时间信息 -->
    <div class="time-section">
      <div class="time-row">
        <span class="time-label">账变时间</span>
        <span class="time-value">{{ record.transactionTime }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 外层灰色容器 */
.deposit-card {
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

/* 详细信息列表 */
.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-item {
  position: relative;
  display: flex;
  align-items: flex-start;
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

/* 时间区域 */
.time-section {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
