<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import FinanceCard from '@/pages/report/finance/components/financeCard.vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'vant'
import AppField from '@/components/AppField/index.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import { formatMoneyWithCommas } from '@/utils/formatNumber'
import API from '@/apis'
import Big from 'big.js'

const router = useRouter()
const route = useRoute()

// 用户权限和信息
const userStore = useUserStore()
const { agentCreditLimitPermission, productPackages, isSingleAgent, commissionWalletBalance, creditWalletBalance, depositLimitInfo: depositLimitInfo_store } = storeToRefs(userStore)

// Tab 类型常量
const SUB_TAB_TYPE = {
  CREDIT: 0, // 额度代存
  COMMISSION: 1 // 佣金代存
}

// 充值类型常量
const TRANSFER_TYPE = {
  DEPOSIT: 2, // 代存
  BONUS: 10 // 红利
}

// Tab 选项（根据权限动态生成）
const tabOptions = ref<Array<{ id: number; title: string }>>([])

// Tab 切换：0-额度代存，1-佣金代存
const activeTab = ref(0)

// 从 store 获取余额和代存限额信息
const availableCommission = computed(() => commissionWalletBalance.value)
const availableQuota = computed(() => creditWalletBalance.value)
const depositLimitInfo = computed(() => depositLimitInfo_store.value || {
  minAmount: 0,
  maxAmount: 0,
  dailyAmount: 0,
  maxWithdrawMultiple: 1,
  isActive: 0,
  isShowMultiple: 0,
})

// 充值类型选项（根据当前 Tab 和权限动态生成）
const depositTypeOptions = ref<Array<{ label: string; value: number }>>([])
const depositType = ref<number | null>(null)

// 充值方式：0-单一，1-批量输入
const depositMethod = ref(0)

// 会员账号
const memberAccount = ref('')

// 产品包选项（从 store 获取）
const productOptions = computed(() => {
  if (!productPackages.value) return []
  return productPackages.value.map(pkg => ({
    label: pkg.PackageName || '',
    value: pkg.PackageId || 0
  }))
})
const selectedProduct = ref<number | null>(null)

// 自动设置默认产品包
watch(productOptions, (options) => {
  if (options.length > 0 && !selectedProduct.value && options[0]) {
    selectedProduct.value = options[0].value
  }
}, { immediate: true })

// 代存金额
const depositAmount = ref('')

// 提现流水倍数
const withdrawMultiple = ref('')

// 快捷倍数选项（根据最大流水倍数动态过滤）
const quickMultiples = computed(() => {
  const options = [1, 3, 5]
  return options.filter(m => m <= depositLimitInfo.value.maxWithdrawMultiple)
})

// 私人密码
const privatePassword = ref('')
const showPassword = ref(false)

// 备注
const remark = ref('')

// 备注标签
const remarkTags = ['代存', '福利', '首存福利', '其他']

// Form ref
const formRef = ref<FormInstance>()

onMounted(() => {
  if (route.query.memberAccount) {
    memberAccount.value = route.query.memberAccount as string
  }
  // 每次进入都重新获取权限和余额信息（因为后台设定可能调整，没有 socket 通知）
  userStore.fetchAgentCreditLimitPermission()
  userStore.fetchUserBalancesAndLimits()
})

watch(productPackages, (packages) => {
  if (!packages || packages.length === 0) return

  const packageNameFromQuery = route.query.packageName as string
  if (packageNameFromQuery) {
    const foundPackage = packages.find(p => p.PackageName === packageNameFromQuery)
    if (foundPackage) {
      selectedProduct.value = foundPackage.PackageId
    }
  }
}, { immediate: true })


// 查看历史记录
const handleViewHistory = () => {
  router.push({ name: 'agentDepositRecord' })
}

// 选择快捷倍数
const selectQuickMultiple = (multiple: number) => {
  withdrawMultiple.value = String(multiple)
}

// 选择备注标签（单选，替换内容）
const selectRemarkTag = (tag: string) => {
  remark.value = tag
}

// 提交按钮是否禁用（有必填栏位空值时禁用）
const isSubmitDisabled = computed(() => {
  return !memberAccount.value ||
    !depositAmount.value ||
    !withdrawMultiple.value ||
    !privatePassword.value ||
    !depositType.value ||
    !selectedProduct.value
})

// 解析批量账号
const parseToArray = (str: string): string[] => {
  if (!str) return []
  return str.split(/,|;/).filter(item => item.trim())
}

// 表单验证
const validateMemberAccount = (value: string) => {
  if (!value || !value.trim()) {
    return '此项不可为空'
  }

  // 字数限制
  if (depositMethod.value === 0) {
    // 单一模式：最多20位
    if (value.length > 20) {
      return '会员账号不可超过20位'
    }
  } else {
    // 批量模式：最多1600位
    if (value.length > 1600) {
      return '会员账号不可超过1600位'
    }

    // 批量输入：检查重复
    const accountList = parseToArray(value)
    const accountSet = new Set(accountList)
    if (accountList.length !== accountSet.size) {
      return '会员账号不可重复'
    }
  }

  return true
}

const validateDepositAmount = (value: string) => {
  if (!value || !value.trim()) {
    return '此项不可为空'
  }

  // 字数限制：总字数不可超过12位
  if (value.length > 12) {
    return '代存金额不可超过12位'
  }

  // 正则：必填，大于0的正数，小数点前九后二
  if (!/^(?:\d{1,9})(?:\.\d{0,2})?$/.test(value)) {
    return '请输入大于0的正数，小数点前最多9位，小数点后最多2位'
  }

  const amount = Number(value)

  // 检查是否大于0
  if (amount <= 0) {
    return '代存金额必须大于0'
  }

  // 只有当 isActive === 1 时才检查金额限制
  if (depositLimitInfo.value.isActive === 1) {
    const { maxAmount, dailyAmount } = depositLimitInfo.value

    // 检查单次代存金额上限
    if (amount > maxAmount) {
      return `单次代存金额不可大于${maxAmount}`
    }

    // 检查当日限额（注：这里只是格式验证，实际当日已用额度需要在提交时由后端验证）
    if (amount > dailyAmount) {
      return `代存金额已超过当日限额`
    }
  }

  return true
}

const validateWithdrawMultiple = (value: string) => {
  if (!value || !value.trim()) {
    return '此项不可为空'
  }

  // 字数限制：总字数不可超过12位
  if (value.length > 12) {
    return '提现流水倍数不可超过12位'
  }

  // 必须是正整数
  if (!/^\d+$/.test(value)) {
    return '仅可输入数字'
  }

  const num = Number(value)
  const maxMultiple = depositLimitInfo.value.maxWithdrawMultiple

  // 检查范围：必须大于0且不超过最大值
  if (num < 1 || num > maxMultiple) {
    return `提现流水倍数不可小于1大于${maxMultiple}`
  }

  return true
}

// 根据权限生成 Tab 选项
const generateTabOptions = () => {
  const tabs: Array<{ id: number; title: string }> = []
  if (!agentCreditLimitPermission.value) return tabs

  const { CommissionGold, CreditGold, CreditRed } = agentCreditLimitPermission.value

   // 如果有额度代存或额度红利权限，显示"额度代存"
  if (CreditGold || CreditRed) {
    tabs.push({ id: SUB_TAB_TYPE.CREDIT, title: '额度代存' })
  }

  // 如果有佣金代存权限，显示"佣金代存"
  if (CommissionGold) {
    tabs.push({ id: SUB_TAB_TYPE.COMMISSION, title: '佣金代存' })
  }

  return tabs
}

// 根据当前 Tab 和权限生成充值类型选项
const generateDepositTypeOptions = () => {
  const options: Array<{ label: string; value: number }> = []
  if (!agentCreditLimitPermission.value) return options

  const { CommissionGold, CreditGold, CreditRed } = agentCreditLimitPermission.value

  // 根据当前 Tab 决定显示哪些充值类型
  if (activeTab.value === SUB_TAB_TYPE.COMMISSION) {
    // 佣金代存：只有代存选项
    if (CommissionGold) {
      options.push({ label: '代存', value: TRANSFER_TYPE.DEPOSIT })
    }
  } else if (activeTab.value === SUB_TAB_TYPE.CREDIT) {
    // 额度代存：代存 + 红利
    if (CreditGold) {
      options.push({ label: '代存', value: TRANSFER_TYPE.DEPOSIT })
    }
    if (CreditRed) {
      options.push({ label: '红利', value: TRANSFER_TYPE.BONUS })
    }
  }

  return options
}

// 初始化 Tab 选项
const initTabOptions = () => {
  tabOptions.value = generateTabOptions()

  // 设置默认 Tab
  if (tabOptions.value.length > 0 && tabOptions.value[0]) {
    activeTab.value = tabOptions.value[0].id
  }
}

// 更新充值类型选项
const updateDepositTypeOptions = () => {
  depositTypeOptions.value = generateDepositTypeOptions()

  // 设置默认充值类型
  if (depositTypeOptions.value.length > 0 && depositTypeOptions.value[0]) {
    depositType.value = depositTypeOptions.value[0].value
  } else {
    depositType.value = null
  }
}

// 监听 activeTab 变化，更新充值类型选项
watch(activeTab, () => {
  updateDepositTypeOptions()
})

// 监听权限变化
watch(agentCreditLimitPermission, () => {
  initTabOptions()
  updateDepositTypeOptions()
}, { immediate: true })


// 表单验证规则
const amountRules = [
  { required: true, message: '此项不可为空' },
]

const multipleRules = computed(() => [
  { required: true, message: '此项不可为空' },
  {
    validator: (val: string) => {
      // 检查是否为空
      if (!val) return true // required 规则会处理

      // 检查是否为正整数
      const num = Number(val)
      if (!Number.isInteger(num) || num <= 0) {
        return false
      }

      // 检查是否超过最大值
      if (num > depositLimitInfo.value.maxWithdrawMultiple) {
        return false
      }

      // 检查字数不超过12位
      if (val.length > 12) {
        return false
      }

      return true
    },
    message: `提现流水倍数不可小于1大于${depositLimitInfo.value.maxWithdrawMultiple}`
  }
])

const passwordRules = [
  { required: true, message: '此项不可为空' },
  {
    validator: (val: string) => {
      if (!val) return true // required 规则会处理

      // 字数限制：总字数不可超过20位
      if (val.length > 20) {
        return false
      }

      return true
    },
    message: '私人密码不可超过20位'
  }
]

const memberAccountRules = [
  { validator: validateMemberAccount }
]

// 提交表单
const handleSubmit = async () => {
  // 如果按钮被禁用，不执行提交
  if (isSubmitDisabled.value) {
    return
  }

  try {
    // 验证表单
    const memberAccountValid = validateMemberAccount(memberAccount.value)
    if (memberAccountValid !== true) {
      showToast({ message: memberAccountValid, position: 'bottom' })
      return
    }

    const amountValid = validateDepositAmount(depositAmount.value)
    if (amountValid !== true) {
      showToast({ message: amountValid, position: 'bottom' })
      return
    }

    const multipleValid = validateWithdrawMultiple(withdrawMultiple.value)
    if (multipleValid !== true) {
      showToast({ message: multipleValid, position: 'bottom' })
      return
    }

    if (!privatePassword.value) {
      showToast({ message: '请输入私人密码', position: 'bottom' })
      return
    }

    if (!depositType.value) {
      showToast({ message: '请选择充值类型', position: 'bottom' })
      return
    }

    if (!selectedProduct.value) {
      showToast({ message: '请选择产品包', position: 'bottom' })
      return
    }

    // 检查钱包余额是否足够
    const amount = Number(depositAmount.value)
    const currentBalance = activeTab.value === SUB_TAB_TYPE.CREDIT
      ? availableQuota.value
      : availableCommission.value

    if (currentBalance < amount) {
      showToast({ message: '钱包余额不足，请再次确认', position: 'bottom' })
      return
    }

    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
    })

    // 计算 WalletType：额度代存(0) -> 2, 佣金代存(1) -> 1
    const walletType = activeTab.value === SUB_TAB_TYPE.CREDIT ? 2 : 1

    // 计算 IsMultiLevel：单层代理=1，多层代理=2
    const isMultiLevel = isSingleAgent.value ? 1 : 2

    // 准备API参数
    const params = {
      TransferType: depositType.value,
      ReferenceAccount: memberAccount.value,
      PackageId: selectedProduct.value,
      Amount: new Big(depositAmount.value).times(100).toNumber(), // 转换为分
      DisplayAmount: Number(depositAmount.value),
      WithdrawWaterMultiply: Number(withdrawMultiple.value),
      PayPassword: privatePassword.value,
      Remarks: remark.value || '',
      WalletType: walletType,
      IsSendNotification: 0,
      IsMultiLevel: isMultiLevel,
      IsBatch: depositMethod.value
    }

    // 调用 API
    const response = await API.admin.postAgentCreditLimitTransactionInsert(params)

    // 处理响应
    switch (response.data.Code) {
      case 200:
        if (response.data.Data?.FailAccounts && response.data.Data.FailAccounts.length > 0) {
          // 有失败的账号
          const failCount = response.data.Data.FailCount || 0
          const successCount = response.data.Data.SuccessCount || 0
          showToast({
            message: `成功: ${successCount}, 失败: ${failCount}`,
            position: 'bottom',
            duration: 3000
          })
        } else {
          // 全部成功
          showToast({
            message: '操作成功',
            position: 'bottom',
          })
        }

        // 重置表单
        formRef.value?.resetValidation()
        depositAmount.value = ''
        withdrawMultiple.value = ''
        privatePassword.value = ''
        remark.value = ''
        memberAccount.value = ''
        break

      case 10196:
      case 10002:
        showToast({ message: '会员不存在，请再次确认', position: 'bottom' })
        break

      case 21007:
      case 21003:
        showToast({ message: '代存金额已超过当日限额', position: 'bottom' })
        break

      case 10217:
        showToast({ message: '代存金额错误', position: 'bottom' })
        break

      case 21015:
        showToast({ message: '此为测试账号，无法操作', position: 'bottom' })
        break

      case 21018:
        showToast({
          message: `${memberAccount.value} 1分钟内不可再次转账，请稍后再试！`,
          position: 'bottom',
        })
        break

      case 10529:
        showToast({ message: '私人密码错误，请再次确认', position: 'bottom' })
        privatePassword.value = ''
        break

      default:
        showToast({
          message: response.data.Msg || '操作失败',
          position: 'bottom',
        })
        break
    }
  } catch (error) {
    console.error('提交失败:', error)
    showToast({
      message: '提交失败，请稍后重试',
      position: 'bottom',
    })
  }
}
</script>

<template>
  <div class="deposit-page">
    <!-- 导航栏 -->
    <NavBar title="代理代存" :showDetail="true" @detailClick="handleViewHistory" />

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

    <!-- Tab 切换（只在有多个选项时显示） -->
    <div v-if="tabOptions.length > 1" class="px-3 py-2">
      <van-tabs
        v-model:active="activeTab"
        color="var(--color-primary-normal)"
        title-active-color="var(--color-white)"
        title-inactive-color="var(--color-neutral-secondary)"
        type="card"
      >
        <van-tab v-for="tab in tabOptions" :key="tab.id" :title="tab.title" :name="tab.id" />
      </van-tabs>
    </div>

    <!-- 无权限提示 -->
    <div v-if="tabOptions.length === 0" class="no-permission">
      <empty description="暂无代存权限" />
    </div>

    <!-- 表单内容 -->
    <div v-else class="form-container">
      <van-form ref="formRef">
        <!-- 充值类型 -->
        <div class="form-field">
          <div class="field-label">
            充值类型<span class="text-error-normal">*</span>
          </div>
          <Dropdown
            v-model="depositType"
            :options="depositTypeOptions"
            placeholder="请选择"
            height="48px"
          />
        </div>

        <!-- 充值方式 -->
        <div class="form-field">
          <div class="field-label">
            充值方式<span class="text-error-normal">*</span>
          </div>
          <van-radio-group v-model="depositMethod" direction="horizontal">
            <van-radio :name="0">单一</van-radio>
            <van-radio :name="1">批量输入</van-radio>
          </van-radio-group>
        </div>

        <!-- 会员账号 - 单一 -->
        <div v-if="depositMethod === 0" class="form-field">
          <div class="field-label">
            会员账号<span class="text-error-normal">*</span>
          </div>
          <AppField
            v-model="memberAccount"
            placeholder="请输入"
            :rules="memberAccountRules"
            :maxlength="20"
            autocomplete="new-password"
          />
        </div>

        <!-- 会员账号 - 批量输入 -->
        <div v-else class="form-field form-field-batch-member-account">
          <div class="field-label">
            会员账号<span class="text-error-normal">*</span>
          </div>
          <van-field
            v-model="memberAccount"
            type="textarea"
            placeholder="请输入"
            :maxlength="1600"
            show-word-limit
            :rows="4"
            :autosize="{ minHeight: 100 }"
            autocomplete="new-password"
          />
          <div class="batch-input-hint">
            注：多账号用逗号或分号分隔，最多1600个字符
          </div>
        </div>

        <!-- 产品包 -->
        <div class="form-field">
          <div class="field-label">
            产品包<span class="text-error-normal">*</span>
          </div>
          <Dropdown
            v-model="selectedProduct"
            :options="productOptions"
            placeholder="请选择"
            height="48px"
          />
        </div>

        <!-- 代存金额 -->
        <div class="form-field">
          <div class="field-label">
            代存金额<span class="text-error-normal">*</span>
          </div>
          <AppField
            v-model="depositAmount"
            type="text"
            placeholder="请输入"
            maxlength="12"
            :rules="amountRules"
            autocomplete="new-password"
          />
          <div v-if="depositLimitInfo.isActive === 1" class="field-hint">
            单次转账金额 {{ depositLimitInfo.minAmount }}~{{ depositLimitInfo.maxAmount }} / 当日限额 {{ depositLimitInfo.dailyAmount }}
          </div>
        </div>

        <!-- 提现流水倍数 -->
        <div class="form-field">
          <div class="field-label">
            提现流水倍数<span class="text-error-normal">*</span>
          </div>
          <AppField
            v-model="withdrawMultiple"
            type="number"
            :placeholder="'请输入1~' + depositLimitInfo.maxWithdrawMultiple"
            :rules="multipleRules"
            :maxlength="12"
            autocomplete="new-password"
          />
          <div v-if="false" class="field-hint">
            1≤流水倍数≤{{ depositLimitInfo.maxWithdrawMultiple }}
          </div>
          <div class="quick-btns">
            <button
              v-for="multiple in quickMultiples"
              :key="multiple"
              type="button"
              :class="['quick-btn', { active: withdrawMultiple === String(multiple) }]"
              @click="selectQuickMultiple(multiple)"
            >
              {{ multiple }}
            </button>
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
            :rules="passwordRules"
            :maxlength="20"
            label-align="top"
            autocomplete="new-password"
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
            autocomplete="new-password"
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
          :disabled="isSubmitDisabled"
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
