<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { rulesRequired } from '@/utils/formRules'
import type { FormInstance } from 'vant'
import { formatMoneyWithComma } from '@/utils/formatNumber'
import API from '@/apis'
import NavBar from '@/components/NavBar/index.vue'

const accountBalance = ref<any>({})
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const showPassword = ref(false)
const privatePassword = ref('')
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
const goRecord = () => {
  router.push({ name: 'record' })
}

const fetchAccountBalance = async () => {
  const res = await API.finance.getAccountBalance()
  if (res.data.Code !== 200) return
  accountBalance.value = res.data.Data.Items
}

const amount = ref('')
const formRef = ref<FormInstance | null>(null)

const validateAmount = (value: string) => {
  if (!value) return true
  if (!/^(?:\d{1,9})(?:\.\d{0,2})?$/.test(value)) {
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
  formRef.value?.validate().then(async () => {
    try {
      const res = await API.admin.postCommissionToQuota({ Amount: Number(amount.value) * 100, PayPassword: privatePassword.value })
      if (res.data.Code !== 200) {
        showFailToast(res.data.Msg)
        return
      }
      showToast('操作成功')
      resetFormFields()
    } catch (error:any) {
      console.error('转账失败：', error)
      showFailToast(error?.response?.data?.Msg)
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  fetchAccountBalance()
})

const navBarTitle = computed(() => {
  const name = router.currentRoute.value.name ?? 'commissionQuota'
  const map = {
    commissionQuota: '佣金转额度',
    record: '转换记录'
  }
  return map[name as keyof typeof map]
})
const navBarShowDetail = computed(() => router.currentRoute.value.name === 'commissionQuota')

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
          <p class="text-primary-normal leading-6 text-sm">1. 将佣金钱包的余额转账至额度钱包</p>
          <p class="text-primary-normal leading-6 text-sm">2. 转账至额度钱包后不可逆，且无法提现</p>
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
        >
          <template #input>
            <input
              :value="amount"
              type="text"
              inputmode="numeric"
              class="flex-1 outline-none bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              maxlength="12"
              @input="(e: Event) => {
                amount = (e.target as HTMLInputElement).value
                amount = /^(?:\d{1,9})(?:\.\d{0,2})?$/.test(amount) ? amount : amount.slice(0, -1)
               }"
            />
          </template>
        </AppField>
        <AppField
          v-model="privatePassword"
          name="privatePassword"
          label-align="top"
          label="私人密码"
          placeholder="请输入"
          required
          :rules="[rulesRequired()]"
          maxlength="20"
        >
          <template #input>
            <div class="flex items-center w-full gap-2">
              <input
                :type="showPassword ? 'text' : 'password'"
                :value="privatePassword"
                class="flex-1 outline-none bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
                placeholder="请输入"
                @input="(e: Event) => { privatePassword = (e.target as HTMLInputElement).value }"
              />
              <van-icon
                :name="showPassword ? 'eye-o' : 'closed-eye'"
                class="cursor-pointer"
                @click.stop="togglePassword"
              />
            </div>
          </template>
        </AppField>
        <div class="px-4 my-4">
          <van-button block round type="primary" :loading="loading" :disabled="!amount || !privatePassword" native-type="submit" class="gray-disabled">提交</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
