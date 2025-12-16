<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showFailToast } from 'vant'
import { rulesVerifyCode, rulesTelephone } from '@/utils/formRules'
import type { FormInstance } from 'vant'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import DropdownFilled from '@/components/Dropdown/Filled.vue'
import getDeviceId from '@/utils/getDeviceId'
import API from '@/apis'

const router = useRouter()
const userStore = useUserStore()
const accountInfo = computed(() => userStore.accountInfo)
const formRef = ref<FormInstance>()

const countryCodeOptions = [
  { label: '+86', value: '+86' },
  { label: '+1', value: '+1' },
  { label: '+60', value: '+60' },
  { label: '+65', value: '+65' },
  { label: '+66', value: '+66' },
  { label: '+81', value: '+81' },
  { label: '+82', value: '+82' },
  { label: '+84', value: '+84' },
  { label: '+852', value: '+852' },
  { label: '+853', value: '+853' },
  { label: '+855', value: '+855' },
  { label: '+856', value: '+856' },
  { label: '+886', value: '+886' },
]

const countryCode = ref('+86')
const mobile = ref(accountInfo.value?.Phone || '')
const verificationCode = ref('')
const loading = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)
const hasRequestedCode = ref(false) // 已經按過一次驗證碼

const canSubmit = computed(() => {
  return mobile.value.trim() && verificationCode.value.trim()
})

// 获取验证码
const getVerificationCode = async () => {
  if (!mobile.value.trim()) {
    return
  }

  // 先檢查手機號長度要大於5位
  if (mobile.value.trim().length < 5) {
    showFailToast('请输入5位以上手机号!')
    return
  }

  // TODO: 之後優化需加上手机号字数 ≥ 5，跳图形验证彈窗

  if (countdown.value > 0) {
    return
  }

  codeLoading.value = true
  try {
    const res = await API.system.phoneVerify(
      {
        Number: `${countryCode.value.replace('+', '')}_${mobile.value.trim()}`,
        DeviceId: getDeviceId() ?? '',
        OpType: 12
      }
    )
    if (res.data.Code !== 200) {
      console.error(res.data)
      showFailToast(res.data.Msg)
      return
    }

    hasRequestedCode.value = true
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('获取验证码失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    codeLoading.value = false
  }
}

const submit = async () => {
  loading.value = true
  formRef.value?.validate().then(async () => {
    try {
      const phoneNumber = `${countryCode.value.replace('+', '')}_${mobile.value.trim()}`
      const res = await API.admin.updatePhone({
        Phone: phoneNumber,
        VerifyCode: verificationCode.value.trim(),
        AreaCode: countryCode.value.replace('+', '')
      })
      if (res.data.Code !== 200) return
      showToast('编辑成功')
      router.replace({ name: 'mineProfile' })
    } catch (error: any) {
      console.error('更新失败：', error)
      showFailToast(error?.response?.data?.Msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="手机号" />

    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <!-- 手机号输入 -->
      <AppField
        v-model="mobile"
        name="mobile"
        label-align="top"
        label="手机号"
        placeholder="请输入"
        required
        :rules="[rulesTelephone()]"
      >
        <template #input>
          <div class="flex items-center w-full">
            <DropdownFilled v-model="countryCode" :options="countryCodeOptions" height="2rem" />
            <input
              :value="mobile"
              type="number"
              class="flex-1 outline-none pl-2.5"
              placeholder="请输入"
              @input="(e: Event) => { mobile = (e.target as HTMLInputElement).value }"
            />
          </div>
        </template>
      </AppField>

      <!-- 验证码输入 -->
      <AppField
        v-model="verificationCode"
        name="verificationCode"
        label-align="top"
        label="验证码"
        placeholder="请输入"
        required
        autocomplete="off"
        :rules="[rulesVerifyCode()]"
        :maxlength="6"
        type="number"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :value="verificationCode"
              type="text"
              class="flex-1 outline-none bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { verificationCode = (e.target as HTMLInputElement).value }"
            />
            <van-button
              :loading="codeLoading"
              :disabled="!mobile.trim() || countdown > 0"
              size="small"
              type="primary"
              round
              class="verificationBtn"
              @click.stop="getVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : (hasRequestedCode ? '重新获取' : '获取验证码') }}
            </van-button>
          </div>
        </template>
      </AppField>
      <div class="px-4 my-4">
        <van-button
          block
          round
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          native-type="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
:deep(.app-field .van-field__control) {
  padding: 0;
}
:deep(.app-field .van-field__body) {
  padding: 8px !important;
}

.verificationBtn {
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
