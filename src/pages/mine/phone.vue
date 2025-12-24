<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { rulesRequired, rulesVerifyCode } from '@/utils/formRules'
import { useVerificationCountdown } from './useVerificationCountdown.ts'
import { countryCodeOptions, opTypeConf } from '@/consts/constant'
import type { FormInstance } from 'vant'
import API from '@/apis'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import DropdownFilled from '@/components/Dropdown/Filled.vue'
import ImageCaptchaDialog from '@/components/ImageCaptchaDialog/index.vue'
import getDeviceId from '@/utils/getDeviceId'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance | null>(null)
const countryCode = ref<string>('86')
const mobile = ref<string>(userStore.accountInfo?.Phone || '')
const verificationCode = ref<string>('')
const loading = ref<boolean>(false)
const showImageCaptcha = ref<boolean>(false)
const enableEdit = computed(() => {
  return mobile.value.trim() && verificationCode.value.trim() && verificationCode.value.length === 6
})

const fullPhoneNumber = computed(() => {
  return `${countryCode.value.trim()}_${mobile.value.trim()}`
})

const {
  countdown,
  loading: codeLoading,
  hasRequested: hasRequestedCode,
  start: startCountdown
} = useVerificationCountdown(60)

// 获取验证码
const getVerificationCode = async () => {
  const mobileValue = mobile.value.trim()
  if (!mobileValue) return

  // 先檢查手機號長度要大於5位
  if (mobileValue.length < 5) {
    showFailToast('请输入5位以上手机号!')
    return
  }

  try {
    await formRef.value?.validate('mobile')
  } catch {
    return
  }
  showImageCaptcha.value = true
}

const handleCaptchaVerifySuccess = async () => {
  showImageCaptcha.value = false
  showToast('验证码已发送，请注意查收!')

  await startCountdown(async () => {
    const res = await API.system.phoneVerify({
      Number: fullPhoneNumber.value,
      DeviceId: getDeviceId() ?? '',
      OpType: opTypeConf.INFO_BIND_PHONE
    })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return false
    }
    return true
  })
}

const submit = async () => {
  if (loading.value) return

  try {
    loading.value = true
    await formRef.value?.validate()

    const res = await API.admin.updatePhone({
      Phone: mobile.value.trim(),
      VerifyCode: verificationCode.value.trim(),
      AreaCode: countryCode.value.trim()
    })

    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }

    showSuccessToast('编辑成功')
    router.replace({ name: 'mineProfile' })
  } catch (error: any) {
    console.error('更新失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    loading.value = false
  }
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
        type="number"
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full">
            <DropdownFilled v-model="countryCode" :options="countryCodeOptions" height="2rem" />
            <input
              :value="mobile"
              type="number"
              class="flex-1 pl-2 outline-none"
              placeholder="请输入"
              maxlength="11"
              @input="(e: Event) => { mobile = (e.target as HTMLInputElement).value.replace(/\D/g, '') }"
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
        :rules="[rulesRequired(), rulesVerifyCode()]"
        :maxlength="6"
        type="number"
      >
        <template #right-icon>
          <van-button
            :loading="codeLoading"
            :disabled="!mobile.trim() || countdown > 0"
              size="small"
              type="primary"
              round
              class="verificationBtn"
              @click.stop="getVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}s 后获取` : (hasRequestedCode ? '重新获取' : '获取验证码') }}
            </van-button>
        </template>
      </AppField>
      <div class="px-4 my-4">
        <van-button
          block
          round
          type="primary"
          :loading="loading"
          :disabled="!enableEdit"
          class="gray-disabled"
          native-type="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>

    <!-- 圖片驗證碼彈窗 -->
    <ImageCaptchaDialog
      v-model:show="showImageCaptcha"
      type="phone"
      :phone="fullPhoneNumber"
      :skipSendCode="true"
      @verifySuccess="handleCaptchaVerifySuccess"
    />
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
