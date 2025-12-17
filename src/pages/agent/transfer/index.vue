<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import FinanceCard from '@/pages/report/finance/components/financeCard.vue'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar/index.vue'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import Big from 'big.js'
import AppField from '@/components/AppField/index.vue'
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

// 代理账号验证
const validateAgentAccount = (value: string) => {
  if (!value || !value.trim()) {
    return '此项不可为空'
  }
  if (value.length > 20) {
    return '代理账号不可超过20位'
  }
  return true
}

// 代理账号验证规则
const agentAccountRules = [
  { validator: validateAgentAccount }
]

// 转账金额验证
const validateTransferAmount = (value: string) => {
  if (!value || !value.trim()) {
    return '此项不可为空'
  }

  // 字数限制：总字数不可超过12位
  if (value.length > 12) {
    return '转账金额不可超过12位'
  }

  // 正则：必填，大于0的正数，小数点前九后二
  if (!/^(?:\d{1,9})(?:\.\d{0,2})?$/.test(value)) {
    return '请输入大于0的正数，小数点前最多9位，小数点后最多2位'
  }

  const amount = Number(value)

  if (amount <= 0) {
    return '转账金额必须大于0'
  }

  // 只有当 isActive === 1 时才检查金额限制
  if (transferLimitInfo.value.isActive === 1) {
    const { maxAmount, dailyAmount } = transferLimitInfo.value
    if (amount > maxAmount) {
      return `单次转账金额不可大于${maxAmount}`
    }
    // 检查当日限额
    if (amount > dailyAmount) {
      return `转账金额已超过当日限额`
    }
  }

  // 移除钱包余额检查，移至 handleSubmit
  return true
}

// 转账金额验证规则
const amountRules = [
  { validator: validateTransferAmount }
]

// 私人密码验证规则
const privatePasswordRules = [
  { required: true, message: '此项不可为空' },
  {
    validator: (val: string) => {
      if (!val) return true
      if (val.length > 20) {
        return false
      }
      return true
    },
    message: '私人密码不可超过20位'
  }
]

// 备注标签
const remarkTags = ['转账', '测试', '其他']

// 选择备注标签（单选，替换内容）
const selectRemarkTag = (tag: string) => {
  remark.value = tag
}

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

    // 检查钱包余额是否足够
    const amountNum = Number(transferAmount.value)
    if (currentWalletBalance.value < amountNum) {
      showToast({ message: '钱包余额不足，请再次确认', position: 'bottom' })
      return
    }

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
  <div class="deposit-page">
    <!-- 导航栏 -->
    <NavBar title="代理转账" :showDetail="true" @detailClick="goTransferRecord" />

    <!-- 可用金额显示 -->
    <div class="px-3 pb-2 pt-[8px]">
      <FinanceCard
        class="shadow-sm"
        title=""
        :font-size="14"
        :show-arrow="false"
        :show-background-color="false"
        :data="[
          [
            { label: '可用佣金', value: formatMoneyWithCommas(availableCommission, 2, true), highlight: true },
            { label: '可用额度', value: formatMoneyWithCommas(availableQuota, 2, true), highlight: true },
          ]
        ]"
      />
    </div>

    <!-- Tab 切换 -->
    <div class="px-3 py-2">
      <van-tabs
        v-model:active="transferType"
        color="var(--color-primary-normal)"
        title-active-color="var(--color-white)"
        title-inactive-color="var(--color-neutral-secondary)"
        type="card"
      >
        <van-tab title="额度转账" :name="0" />
        <van-tab title="佣金转账" :name="1" />
      </van-tabs>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <van-form @submit="handleSubmit">
        <!-- 代理账号 -->
        <div class="form-field">
          <div class="field-label">
            代理账号<span class="text-error-normal">*</span>
          </div>
          <AppField
            v-model="agentAccount"
            placeholder="请输入"
            :rules="agentAccountRules"
            :maxlength="20"
          />
        </div>

        <!-- 代理金额 -->
        <div class="form-field">
          <div class="field-label">
            转账金额<span class="text-error-normal">*</span>
          </div>
          <AppField
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
          <AppField
            v-model="privatePassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入"
            :rules="privatePasswordRules"
            :maxlength="20"
            label-align="top"
          >
            <template #right-icon>
              <van-icon
                :name="showPassword ? 'eye-o' : 'closed-eye'"
                class="cursor-pointer"
                @click.stop="showPassword = !showPassword"
              />
            </template>
          </AppField>
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
          <div class="remark-tags">
            <button
              v-for="tag in remarkTags"
              :key="tag"
              type="button"
              :class="['remark-tag', remark === tag ? 'remark-tag-active' : '']"
              @click="selectRemarkTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </van-form>

      <!-- 提交按钮 -->
      <div class="submit-container">
        <button
          class="submit-btn"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          提交
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deposit-page {
  min-height: 100vh;
  background-color: white;
  padding-bottom: 80px;
}

/* 导航栏图标 */
.nav-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* 可用金额卡片 */
.balance-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin: 0 16px;
  margin-top: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.balance-item {
  flex: 1;
  text-align: center;
}

.balance-label {
  font-size: 14px;
  color: var(--color-neutral2-secondary);
  margin-bottom: 8px;
}

.balance-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary-normal);
}

/* 无权限提示 */
.no-permission {
  padding: 60px 16px;
  text-align: center;
}

/* Tab 切换 */
:deep(.van-tabs) {
  --van-tabs-card-height: 48px;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;
}

:deep(.van-tabs .van-tabs__nav.van-tabs__nav--card) {
  padding: 0.1875rem;
  border-color: var(--color-neutral2-seventh) !important;
}

:deep(.van-tabs .van-tab--card) {
  border-right: none;
}

:deep(.van-tabs .van-tab.van-tab--card.van-tab--active) {
  border-radius: var(--van-radius-sm);
}

:deep(.van-tab) {
  font-size: 15px;
  font-weight: 400;
}

/* 表单容器 */
.form-container {
  padding: 0 16px;
}

/* 单个表单字段 */
.form-field {
  margin-bottom: 16px;
}

/* 批量输入提示 */
.batch-input-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-error-normal);
}

/* 字段标签 */
.field-label {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-neutral-basic);
  margin-bottom: 8px;
}

/* 字段提示 */
.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-primary-normal);
}

/* 快捷按钮 */
.quick-btns {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.quick-btn {
  width: 64px;
  height: 36px;
  border-radius: 18px;
  font-size: 14px;
  border: 1px solid var(--color-primary-normal);
  background: white;
  color: var(--color-primary-normal);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn.active {
  background: var(--color-primary-normal);
  color: white;
}



/* 备注字段 */
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
  position: absolute;
  bottom: 8px;
  right: 12px;
  color: var(--color-neutral2-fourth);
  font-size: 12px;
}

/* 批量输入会员账号样式 */
.form-field-batch-member-account :deep(.van-field) {
  padding: 0;
}

.form-field-batch-member-account :deep(.van-field__body) {
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 16px;
  padding: 12px;
}

.form-field-batch-member-account :deep(.van-field__control) {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-neutral-basic);
}

.form-field-batch-member-account :deep(.van-field__control::placeholder) {
  color: var(--color-neutral2-fourth);
}

.form-field-batch-member-account :deep(.van-field__word-limit) {
  position: absolute;
  bottom: 8px;
  right: 12px;
  color: var(--color-neutral2-fourth);
  font-size: 12px;
}

/* 备注标签 */
.remark-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.remark-tag {
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid var(--color-primary-normal);
  background: white;
  color: var(--color-primary-normal);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remark-tag:active {
  background: var(--color-primary-5);
}

.remark-tag-active {
  background: var(--color-primary-normal);
  color: white;
}

/* 提交按钮容器 */
.submit-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: var(--color-primary-normal); /* 启用时蓝色 */
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.submit-btn:disabled {
  background: var(--color-neutral2-fifth); /* 禁用时灰色 */
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none; /* 禁用时完全不可点击 */
}

.submit-btn:disabled:active {
  transform: none;
  opacity: 0.5;
}

/* Radio 样式调整 */
:deep(.van-radio-group) {
  display: flex;
  gap: 24px;
}

:deep(.van-radio) {
  height: 48px;
  margin-bottom: 0;
}

:deep(.van-radio__label) {
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-neutral-basic);
}

:deep(.van-radio__icon--checked .van-icon) {
  background-color: var(--color-primary-normal);
  border-color: var(--color-primary-normal);
}

:deep(.van-cell) {
  padding: 8px 0px;
  background-color: transparent;
}

/* 表单 Dropdown 样式 */
.form-field :deep(.dropdown-button) {
  font-size: 16px !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

.form-field :deep(.dropdown-button svg) {
  width: 20px !important;
  height: 20px !important;
}
</style>
