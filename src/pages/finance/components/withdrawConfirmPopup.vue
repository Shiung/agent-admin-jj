<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { type WithdrawMoneyFormData } from '@/apis/codegen/data-contracts'
import Big from 'big.js'
import API from '@/apis'

import { type ListItem } from '../components/payTypeList.vue'
import { type AccountListItem } from '../components/accountList.vue'
import { type FormData } from '../withdraw/withdraw.vue'

const globalStore = useGlobalStore()
const userStore = useUserStore()

interface Props {
  show: boolean
  selectPayTypeItem: ListItem
  selectAccountItem: AccountListItem
  USDTRate?: number
  formData: FormData
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  USDTRate: 0,
})

const emit = defineEmits<{
  'update:show': [value: boolean],
  'withdrawSuccess': []
}>()

const isCrypto = computed(() => {
  return !!props.selectPayTypeItem.IsCrypto
})
const isDDWallet = computed(() => {
  return props.selectPayTypeItem.PayType === 17
})
const realName = computed(() => userStore.accountInfo?.RealName || '')
const withDrawDetails = computed((): { key: string, label: string, value: string | number }[] => {
  const amount = props.formData.Amount ?? 0
  // 非DD錢包虛擬幣: 普通USDT, EBpay, 易幣付虛擬幣, USDT
  if (isCrypto.value && !isDDWallet.value) {
    return [
      { key: 'DigitalAddress', label: 'USDT地址', value: props.selectAccountItem.DigitalAddress ?? '' },
      { key: 'DigitalDesc', label: '虚拟币协议', value: props.selectAccountItem.DigitalDesc ?? '' },
      { key: 'Amount', label: '提现金额', value: formatMoneyWithComma(amount, 2, false) },
      { key: 'DigitalCount', label: '虚拟币数量', value: props.USDTRate ? formatMoneyWithComma((amount / props.USDTRate), 2, false) : 0 },
      { key: 'USDTRate', label: '汇率', value: props.USDTRate ?? '' }
    ]
  }
  // DD錢包
  if (isDDWallet.value) {
    return [
      { key: 'DigitalAddress', label: 'DDB地址', value: props.selectAccountItem.DigitalAddress ?? '' },
      { key: 'UserRealName', label: '账户名称', value: realName.value },
      { key: 'Amount', label: '提现金额', value: formatMoneyWithComma(amount, 2, false) },
    ]
  }
  // 普通銀行卡
  if (props.selectPayTypeItem.PayType === 1001) {
    return [
      { key: 'BankName', label: '银行名称', value: getBankName(props.selectAccountItem.BankCode ?? '') },
      { key: 'BankCardNum', label: '银行账号', value: props.selectAccountItem.BankCardNum ?? '' },
      { key: 'RealName', label: '持卡人', value: props.selectAccountItem.RealName ?? '' },
      { key: 'Amount', label: '提现金额', value: formatMoneyWithComma(amount, 2, false) },
    ]
  }
  // 普通支付寶
  if (props.selectPayTypeItem.PayType === 1002) {
    return [
      { key: 'BankCardNum', label: '支付宝账号', value: props.selectAccountItem.BankCardNum ?? '' },
      { key: 'RealName', label: '账户名称', value: props.selectAccountItem.RealName ?? '' },
      { key: 'Amount', label: '提现金额', value: formatMoneyWithComma(amount, 2, false) },
    ]
  }
  return []
})

const getBankName = (bankCode: string) => {
  return globalStore.bankMapping?.[bankCode]?.BankName ?? ''
}

const handleWithdrawCancel = () => {
  emit('update:show', false)
}

const handleWithdrawConfirm = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    let params: WithdrawMoneyFormData = {
      AccountType: props.selectPayTypeItem.PayType,
      BankCardId: props.selectAccountItem.Id,
      DigitalAddressId: props.selectAccountItem.Id,
      Amount: new Big(props.formData.Amount! ?? 0).times(100).toNumber(),
      PayPassword: props.formData.PayPassword,
    }
    if (isCrypto.value && !isDDWallet.value) {
      params.DigitalAddress = props.selectAccountItem.DigitalAddress
      params.DigitalDesc = props.selectAccountItem.DigitalDesc
    }
    const res = await API.finance.withdrawMoney(params)
    if (res.data.Code !== 200) return
    showToast({ message: '提现成功', position: 'top' })
    emit('withdrawSuccess')
  } finally {
    loading.close()
  }
}
</script>

<template>
  <BottomPopup 
    :show="show" 
    :title="`提现至${selectPayTypeItem.Name ?? ''}`"
    height="fit-content"
    @cancel="handleWithdrawCancel"
    @confirm="handleWithdrawConfirm"
  >
    <div class="px-4 py-3">
      <div class="text-sm font-normal leading-6 text-neutral2-secondary">系统将自动生成 1 笔订单! 如申请通过将进行打款,是否继续?</div>
      <van-cell-group inset class="custom-cell-group" v-if="withDrawDetails.length > 0">
        <van-cell v-for="item in withDrawDetails" :key="item.key" class="custom-cell">
          <template #title>{{ item.label }}</template>
          
          <template #value>
            <span :class="[item.key === 'Amount' && 'text-primary-normal']">
              {{ item.value }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </BottomPopup>
</template>

<style lang="scss" scoped>
.custom-cell-group {
  margin: calc(var(--spacing) * 4) 0 0;
  border: 1px solid var(--color-neutral2-sixth);
  border-radius: calc(var(--radius) + 4px);
}
.custom-cell {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);

  :deep(.van-cell__title) {
    color: var(--color-neutral-basic);
  }

  :deep(.van-cell__value) {
    color: var(--color-neutral-basic);
    font-weight: var(--font-weight-semibold);
  }
}
</style>