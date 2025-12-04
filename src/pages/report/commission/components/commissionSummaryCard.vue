<script setup lang="ts">
import { ref } from 'vue'
import { formatMoneyWithCommas } from '@/utils/formatNumber'

interface Props {
  payableTotal: number  // 应发佣金总计
  paidTotal: number     // 已发佣金总计
  isSettlement: number  // 佣金结算状态
  settlementTime: number // 佣金结算时间
}

defineProps<Props>()

const emit = defineEmits<{
  release: []  // 一键发放事件
}>()

// 确认弹窗状态
const showConfirmPopup = ref(false)

const handleRelease = () => {
  showConfirmPopup.value = true
}

// 确认发放
const handleConfirm = () => {
  showConfirmPopup.value = false
  emit('release')
}

// 取消发放
const handleCancel = () => {
  showConfirmPopup.value = false
}
</script>

<template>
  <div class="commission-summary-card">
    <!-- 佣金总计数据 -->
    <div class="summary-data">
      <div class="data-column">
        <div class="data-label">应发佣金总计</div>
        <div class="data-value">{{ formatMoneyWithCommas(payableTotal) }}</div>
      </div>
      <div class="data-column">
        <div class="data-label">已发佣金总计</div>
        <div class="data-value">{{ formatMoneyWithCommas(paidTotal) }}</div>
      </div>
    </div>

    <!-- 一键发放按钮 -->
    <button class="release-button" :disabled="isSettlement === -1 && settlementTime === 0" @click="handleRelease">
      一键发放
    </button>

    <!-- 发放确认弹窗 -->
    <van-popup
      v-model:show="showConfirmPopup"
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
          是否发放佣金给全部下级代理?
        </div>

        <!-- 按钮组 -->
        <div class="dialog-footer">
          <button class="dialog-btn cancel-btn" @click="handleCancel">取消</button>
          <button class="dialog-btn confirm-btn" @click="handleConfirm">确认</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.commission-summary-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--color-neutral2-sixth);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 佣金总计数据 */
.summary-data {
  display: flex;
  gap: 24px;
}

.data-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.data-label {
  font-size: 14px;
  color: var(--color-neutral-basic);
  font-weight: 600;
  text-align: center;
}

.data-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary-normal);
  text-align: center;
}

/* 一键发放按钮 */
.release-button {
  width: 100%;
  height: 32px;
  background: var(--color-primary-normal);
  border-radius: 100px;
  border: none;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    background-color: var(--color-neutral2-fifth) !important;
    color: white !important;
    border: 0 !important;
    cursor: not-allowed;
    opacity: 1;
  }
}

.release-button:active {
  opacity: 0.8;
  transform: scale(0.98);
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
