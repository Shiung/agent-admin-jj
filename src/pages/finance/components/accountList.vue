<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type ListItem } from './payTypeList.vue'
import { getWithdrawTypeImage, getRechargeTypeImage } from '@/utils/finance'
import { useGlobalStore } from '@/stores/global'

import AddAccountPopup from './addAccountPopup.vue'

const globalStore = useGlobalStore()

export interface AccountListItem {
  Id: number
  BankCardNum?: string
  RealName?: string
  DigitalAlias?: string
  DigitalDesc?: string
  DigitalAddress?: string
  [key: string]: any
}

interface Props {
  type: 'withdraw' | 'recharge'
  selectPayTypeItem: ListItem
  accountList: AccountListItem[]
  selectAccountItem?: AccountListItem | null
  currencyNameMap: Record<string, { [key: string]: any }[]>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'withdraw',
  accountList: () => [],
  selectAccountItem: null,
  currencyNameMap: () => ({})
})

const emit = defineEmits<{
  'accountClick': [item: AccountListItem],
  'deleteAccount': [item: AccountListItem],
  'reloadAccountList': [],
}>()

const selectAccount = ref<AccountListItem | null>(null)
watch(
  () => props.selectAccountItem,
  newValue => {
    if (!newValue) return
    if (selectAccount.value?.Id === newValue?.Id) return
    selectAccount.value = JSON.parse(JSON.stringify(newValue))
  }
)
const handleAccountClick = (item: AccountListItem) => {
  selectAccount.value = item
  emit('accountClick', item)
}

const getIcon = (PayType: number): string => {
  if (!PayType) return ''
  return {
    withdraw: getWithdrawTypeImage(PayType),
    recharge: getRechargeTypeImage(PayType)
  }[props.type] || ''
}

const getBankName = (bankCode: string) => {
  return globalStore.bankMapping?.[bankCode]?.BankName ?? ''
}

const isDDWallet = computed(() => {
  return props.selectPayTypeItem.PayType === 17
})

const handleDeleteAccount = (item: AccountListItem) => {
  emit('deleteAccount', item)
}

const handleAddAccount = () => {
  showAddAccountPopup.value = true
}
const showAddAccountPopup = ref(false)
</script>

<template>
  <div class="flex flex-col mt-2 gap-2">
    <div 
      v-for="item in accountList" 
      :key="item.Id" 
      :class="[
        'flex items-center relative px-4 py-3 gap-3 outline rounded-xl overflow-hidden',
        item.Id === selectAccount?.Id
          ? 'bg-primary-5 outline-primary-normal text-neutral-basic font-semibold'
          : 'bg-white outline-neutral2-seventh text-neutral2-secondary font-normal'
      ]"
      @click="handleAccountClick(item)"
    >
      <van-image :src="props.selectPayTypeItem.PayType ? getIcon(props.selectPayTypeItem.PayType) : ''" fit="contain" class="w-10 h-10" />
      <div class="flex-1 flex flex-col gap-1 text-xs leading-5 mr-4">
        <!-- 銀行卡 -->
        <template v-if="props.selectPayTypeItem.PayType === 1001">
          <div class="flex-1 flex justify-between gap-2">
            <div class="flex-1">银行名称: {{ getBankName(item.BankCode) }}</div>
            <div class="flex-1">持卡人: {{ item.RealName }}</div>
          </div>
          <div>银行账号: {{ item.BankCardNum }}</div>
        </template>
        <!-- 支付寶 -->
        <template v-else-if="props.selectPayTypeItem.PayType === 1002">
          <div>账户名称: {{ item.RealName }}</div>
          <div>支付宝账号: {{ item.BankCardNum }}</div>
        </template>
        <!-- 虛擬帳號 -->
        <template v-else-if="props.selectPayTypeItem.IsCrypto">
          <div class="flex-1 flex justify-between">
            <div class="flex-1">别名: {{ item.DigitalAlias }}</div>
            <div class="flex-1">协议: {{ item.DigitalDesc }}</div>
          </div>
          <div>地址: {{ item.DigitalAddress }}</div>
        </template>
      </div>
      <van-image v-if="!isDDWallet" src="./static/images/common/circleDelete.svg" fit="contain" class="!absolute right-2 top-2 w-4 h-4" @click.stop="handleDeleteAccount(item)" />
      <van-image v-if="!isDDWallet && item.Id === selectAccount?.Id" src="./static/images/common/selectCheck.svg" fit="contain" class="!absolute right-0 bottom-0 w-7.5 h-7.5" />
    </div>

    <div v-if="!isDDWallet" class="flex items-center justify-center px-2 py-3 gap-2 outline outline-dashed outline-neutral2-sixth rounded-xl" @click="handleAddAccount">
      <van-image src="./static/images/common/circlePlus.svg" fit="contain" class="w-3.5 h-3.5" />
      <div class="text-sm font-semibold leading-6 text-neutral-secondary">添加</div>
    </div>
  </div>

  <AddAccountPopup 
    v-if="selectPayTypeItem"
    v-model:show="showAddAccountPopup" 
    :selectPayTypeItem="selectPayTypeItem" 
    :currencyNameMap="currencyNameMap"
    @reloadAccountList="emit('reloadAccountList')"
  />
</template>
