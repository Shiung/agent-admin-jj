<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'

interface FailAccount {
  Account: string
  ErrCode: number
}

interface ResultData {
  FailAccounts?: FailAccount[]
  FailCount?: number
  SuccessCount?: number
  PackageName?: string
}

interface Props {
  show: boolean
  resultData: ResultData
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  resultData: () => ({})
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const { copy } = useClipboard()

// 计算属性
const packageName = computed(() => props.resultData?.PackageName || '')
const totalCount = computed(() => (props.resultData?.FailCount || 0) + (props.resultData?.SuccessCount || 0))
const failCount = computed(() => props.resultData?.FailCount || 0)
const successCount = computed(() => props.resultData?.SuccessCount || 0)

const failAccounts = computed(() => {
  if (!props.resultData?.FailAccounts || props.resultData.FailAccounts.length === 0) return ''

  // 使用 Map 来分组 ErrCode
  const errorAccountsMap = new Map<number, string[]>()

  props.resultData.FailAccounts.forEach(account => {
    if (!errorAccountsMap.has(account.ErrCode)) {
      errorAccountsMap.set(account.ErrCode, [])
    }
    errorAccountsMap.get(account.ErrCode)!.push(account.Account)
  })

  // 组合显示字符串
  let result = ''
  errorAccountsMap.forEach((accounts, errCode) => {
    if (errCode === 21018) {
      result += `${accounts.join(', ')}\n1分钟内不可再次转账，请稍后再试！\n\n`
    } else if (errCode === 10140) {
      result += `${accounts.join(', ')}\n会员不存在，请再次确认\n\n`
    } else {
      result += `${accounts.join(', ')}\n转账失败，错误码：${errCode}，请稍后再试！\n\n`
    }
  })

  return result.trim()
})

// 关闭弹窗
const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

// 复制失败账号
const handleCopy = () => {
  if (!failAccounts.value) return
  copy(failAccounts.value)
  showToast({ message: '已复制到剪贴板', position: 'bottom' })
}
</script>

<template>
  <van-popup
    :show="show"
    position="center"
    round
    :close-on-click-overlay="false"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
    :style="{ width: '85%', maxWidth: '400px', borderRadius: '16px' }"
    @update:show="handleClose"
  >
    <div class="result-dialog">
      <!-- 标题 -->
      <div class="dialog-header">
        <h3 class="dialog-title">{{ packageName }} 发送结果</h3>
        <van-icon name="cross" size="20" @click="handleClose" />
      </div>

      <!-- 统计卡片 -->
      <div class="stats-container">
        <div class="stat-card stat-total">
          <div class="stat-label">发送总数</div>
          <div class="stat-value">{{ totalCount }}</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-label">成功个数</div>
          <div class="stat-value">{{ successCount }}</div>
        </div>
        <div class="stat-card stat-fail">
          <div class="stat-label">失败个数</div>
          <div class="stat-value">{{ failCount }}</div>
        </div>
      </div>

      <!-- 失败账号列表 -->
      <div class="fail-accounts-section">
        <div class="section-title">未成功的会员账号</div>
        <textarea
          class="fail-accounts-textarea"
          :value="failAccounts"
          readonly
          :rows="8"
        />
      </div>

      <!-- 复制按钮 -->
      <div class="dialog-footer">
        <van-button
          type="primary"
          size="normal"
          round
          @click="handleCopy"
        >
          复制
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.result-dialog {
  padding: 20px;
  background: white;
}

/* 标题栏 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-neutral-basic);
  margin: 0;
}

.dialog-header .van-icon {
  color: var(--color-neutral-secondary);
  cursor: pointer;
}

/* 统计卡片 */
.stats-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  padding: 12px 8px;
  border-radius: 8px;
  text-align: center;
}

.stat-total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-success {
  background: linear-gradient(135deg, #72c240 0%, #5a9e32 100%);
}

.stat-fail {
  background: linear-gradient(135deg, #f22a2a 0%, #d41f1f 100%);
}

.stat-label {
  font-size: 12px;
  color: white;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

/* 失败账号列表 */
.fail-accounts-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  color: var(--color-neutral-secondary);
  margin-bottom: 8px;
}

.fail-accounts-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 8px;
  background-color: #f9f9f9;
  font-size: 14px;
  color: var(--color-neutral-basic);
  resize: none;
  font-family: inherit;
}

.fail-accounts-textarea:focus {
  outline: none;
  border-color: var(--color-primary-normal);
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: center;
}

.dialog-footer .van-button {
  min-width: 120px;
}
</style>
