<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useClipboard } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { type RechargeMoneyData } from '@/apis/codegen/data-contracts'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import API from '@/apis'

const userStore = useUserStore()
const { copy } = useClipboard()

interface Props {
  process: number
  thirdRechargeData: RechargeMoneyData
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'checkOrder': []
}>()

const adminInfo = computed(() => {
  return userStore.userInfo?.Admin || {}
})

const isDDWallet = computed(() => {
  return props.thirdRechargeData.PayType === 40
})

const loading = ref<boolean>(false)
const cancelOrder = async () => {
  loading.value = true
  try {
    const params = {
      PlayerId: adminInfo.value.Id,
      PlayerName: adminInfo.value.Name,
      OrderId: props.thirdRechargeData.orderId
    }
    const res = await API.finance.rechargeMoneyCancel(params)
    if (res.data.Code !== 200) return
    emit('checkOrder')
  } finally {
    loading.value = false
  }
}

const expiredOrderInterval = ref<ReturnType<typeof setInterval> | null>(null)
const countInterval = ref<ReturnType<typeof setInterval> | null>(null)
const countdown = ref<string>('')
const setCountDown = () => {
  if (typeof props.thirdRechargeData.payUrl === 'string' || !props.thirdRechargeData.payUrl.ExpireTime) return
  const endTime = props.thirdRechargeData.payUrl.ExpireTime
  const updateState = () => {
    const currentTime = Math.floor(Date.now() / 1000)
    let timeLeft = endTime - currentTime
    if (timeLeft < 0) {
      timeLeft = 0
      /** 過期後, 每10秒取消一次訂單狀態 */
      if (!expiredOrderInterval.value) {
        expiredOrderInterval.value = setInterval(() => {
          cancelOrder()
        }, 10000)
      }
      countInterval.value && clearInterval(countInterval.value)
    }
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    countdown.value = `${minutes}分${seconds}秒`
  }
  updateState()
  countInterval.value = setInterval(updateState, 1000)
}

const amountData = computed((): { USDT: number; RMB: number } => {
  let text = {
    USDT: 0,
    RMB: 0
  }
  if (props.process === 1) {
    if (typeof props.thirdRechargeData.payUrl !== 'string' 
      && typeof props.thirdRechargeData.payUrl.card2CardReceiveInfo !== 'string' 
      && props.thirdRechargeData.payUrl.card2CardReceiveInfo) {
      const usdt = props.thirdRechargeData.payUrl.card2CardReceiveInfo.realBuyNum
      const rmb = parseFloat(props.thirdRechargeData.payUrl.card2CardReceiveInfo.buyNum).toFixed(2)
      text = {
        USDT: parseFloat(usdt),
        RMB: parseFloat(rmb),
      }
    }
  }
  return text
})

const rechargeOrderDetails = computed((): { 
  key: string
  label: string
  value: string | number
  copy: boolean }[] => {
  if (props.process === 1) {
    const address = (typeof props.thirdRechargeData.payUrl !== 'string' 
      && typeof props.thirdRechargeData.payUrl.card2CardReceiveInfo !== 'string' 
      && props.thirdRechargeData.payUrl.card2CardReceiveInfo) ? props.thirdRechargeData.payUrl.card2CardReceiveInfo.trc20Address : ''
    return [
      { key: 'Amount', label: '充值金额', value: amountData.value.USDT, copy: true },
      { key: 'OrderId', label: '订单号', value: props.thirdRechargeData.orderId, copy: true },
      { key: 'Protocol', label: '协议', value: 'TRC20', copy: true },
      { key: 'QRcode', label: '地址QR', value: '', copy: false },
      { key: 'TRC20Address', label: '地址', value: address , copy: true },
    ]
  }

  if (props.process === 2) {
    return [
      { key: 'Amount', label: '充值金额', value: props.thirdRechargeData.amount, copy: true },
      { key: 'OrderId', label: '订单号', value: props.thirdRechargeData.orderId, copy: true },
    ]
  }

  return []
})

const handleCopy = (text: string | number) => {
  if (typeof text === 'number') text = text.toString()
  if (!text) return
  copy(text)
  showToast({ message: '复制成功', position: 'top' })
}

const QRcodeText = shallowRef<string>('')
const QRcode = useQRCode(QRcodeText, {
  errorCorrectLevel: 'H'
})
const setQRcode = () => {
  if (typeof props.thirdRechargeData.payUrl !== 'string' 
    && typeof props.thirdRechargeData.payUrl.card2CardReceiveInfo !== 'string' 
    && props.thirdRechargeData.payUrl.card2CardReceiveInfo) {
    const address = props.thirdRechargeData.payUrl.card2CardReceiveInfo.trc20Address ?? ''
    QRcodeText.value = address
  }
}

onMounted(() => {
  setCountDown()
  setQRcode()
})
onUnmounted(() => {
  expiredOrderInterval.value && clearInterval(expiredOrderInterval.value)
  countInterval.value && clearInterval(countInterval.value)
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center mt-4 mx-3 px-3 py-2 rounded-2xl bg-bg-floor-1-2">
      <van-image src="./static/images/common/lightBulb.png" fit="contain" class="w-5 h-5 mr-2" />
      <div class="flex-1 flex flex-col">
        <div class="flex items-center text-base font-normal leading-6 gap-1.25">
          请在<span class="text-lg font-semibold text-primary-normal">{{ countdown }}</span>完成支付
        </div>
        <div class="text-xs font-normal leading-5 text-primary-normal">
          <span v-if="process === 1">
            支付订单前请确认转账金额是否包含手续费，请确保到账金额 
            <span class="font-semibold">{{ formatMoneyWithComma(amountData.USDT, 2, false) }}</span>
            USDT，否则无法自动到账
          </span>
          <span v-if="process === 2">成功付款后，将自动到账，并弹出到账通知</span>
        </div>
      </div>
    </div>

    <div class="mt-4 mx-3 mb-2 p-3 rounded-2xl bg-bg-floor-1-2">
      <div class="text-sm font-semibold leading-6 text-neutral2-basic">订单信息</div>
      <van-cell-group inset class="custom-cell-group" v-if="rechargeOrderDetails.length > 0">
        <van-cell v-for="item in rechargeOrderDetails" :key="item.key" class="custom-cell">
          <template #title>
            <span class="text-xs font-normal leading-5 text-neutral-basic">{{ item.label }}</span>
          </template>
          
          <template #value>
            <div class="text-xs leading-5">
              <div class="flex items-center justify-end break-all font-semibold text-neutral2-basic">
                <span v-if="item.key === 'Amount' && process === 1">
                  {{ formatMoneyWithComma(amountData.USDT, 2, false) }}
                  <span class="font-normal">USDT</span>
                  <span class="mx-1 font-normal">≈</span>
                  {{ formatMoneyWithComma(amountData.RMB, 2, false) }}
                  <span class="font-normal">RMB</span>
                </span>
                <span v-else-if="item.key === 'Amount' && process === 2">
                  {{ formatMoneyWithComma(item.value, 2, false) }}
                </span>
                <span v-else-if="item.key !== 'QRcode'">{{ item.value }}</span>
                <van-image v-else-if="item.key === 'QRcode'" :src="QRcode" class="size-20" fit="contain" />
                <van-image v-if="item.copy" src="./static/images/promote/copy_lite.png" class="ml-1 w-3 h-3" fit="contain" @click="handleCopy(item.value)" />
              </div>
              <div v-if="item.key === 'Amount' && process === 2" class="mt-1 font-normal text-primary-normal">
                转账金额务必与订单金额一致
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div v-if="process === 2 && !isDDWallet" class="mt-2 text-xs font-normal text-primary-normal leading-5">若无法在时间内完成支付，请重新匹配订单！超时不予赔付！</div>
    </div>
    <div class="mt-4 mx-4 mb-8">
      <van-button type="primary" plain round block :disabled="loading" class="!h-12 !text-base font-semibold gray-disabled" @click="cancelOrder">
        取消订单
      </van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-cell-group {
  margin: calc(var(--spacing) * 2) 0 0;
  border-radius: calc(var(--radius) + 4px);
}
.custom-cell {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);

  :deep(.van-cell__value) {
    flex: 4.3;
  }
}
</style>