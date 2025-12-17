<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { getWithdrawAccountType, getWithdrawAccountName } from '@/utils/finance'
import { rulesRequired, rulesPositiveIntegerNumber } from '@/utils/formRules'
import Big from 'big.js'
import API from '@/apis'

import PayTypeList, { type ListItem } from '../components/payTypeList.vue'
import AccountList, { type AccountListItem } from '../components/accountList.vue'
import DDWallet from '../components/ddWallet.vue'
import WithdrawConfirmPopup from '../components/withdrawConfirmPopup.vue'
import { type FormInstance } from 'vant'

const userStore = useUserStore()

/** 選中的提現方式 */
const selectPayTypeItem = ref<ListItem | null>(null)
/** 選中的帳號 */
const selectAccountItem = ref<AccountListItem | null>(null)

/** 提現通道列表 */
const withdrawList = ref<ListItem[]>([])
/** 虛擬幣協議轉換名稱用 */
const currencyNameMap = ref<Record<string, { [key: string]: any }[]>>({})
const fetchWithdrawList = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.finance.getWithdrawAllowedList()
    if (res.data.Code !== 200) return
    withdrawList.value = res.data.Data.Items.sort((a, b) => a.Sort - b.Sort)
    currencyNameMap.value = res.data.Data.currencyNameMap
    if (!withdrawList.value[0]) return
    handleChangeType(withdrawList.value[0])
  } finally {
    loading.close()
  }
}
const handleChangeType = (item: ListItem) => {
  selectPayTypeItem.value = item
  fetchAccountList()
  fetchAppliedAmount()
  if (selectPayTypeItem.value.CurrencyName === 'USDT') {
    fetchUSDTRate()
  }
  formData.value = initFormData()
}
const isCrypto = computed(() => {
  return !!selectPayTypeItem.value?.IsCrypto
})
const isDDWallet = computed(() => {
  return selectPayTypeItem.value?.PayType === 17
})

/** 帳號列表 */
const accountList = ref<AccountListItem[]>([])
/** 取得銀行卡/支付寶帳號列表 or 虛擬幣帳號列表 */
const fetchAccountList = async () => {
  if (!selectPayTypeItem.value) return
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  accountList.value = []
  const Type = getWithdrawAccountType(selectPayTypeItem.value.PayType)
  try {
    const res = isCrypto.value ?
      await API.finance.getCryptoAccountList({ DigitalType: Type }) :
      await API.finance.getBankCardAccountList({ Type: Type })
    if (res.data.Code !== 200) return
    accountList.value = res.data.Data.Items
    if (!accountList.value[0]) return
    handleChangeAccount(accountList.value[0])
  } finally {
    loading.close()
  }
}
const handleChangeAccount = (item: AccountListItem) => {
  selectAccountItem.value = item
}
const handleDeleteAccount = async (item: AccountListItem) => {
  showConfirmDialog({
    title: '提示',
    message: '确认删除该条记录？',
    className: 'confirm-dialog'
  }).then(async () => {
    if (!selectPayTypeItem.value) return
    const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
    try {
      const params = { Id: item.Id }
      const res = isCrypto.value ?
        await API.finance.deleteCryptoAccount(params) :
        await API.finance.deleteBankCardAccount(params)
      if (res.data.Code !== 200) return
      showToast({ message: '删除成功', position: 'top' })
      fetchAccountList()
    } finally {
      loading.close()
    }
  }).catch(() => {})
}

const ddbLoading = ref<boolean>(false)
const handleRefreshDDBAddress = async () => {
  ddbLoading.value = true
  try {
    const res = await API.finance.getDDBAddress()
    if (res.data.Code !== 200) return
    const isChanged = res.data.Data.Changed
    if (isChanged) {
      fetchAccountList()
      showToast({ message: '提币地址已更新!', position: 'top' })
    } else {
      showToast({ message: '更新失败，请保持良好网路，且避免10分钟内连续点击申请哦~', position: 'top' })
    }
  } finally {
    ddbLoading.value = false
  }
}

/** 當日已提現金額 */
const appliedAmount = ref<number>(0)
const fetchAppliedAmount = async () => {
  if (!selectPayTypeItem.value?.PayType) return
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.finance.getAppliedAmount({
      AccountType: selectPayTypeItem.value.PayType
    })
    if (res.data.Code !== 200) return
    appliedAmount.value = new Big(res.data.Data.AppliedAmount).div(100).toNumber()
  } finally {
    loading.close()
  }
}

/** USDT匯率 */
const USDTRate = ref<number>(0)
const fetchUSDTRate = async () => {
  if (!selectPayTypeItem.value?.PayType) return
  try {
    const res = await API.finance.getWithdrawUSDTRate({
      AccountType: selectPayTypeItem.value.PayType
    })
    if (res.data.Code !== 200) return
    USDTRate.value = new Big(res.data.Data.CryptoRate).div(100).toNumber()
  } finally {}
}

const formDataRef = ref<FormInstance | null>(null)
export interface FormData {
  /** 提現金額 */
  Amount: number | null
  /** 私人密碼 */
  PayPassword: string
}
const initFormData = (): FormData => ({
  Amount: null,
  PayPassword: ''
})
const formData = ref<FormData>(initFormData())

/** 快選金額列表 */
const quickSelectAmountList = computed<number[]>((): number[] => {
  if (!selectPayTypeItem.value) return []
  return selectPayTypeItem.value.GoldList ? selectPayTypeItem.value.GoldList.split(',').map((item: string) => Number(item)) : []
})

const isSetPrivatePassword = computed(() => {
  return userStore.userInfo?.Admin?.PrivatePassword.length > 0
})
const showPassword = ref<boolean>(false)
const togglePassword = () => showPassword.value = !showPassword.value

const confirmDisabled = computed(() => {
  return selectPayTypeItem.value === null ||
    selectAccountItem.value === null || 
    !formData.value.Amount || 
    !formData.value.PayPassword
})

const withdrawConfirm = () => {
  showWithdrawConfirmPopup.value = true
}

const showWithdrawConfirmPopup = ref<boolean>(false)
const handleWithdrawSuccess = () => {
  showWithdrawConfirmPopup.value = false
  fetchWithdrawList()
  formData.value = initFormData()
}

onMounted(() => {
  allowMultipleToast()
  fetchWithdrawList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="pt-4 pb-2 px-3">
      <div class="text-base font-semibold leading-6 text-neutral2-basic">
        1. 选择提现方式
      </div>
      <PayTypeList 
        :type="'withdraw'"
        :list="withdrawList" 
        :selectPayTypeItem="selectPayTypeItem"
        @itemClick="handleChangeType"
      />
      <DDWallet v-if="isDDWallet" />
    </div>

    <div class="pt-4 pb-2 px-3">
      <template v-if="!isDDWallet">
        <div class="text-base font-semibold leading-6 text-neutral2-basic">
          2. 绑定{{ getWithdrawAccountName(selectPayTypeItem?.PayType ?? 0) }}账号
          (<span class="text-primary-normal">{{ accountList.length }}</span>/5)
        </div>
      </template>
      <template v-if="isDDWallet">
        <div class="flex items-center justify-between text-base font-semibold leading-6 text-neutral2-basic">
          2. 选择提现钱包
          <van-image src="./static/images/common/reload.svg" fit="contain" class="w-4" :class="{ 'rotate-once': ddbLoading }" @click="handleRefreshDDBAddress" />
        </div>
      </template>
      <AccountList
        v-if="selectPayTypeItem"
        :type="'withdraw'"
        :selectPayTypeItem="selectPayTypeItem"
        :accountList="accountList"
        :selectAccountItem="selectAccountItem"
        :currencyNameMap="currencyNameMap"
        @accountClick="handleChangeAccount"
        @deleteAccount="handleDeleteAccount"
        @reloadAccountList="fetchAccountList"
      />
    </div>

    <div class="pt-4 px-3">
      <div class="text-base font-semibold leading-6 text-neutral2-basic">
        3. 请输入提现金额
      </div>
      <div class="flex items-center mt-2 px-3 py-2 rounded-2xl bg-bg-floor-1-2">
        <van-image src="./static/images/common/lightBulb.png" fit="contain" class="w-5 h-5 mr-2" />
        <div class="flex-1 flex flex-col gap-1 text-sm font-normal leading-6 text-neutral2-basic">
          <div class="flex items-center">
            当日可提现佣金
            <span class="inline-block ml-2">
              (<span class="text-primary-normal">{{ formatMoneyWithComma((selectPayTypeItem?.MaxDailyAmount - appliedAmount), 2, false) }}</span>/{{ formatMoneyWithComma(selectPayTypeItem?.MaxDailyAmount, 2, false) }})
            </span>
            <van-image src="./static/images/common/circleReload.svg" fit="contain" class="w-4 h-4 ml-auto" @click="fetchAppliedAmount" />
          </div>
          <div>
            单次限额
            <span class="inline-block ml-2 text-primary-normal">{{ formatMoneyWithComma(selectPayTypeItem?.MinAmount, 2, false) }}~{{ formatMoneyWithComma(selectPayTypeItem?.MaxAmount, 2, false) }}</span>
          </div>
          <div v-if="selectPayTypeItem?.CurrencyName === 'USDT'">
            参考汇率
            <span class="inline-block ml-2 text-primary-normal">{{ USDTRate }}</span>
            RMB
            <span class="inline-block ml-2">≈</span>
            <span class="inline-block ml-2 text-primary-normal">
              {{ formData.Amount && !isNaN(formData.Amount) ? formatMoneyWithComma((formData.Amount / USDTRate), 2, false) : 0 }}
            </span>
            USDT
          </div>
        </div>
      </div>
    </div>
    <van-form ref="formDataRef" class="mt-2" :trigger="['onBlur', 'onChange']" @submit="withdrawConfirm">
      <AppField 
        v-model="formData.Amount" 
        name="Amount" 
        label="提现金额" 
        placeholder="请输入" 
        maxlength="8"
        clearable 
        required 
        :disabled="selectPayTypeItem?.AllowInput === 0"
        :rules="[
          rulesRequired(),
          rulesPositiveIntegerNumber({ message: '请输入正确的金额' }),
          {
            validator: (value: number) => {
              if (value < selectPayTypeItem?.MinAmount) return '提现金额不能小于最小提现金额'
              else if (value > selectPayTypeItem?.MaxAmount) return '提现金额不能大于最大提现金额'
            }
          }
        ]" 
      />
      <div v-if="selectPayTypeItem?.ServiceRate" class="mb-1 pl-7 text-xs font-normal leading-5 text-primary-normal">
        {{ `手续類费为提现金额的 ${selectPayTypeItem?.ServiceRate} %` }}
      </div>
      <div class="flex items-center px-4 gap-2 overflow-auto">
        <van-button 
          v-for="item in quickSelectAmountList" 
          :key="`QuickSelectAmount${item}`"
          class="!h-10 min-w-16 py-2 px-5 leading-6"
          type="primary"
          round
          plain
          @click="formData.Amount = item"
        >
          {{ item }}
        </van-button>
      </div>
      <AppField 
        v-model="formData.PayPassword" 
        name="PayPassword" 
        label="私人密码" 
        :type="showPassword ? 'text' : 'password'"
        placeholder="请输入" 
        maxlength="24"
        clearable 
        required 
        :disabled="!isSetPrivatePassword"
        :rules="[rulesRequired()]" 
      >
        <template #right-icon>
          <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click.stop="togglePassword" />
        </template>
      </AppField>
      <div v-if="!isSetPrivatePassword" class="pl-7 text-xs font-normal leading-5 text-error-normal">
        您暂未设置私人密码请先前往个人资料页面进行设置
      </div>

      <div class="mt-4 mx-4 mb-8">
        <van-button type="primary" round block native-type="submit" :disabled="confirmDisabled" class="!h-12 !text-base font-semibold gray-disabled">
          确认
        </van-button>
      </div>
    </van-form>
  </div>

  <WithdrawConfirmPopup 
    v-if="selectPayTypeItem && selectAccountItem"
    v-model:show="showWithdrawConfirmPopup" 
    :selectPayTypeItem="selectPayTypeItem"
    :selectAccountItem="selectAccountItem"
    :USDTRate="USDTRate"
    :formData="formData"
    @withdrawSuccess="handleWithdrawSuccess"
  />
</template>

<style scoped>
.rotate-once {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>