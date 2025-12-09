<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { getRechargeName, getRechargeAccountType, getRechargeType } from '@/utils/finance'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import { rulesRequired } from '@/utils/formRules'
import { type RechargeMoneyData, type RechargeMoneyPayUrlData } from '@/apis/codegen/data-contracts'
import Big from 'big.js'
import API from '@/apis'

import PayTypeList, { type ListItem } from '../components/payTypeList.vue'
import RechargeChannelList, { type RechargeChannelItem, showLimit } from '../components/rechargeChannelList.vue'
import DDWallet from '../components/ddWallet.vue'
import { type FormInstance } from 'vant'

const userStore = useUserStore()

/** 選中的充值方式 */
const selectPayTypeItem = ref<ListItem | null>(null)
/** 選中的充值通道 */
const selectRechargeChannelItem = ref<RechargeChannelItem | null>(null)

/** 充值通道列表 */
const rechargeList = ref<ListItem[]>([])
const fetchRechargeList = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.finance.getRechargeAllowedList()
    if (res.data.Code !== 200) return
    rechargeList.value = (res.data.Data.Info || []).map(item => ({
      ...item,
      Name: getRechargeName(item.PayType)
    }))
    if (!rechargeList.value[0]) return
    handleChangeType(rechargeList.value[0])
  } finally {
    loading.close()
  }
}
const handleChangeType = (item: ListItem) => {
  console.log("🍊 selectPayTypeItem", item)
  selectPayTypeItem.value = item
  nextTick(() => {
    handleChangeRechargeChannel(selectPayTypeItem.value?.expandables[0])
  })
  if (getRechargeAccountType(selectPayTypeItem.value.PayType) === 'USDT') {
    fetchUSDTRate()
  }
  formData.value = initFormData()
}
const handleChangeRechargeChannel = (item: RechargeChannelItem) => {
  console.log("🍊 selectRechargeChannelItem", item)
  selectRechargeChannelItem.value = item
}

const isDDWallet = computed(() => {
  return selectPayTypeItem.value?.PayType === 40
})

/** USDT匯率 */
const USDTRate = ref<number>(0)
const fetchUSDTRate = async () => {
  if (!selectPayTypeItem.value?.PayType) return
  try {
    const res = await API.finance.getUSDTRate({
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
}
const initFormData = (): FormData => ({
  Amount: null,
})
const formData = ref<FormData>(initFormData())

const adminInfo = computed(() => {
  return userStore.userInfo?.Admin || {}
})

/** 快選金額列表 */
const quickSelectAmountList = computed<number[]>((): number[] => {
  if (!selectRechargeChannelItem.value) return []
  return selectRechargeChannelItem.value.Gears ? selectRechargeChannelItem.value.Gears.split(',').map((item: string) => Number(item)) : []
})

const confirmDisabled = computed(() => {
  return selectPayTypeItem.value === null ||
    selectRechargeChannelItem.value === null || 
    !formData.value.Amount
})

/** 0:充值表單 1:普通訂單 2:三方訂單(會額外外開頁面) */
const process = ref<number>(0)
/** 充值訂單data */
const thirdRechargeData = ref<RechargeMoneyData | null>(null)

const rechargeConfirm = async () => {
  if (!selectPayTypeItem.value || !selectRechargeChannelItem.value) return
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    let params = {
      AgentId: adminInfo.value.AgentId,
      PlayerId: adminInfo.value.Id,
      PlayerUserName: adminInfo.value.Username,
      PlayerName: adminInfo.value.Name,
      PayAdminId: adminInfo.value.AgentId,
      PayType: selectPayTypeItem.value.PayType,
      Amount: new Big(formData.value.Amount! ?? 0).times(100).toNumber(),
      RealAmount: new Big(formData.value.Amount! ?? 0).times(100).toNumber(),
      Process: 'f',
      RechargeId: selectRechargeChannelItem.value.Id
    }
    const res = await API.finance.rechargeMoney(params)
    if (res.data.Code !== 200) return
    let { Data } = res.data
    Data.payUrl = JSON.parse(Data.payUrl as string) as RechargeMoneyPayUrlData
    Data.amount = new Big(Data.amount).div(100).toNumber()
    if (getRechargeType(selectPayTypeItem.value.PayType) === 'thirdParty') {
      window.open(Data.payUrl.data! as string, '_blank')
      process.value = 2
    } else {
      if (Data.payUrl.card2CardReceiveInfo) {
        Data.payUrl.card2CardReceiveInfo = JSON.parse(Data.payUrl.card2CardReceiveInfo as string)
      }
      process.value = 1
    }
    thirdRechargeData.value = Data
  } finally {
    loading.close()
  }
}

onMounted(() => {
  fetchRechargeList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div v-if="process === 0">
      <div class="pt-4 pb-2 px-3">
        <div class="text-base font-semibold leading-6 text-neutral2-basic">
          1. 选择充值方式
        </div>
        <PayTypeList 
          :type="'recharge'"
          :list="rechargeList" 
          :selectPayTypeItem="selectPayTypeItem"
          @itemClick="handleChangeType"
        />
        <DDWallet v-if="isDDWallet" />
      </div>

      <div class="pt-4 pb-2 px-3">
        <div class="text-base font-semibold leading-6 text-neutral2-basic">
          2. 选择充值通道
        </div>
        <RechargeChannelList 
          v-if="selectPayTypeItem"
          :selectPayTypeItem="selectPayTypeItem"
          :selectRechargeChannelItem="selectRechargeChannelItem"
          @channelClick="handleChangeRechargeChannel"
        />
      </div>

      <div class="pt-4 px-3">
        <div class="text-base font-semibold leading-6 text-neutral2-basic">
          3. 输入充值金额
        </div>
        <div class="flex items-center mt-2 px-3 py-2 rounded-2xl bg-bg-floor-1-2">
          <van-image src="./static/images/common/lightBulb.png" fit="contain" class="w-5 h-5 mr-2" />
          <div class="flex-1 flex flex-col gap-1">
            <div class="text-sm font-normal leading-6">
              单次限额
              <span class="inline-block ml-2 text-primary-normal">{{ selectRechargeChannelItem ? showLimit(selectRechargeChannelItem) : '' }}</span>
            </div>
            <div v-if="selectPayTypeItem && getRechargeAccountType(selectPayTypeItem.PayType) === 'USDT'" class="text-sm font-normal leading-6">
              参考汇率
              <span class="inline-block ml-2 text-primary-normal">{{ USDTRate }}</span>
              RMB
              <span class="inline-block ml-2 text-primary-normal">≈</span>
              <span class="inline-block ml-2 text-primary-normal">{{ formData.Amount ? formatMoneyWithComma((formData.Amount / USDTRate), 2, false) : 0 }}</span>
              USDT
            </div>
          </div>
        </div>
      </div>
      <van-form ref="formDataRef" class="mt-2" :trigger="['onBlur', 'onChange']" @submit="rechargeConfirm">
        <AppField 
          v-model="formData.Amount" 
          name="Amount" 
          label="充值金额" 
          placeholder="请输入" 
          maxlength="8"
          clearable 
          required 
          :disabled="selectRechargeChannelItem?.AllowInput === 2"
          :rules="[rulesRequired()]" 
        />
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
        <div class="mt-4 mx-4 mb-8">
          <van-button type="primary" round block native-type="submit" :disabled="confirmDisabled" class="!text-base font-semibold gray-disabled">
            确认
          </van-button>
        </div>
      </van-form>
    </div>
    <div v-if="process === 1">普通訂單</div>
    <div v-if="process === 2">三方訂單</div>
  </div>
</template>
