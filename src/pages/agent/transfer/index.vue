<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import Big from 'big.js'
import API from '@/apis'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 从路由参数获取余额
const availableCommission = ref(Number(route.query.commission) || 0)
const availableQuota = ref(Number(route.query.credit) || 0)

// 从路由参数获取转账限额信息
const transferLimitInfo = ref({
  minAmount: Number(route.query.minAmount) || 0,
  maxAmount: Number(route.query.maxAmount) || 0,
  dailyAmount: Number(route.query.dailyAmount) || 0,
  isActive: Number(route.query.isActive) || 0,
})

// 转账类型：0=额度转账, 1=佣金转账
const transferType = ref(0)

// 表单字段
const agentAccount = ref('')
const transferAmount = ref('')
const privatePassword = ref('')
const remark = ref('')

// 密码显示/隐藏
const showPassword = ref(false)

// 返回上一页
const handleBack = () => {
  router.back()
}

// 跳转到转账记录
const goTransferRecord = () => {
  router.push({ name: 'agentTransferRecord' })
}

// 获取当前选中钱包的余额
const currentWalletBalance = computed(() => {
  return transferType.value === 0 ? availableQuota.value : availableCommission.value
})

// 获取当前选中钱包的名称
const currentWalletName = computed(() => {
  return transferType.value === 0 ? '额度钱包' : '佣金钱包'
})

// 代理账号验证规则
const agentAccountRules = [
  {
    required: true,
    message: '此项不可为空'
  }
]

// 转账金额验证
const validateTransferAmount = (value: string) => {
  if (!value || !value.trim()) {
    return '此项不可为空'
  }

  // 正则：必填，大于0的正数，小数点前九后二，总字数不可超过12位
  if (!/^(?:\d{1,9})(?:\.\d{0,2})?$/.test(value)) {
    return '请输入大于0的正数，小数点前最多9位，小数点后最多2位'
  }

  const amount = Number(value)

  if (amount <= 0) {
    return '转账金额必须大于0'
  }

  // 只有当 isActive === 1 时才检查金额限制
  if (transferLimitInfo.value.isActive === 1) {
    const { maxAmount } = transferLimitInfo.value
    if (amount > maxAmount) {
      return `单次转账金额不可大于${maxAmount}`
    }
  }

  // 检查余额是否足够
  if (amount > currentWalletBalance.value) {
    return '钱包余额不足'
  }

  return true
}

// 转账金额验证规则
const amountRules = [
  { validator: validateTransferAmount }
]

// 私人密码验证规则
const privatePasswordRules = [
  {
    required: true,
    message: '此项不可为空'
  }
]

// 备注字符计数
const remarkLength = computed(() => remark.value.length)

// 表单是否可提交
const canSubmit = computed(() => {
  return (
    agentAccount.value.trim() !== '' &&
    transferAmount.value.trim() !== '' &&
    privatePassword.value.trim() !== '' &&
    validateTransferAmount(transferAmount.value) === true
  )
})

// 提交表单
const handleSubmit = async () => {
  if (!canSubmit.value) {
    return
  }

  try {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0
    })

    // 准备API参数
    const amount = new Big(transferAmount.value).times(100).toNumber()
    const accountType = userInfo.value?.NetCashAccount?.AccountType || 1

    const params = {
      ReferenceAccount: agentAccount.value,
      DisplayAmount: transferAmount.value,
      Amount: amount,
      PayPassword: privatePassword.value,
      Remarks: remark.value,
      WalletType: transferType.value === 0 ? 2 : 1, // 0=额度转账->WalletType=2, 1=佣金转账->WalletType=1
      TransferType: 1, // 固定为1（转账），2=代存
      IsMultiLevel: accountType === 1 ? 1 : 2 // 1=单层代理, 2=多层代理
    }

    const response = await API.admin.postAgentCreditLimitTransactionInsert(params)

    if (response.data.Code === 200) {
      showToast({
        message: '操作成功',
        position: 'bottom'
      })

      // 延迟返回上一页
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      // 处理错误代码
      let errorMessage = response.data.Msg || '转账失败'

      if (response.data.Code === 10002) {
        errorMessage = '代理不存在'
      } else if (response.data.Code === 10196) {
        errorMessage = response.data.Msg || '代理不在此团队下，请重新输入'
      } else if (response.data.Code === 10155) {
        errorMessage = '此代理已停用'
      } else if (response.data.Code === 10217) {
        errorMessage = '转账金额错误'
      } else if (response.data.Code === 21003) {
        errorMessage = '转账金额已超过当日限额'
      }

      showToast({
        message: errorMessage,
        position: 'bottom'
      })
    }
  } catch (error) {
    console.error('转账失败:', error)
    showToast({
      message: '转账失败，请稍后重试',
      position: 'bottom'
    })
  }
}
</script>

<template>
  <div class="transfer-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="代理转账"
      left-arrow
      @click-left="handleBack"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="records" size="20" @click="goTransferRecord" />
      </template>
    </van-nav-bar>

    <!-- 余额卡片 -->
    <div class="balance-card">
      <div class="balance-item">
        <div class="balance-label">可用佣金</div>
        <div class="balance-value">{{ formatMoneyWithComma(availableCommission) }}</div>
      </div>
      <div class="balance-item">
        <div class="balance-label">可用额度</div>
        <div class="balance-value">{{ formatMoneyWithComma(availableQuota) }}</div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="transfer-tabs">
      <button
        :class="['tab-btn', { active: transferType === 0 }]"
        @click="transferType = 0"
      >
        额度转账
      </button>
      <button
        :class="['tab-btn', { active: transferType === 1 }]"
        @click="transferType = 1"
      >
        佣金转账
      </button>
    </div>

    <!-- 表单 -->
    <van-form @submit="handleSubmit" class="transfer-form">
      <!-- 代理账号 -->
      <div class="form-field">
        <div class="field-label">
          代理账号<span class="text-error-normal">*</span>
        </div>
        <van-field
          v-model="agentAccount"
          placeholder="请输入"
          :rules="agentAccountRules"
        />
      </div>

      <!-- 代理金额 -->
      <div class="form-field">
        <div class="field-label">
          代理金额<span class="text-error-normal">*</span>
        </div>
        <van-field
          v-model="transferAmount"
          type="text"
          placeholder="请输入"
          maxlength="12"
          :rules="amountRules"
        />
        <div v-if="transferLimitInfo.isActive === 1" class="field-hint">
          单次转账金额 {{ transferLimitInfo.minAmount }}-{{ transferLimitInfo.maxAmount }} / 当日限额 {{ transferLimitInfo.dailyAmount }}
        </div>
      </div>

      <!-- 私人密码 -->
      <div class="form-field">
        <div class="field-label">
          私人密码<span class="text-error-normal">*</span>
        </div>
        <van-field
          v-model="privatePassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入"
          :rules="privatePasswordRules"
        >
          <template #right-icon>
            <van-icon
              :name="showPassword ? 'eye-o' : 'closed-eye'"
              @click="showPassword = !showPassword"
            />
          </template>
        </van-field>
      </div>

      <!-- 备注 -->
      <div class="form-field">
        <div class="field-label">备注</div>
        <van-field
          v-model="remark"
          type="textarea"
          placeholder="请输入"
          maxlength="100"
          rows="4"
          show-word-limit
        />
      </div>

      <!-- 提交按钮 -->
      <div class="submit-wrapper">
        <van-button
          type="primary"
          block
          round
          native-type="submit"
          :disabled="!canSubmit"
          class="submit-btn"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.transfer-page {
  min-height: 100vh;
  background-color: var(--color-bg-floor-1-2);
  padding-bottom: 20px;
}

/* 余额卡片 */
.balance-card {
  display: flex;
  gap: 8px;
  margin: 12px 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: -0.5px 0.5px 3px 0px rgba(0, 0, 0, 0.15);
}

.balance-item {
  flex: 1;
  padding: 12px;
  background: var(--color-bg-floor-1-2);
  border-radius: 16px;
  text-align: center;
}

.balance-label {
  font-size: 12px;
  line-height: 20px;
  color: var(--color-neutral-basic);
  margin-bottom: 4px;
}

.balance-value {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: var(--color-primary-normal);
}

/* Tab切换 */
.transfer-tabs {
  display: flex;
  gap: 8px;
  margin: 0 16px 16px;
}

.tab-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  background: white;
  color: var(--color-neutral-basic);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: var(--color-primary-normal);
  color: white;
}

/* 表单 */
.transfer-form {
  background: white;
  margin: 0 16px;
  padding: 16px;
  border-radius: 12px;
}

.form-field {
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  color: var(--color-neutral-basic);
  margin-bottom: 8px;
}

.field-hint {
  font-size: 12px;
  color: var(--color-primary-normal);
  margin-top: 4px;
}

:deep(.van-field) {
  padding: 12px;
  background: var(--color-bg-floor-1-2);
  border-radius: 8px;
}

:deep(.van-field__control) {
  font-size: 14px;
  color: var(--color-neutral-basic);
}

:deep(.van-field__control::placeholder) {
  color: var(--color-neutral2-tertiary);
}

:deep(.van-field__right-icon) {
  color: var(--color-neutral2-secondary);
}

/* 提交按钮 */
.submit-wrapper {
  margin-top: 24px;
}

.submit-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.submit-btn:disabled {
  background: var(--color-neutral2-sixth);
  color: var(--color-neutral2-tertiary);
  border: none;
}
</style>
