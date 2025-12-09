<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'vant'
import api from '@/apis'
import AppField from '@/components/AppField/index.vue'
import { formatMoneyWithCommas } from '@/utils/formatNumber'

interface Props {
  show: boolean
  agentAccount: string
  payableAmount: number
  dataId: number // 资料 ID
  isMulti?: number // 多层费率类型（默认1）
}

const props = withDefaults(defineProps<Props>(), {
  isMulti: 1,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  confirm: [data: { adjustAmount: number; remark: string }]
  cancel: []
}>()

// 创建可写的 computed 来处理 v-model
const showSheet = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// Form ref
const formRef = ref<FormInstance>()

// 表单数据
const adjustAmount = ref('')
const remark = ref('')

// 自定义验证规则：验证有效数值（正数、负数、0）和小数位数
const validateAmount = (value: string) => {
  if (!value) return true // 空值由 required 规则处理

  // 验证是否为有效数字（支持负数）
  const amount = parseFloat(value)
  if (isNaN(amount)) return false

  // 验证小数点后最多2位
  const decimalMatch = value.match(/\.(\d+)$/)
  if (decimalMatch && decimalMatch[1] && decimalMatch[1].length > 2) return false

  return true
}

// 调整金额验证规则
const adjustAmountRules = [
  { required: true, message: '此项不可为空' },
  {
    validator: validateAmount,
    message: '请输入有效数值，支持小数点后2位'
  }
]

// 关闭弹窗
const closeSheet = () => {
  emit('update:show', false)
  emit('cancel')
  // 重置表单
  formRef.value?.resetValidation()
  adjustAmount.value = ''
  remark.value = ''
}

// 确认调整
const handleConfirm = async () => {
  // 使用 Vant Form 验证
  try {
    await formRef.value?.validate()
  } catch {
    // 验证失败，不继续执行
    return
  }

  const amount = parseFloat(adjustAmount.value)

  try {
    // 显示加载提示
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
    })

    // 调用 API（金额需要转换为分，乘以 100）
    const response = await api.admin.putAdjustCommission({
      Id: props.dataId,
      UserName: props.agentAccount,
      CommissionTotal: props.payableAmount, // 佣金总额（已经是分）
      CommissionChangeAmount: Math.round(amount * 100), // 调整金额，转换为分
      Remark: remark.value,
      IsMulti: props.isMulti,
    })

    // 打印响应结果
    console.log('调整佣金 API 响应:', response)
    console.log('响应数据:', JSON.stringify(response, null, 2))

    // 关闭加载提示
    showToast({
      message: '调整成功',
      position: 'bottom',
    })

    // 发送 confirm 事件
    emit('confirm', {
      adjustAmount: amount,
      remark: remark.value
    })

    // 重置表单
    formRef.value?.resetValidation()
    adjustAmount.value = ''
    remark.value = ''
    emit('update:show', false)
  } catch (error) {
    console.error('调整佣金失败:', error)
    showToast({
      message: `调整失败: ${error}`,
      position: 'bottom',
    })
  }
}
</script>

<template>
  <van-popup
    v-model:show="showSheet"
    position="bottom"
    round
    :overlay="true"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
    :close-on-click-overlay="true"
    :safe-area-inset-bottom="true"
    :style="{ minHeight: '36.9rem', maxHeight: '95vh' }"
    teleport="body"
    :z-index="9999"
  >
    <div class="detail-sheet">
      <!-- 顶部指示器 -->
      <div class="sheet-indicator"></div>

      <!-- 标题栏 -->
      <div class="sheet-header">
        <h3 class="sheet-title">调整佣金</h3>
        <button @click="closeSheet" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 内容区域（可滚动） -->
      <div class="sheet-content">
        <!-- 表单 -->
        <van-form ref="formRef">
          <div class="form-fields">
            <!-- 代理账号（禁止编辑） -->
            <div class="form-field">
              <div class="field-label">
                代理账号<span class="text-error-normal">*</span>
              </div>
              <AppField
                :model-value="agentAccount"
                :disabled="true"
                placeholder="代理账号"
              />
            </div>

            <!-- 应发佣金（禁止编辑） -->
            <div class="form-field">
              <div class="field-label">
                应发佣金<span class="text-error-normal">*</span>
              </div>
              <AppField
                :model-value="formatMoneyWithCommas(payableAmount)"
                :disabled="true"
                placeholder="应发佣金"
              />
            </div>

            <!-- 调整金额（可输入） -->
            <div class="form-field">
              <div class="field-label">
                调整金额<span class="text-error-normal">*</span>
              </div>
              <AppField
                v-model="adjustAmount"
                type="number"
                placeholder="请输入"
                :rules="adjustAmountRules"
              />
            </div>

            <!-- 备注 -->
            <div class="form-field form-field-remark">
              <div class="field-label">备注</div>
              <van-field
                v-model="remark"
                type="textarea"
                placeholder="请输入"
                :maxlength="100"
                show-word-limit
                :rows="4"
              />
            </div>
          </div>
        </van-form>
      </div>

      <!-- 底部按钮 -->
      <div class="sheet-footer">
        <button class="footer-btn cancel-btn" @click="closeSheet">取消</button>
        <button class="footer-btn confirm-btn" @click="handleConfirm">确认</button>
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

/* 内容区域（可滚动） */
.sheet-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

/* 表单字段容器 */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 单个表单字段 */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

/* 字段标签 */
.field-label {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-neutral-basic);
}

/* AppField disabled 状态样式调整 */
:deep(.van-field--disabled) {
  .van-field__body {
    background-color: var(--color-neutral2-seventh) !important;
    border-color: var(--color-neutral2-sixth) !important;
  }

  .van-field__control {
    color: var(--color-neutral-secondary) !important;
    -webkit-text-fill-color: var(--color-neutral-secondary) !important;
  }
}
:deep(.van-cell) {
  padding: 8px 0px;
  background-color: white;
}

/* 备注字段 (van-field textarea) 样式 */
.form-field-remark :deep(.van-field) {
  padding: 0;
}

.form-field-remark :deep(.van-field__body) {
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 16px;
  padding: 12px;
}

.form-field-remark :deep(.van-field__control) {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-neutral-basic);
}

.form-field-remark :deep(.van-field__control::placeholder) {
  color: var(--color-neutral2-fourth);
}

.form-field-remark :deep(.van-field__word-limit) {
  color: var(--color-neutral2-fourth);
  font-size: 12px;
}


/* 底部按钮区域 */
.sheet-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  /* border-top: 1px solid var(--color-neutral2-sixth); */
}

/* 按钮基础样式 */
.footer-btn {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
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
}

.confirm-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
