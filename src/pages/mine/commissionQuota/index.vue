<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { rulesRequired, rulesPassword } from '@/utils/formRules'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import type { AccountBalanceData } from '@/apis/codegen/Finance/type'
import type { FormInstance } from 'vant'
import API from '@/apis'
import NavBar from '@/components/NavBar/index.vue'

const router = useRouter()
const route = useRoute()
const loading = ref<boolean>(false)
const accountBalance = ref<AccountBalanceData['Items']>({})
const showPassword = ref<boolean>(false)
const privatePassword = ref<string>('')
const amount = ref<string>('')
const formRef = ref<FormInstance | null>(null)
const patternAmount = /^(?:0|[1-9]\d{0,8})(?:\.\d{0,2})?$/

const goRecord = () => { router.push({ name: 'record' }) }
const togglePassword = () => { showPassword.value = !showPassword.value }

const navBarTitle = computed(() => {
  const name = route.name ?? 'commissionQuota'
  const map = {
    commissionQuota: '佣金转额度',
    record: '转换记录'
  }
  return map[name as keyof typeof map]
})
const navBarShowDetail = computed(() => route.name === 'commissionQuota')

const fetchAccountBalance = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.finance.getAccountBalance()
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }
    accountBalance.value = res.data.Data.Items
  } catch (error: any) {
    console.error('获取账户余额失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    loadingToast.close()
  }
}

const validateAmount = (value: string) => {
  if (!value) return true
  if (!patternAmount.test(value)) {
    return '请输入正确的金额'
  }
  const numValue = Number(value)
  if (numValue <= 0) {
    return '请输入大于0的正数'
  }
  if (accountBalance.value?.Money !== undefined && numValue > accountBalance.value.Money) {
    return '钱包余额不足'
  }

  return true
}

const resetFormFields = () => {
  amount.value = ''
  privatePassword.value = ''
}

const submit = async () => {
  if (loading.value) return

  try {
    loading.value = true
    await formRef.value?.validate()

    const res = await API.admin.postCommissionToQuota({
      Amount: Number(amount.value) * 100,
      PayPassword: privatePassword.value.trim()
    }, { customErrorHandling: true })

    if (res.data.Code !== 200) {
      if (res.data.Code === 10103) {
        showFailToast('私人密码错误，请再次确认')
      } else if (res.data.Code === 10131) {
        showFailToast('钱包余额不足，请再次确认')
      } else {
        showFailToast(res.data.Msg)
      }
      return
    }

    showSuccessToast('操作成功')
    resetFormFields()
  } catch (error: any) {
    console.error('[submit error]:', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAccountBalance()
})

</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar :title="navBarTitle" :showDetail="navBarShowDetail" @detailClick="goRecord" />
    <router-view v-if="route.name === 'record'" />
    <div v-else>
      <div class="flex items-center justify-between gap-2 mx-3 mt-2 px-3 py-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)]">
        <div class="flex-1 align-center text-center min-w-0 rounded-2xl">
          <div class="text-sm font-semibold leading-5 text-neutral-basic">可用佣金</div>
          <p class="text-xl leading-7 truncate font-semibold text-primary-normal">{{ formatMoneyWithComma(accountBalance.Money) }}</p>
        </div>
        <div class="flex-1 align-center text-center min-w-0 rounded-2xl">
          <div class="text-sm font-semibold leading-5 text-neutral-basic">可用额度</div>
          <p class="text-xl leading-7 truncate font-semibold text-primary-normal">{{ formatMoneyWithComma(accountBalance.Credit) }}</p>
        </div>
      </div>
      <div class="mx-3 my-2 px-3 py-2 bg-bg-floor-1-2 rounded-lg flex items-center">
        <van-image src="./static/images/common/lightBulb.png" class="mx-2" width="24" />
        <div class="flex flex-col py-2 px-3">
          <p class="text-primary-normal leading-6 text-sm">将佣金钱包的余额转账至额度钱包</p>
          <!-- <p class="text-primary-normal leading-6 text-sm">1. 将佣金钱包的余额转账至额度钱包</p>
          <p class="text-primary-normal leading-6 text-sm">2. 转账至额度钱包后不可逆，且无法提现</p> -->
        </div>
      </div>
      <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
        <AppField
          v-model="amount"
          name="amount"
          label-align="top"
          label="转换金额"
          placeholder="请输入"
          required
          :rules="[rulesRequired(), { validator: validateAmount }]"
          maxlength="12"
          type="number"
          @input="(e: Event) => {
            amount = (e.target as HTMLInputElement).value
            amount = patternAmount.test(amount) ? amount : amount.slice(0, -1)
          }"
        />

        <AppField
          v-model="privatePassword"
          name="privatePassword"
          label-align="top"
          label="私人密码"
          placeholder="请输入"
          required
          :rules="[rulesRequired(), rulesPassword()]"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #right-icon>
            <van-icon
              :name="showPassword ? 'eye-o' : 'closed-eye'"
              class="cursor-pointer"
              @click.stop="togglePassword"
            />
          </template>
        </AppField>
        <div class="px-4 my-4">
          <van-button block round type="primary" :loading="loading" :disabled="!amount || !privatePassword" native-type="submit" class="gray-disabled">提交</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
