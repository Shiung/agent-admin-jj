<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { opTypeConf } from '@/consts/constant'
import { rulesRequired, rulesVerifyCode } from '@/utils/formRules'
import { useVerificationCountdown } from '../../useVerificationCountdown.ts'
import API from '@/apis'
import AppField from '@/components/AppField/index.vue'
import getDeviceId from '@/utils/getDeviceId'
import ImageCaptchaDialog from '@/components/ImageCaptchaDialog/index.vue'

interface Props {
  ValidType: number
  VerifyCode: string
  verifiable: boolean
}

const props = withDefaults(defineProps<Props>(), {
  ValidType: 0,
  VerifyCode: '',
  verifiable: false
})
const {
  countdown,
  loading: codeLoading,
  hasRequested: hasRequestedCode,
  start: startCountdown
} = useVerificationCountdown(60)

const userStore = useUserStore()
const validType = ref<number>(props.ValidType)
const verificationCode = ref<string>(props.VerifyCode)
const showImageCaptcha = ref<boolean>(false)
const adminInfo = computed(() => userStore.userInfo?.Admin || {})

const emit = defineEmits<{
  (e: 'update:ValidType', value: number): void
  (e: 'update:VerifyCode', value: string): void
}>()

const validTypeOptions = [
  { label: '手机验证', value: 0 },
  { label: '邮箱验证', value: 1 },
  { label: '谷歌验证', value: 2 }
]
const captchaType = computed<'phone' | 'email'>(() => {
  return validType.value === 0 ? 'phone' : 'email'
})

const getVerificationCode = async () => {
  if (countdown.value > 0) {
    return
  }

  if (validType.value === 0 || validType.value === 1) {
    showImageCaptcha.value = true
    return
  }
}

const handleCaptchaVerifySuccess = async () => {
  showImageCaptcha.value = false
  showToast('验证码已发送，请注意查收!')

  const baseParams = {
    DeviceId: getDeviceId() ?? '',
    OpType: opTypeConf.INFO_SETTING_PRIVATE
  }

  type VerificationType = 0 | 1
  const verificationConfig: Record<VerificationType, {
    api: () => Promise<any>
  }> = {
    0: {
      api: () => API.system.phoneVerify({
        Number: adminInfo.value.Mobile || '',
        ...baseParams
      }, { customErrorHandling: true })
    },
    1: {
      api: () => API.system.emailVerify({
        Email: adminInfo.value.Email || '',
        ...baseParams
      }, { customErrorHandling: true })
    }
  }

   await startCountdown(async () => {
     const config = verificationConfig[validType.value as VerificationType]
     if (!config) return false

     const res = await config.api()
     if (res.data.Code !== 200) {
       const errorMsg = validType.value === 0 ? '尚未绑定手机号' : '尚未绑定邮箱地址'
       showFailToast(errorMsg)
       return false
     }
     return true
   })
}

</script>

<template>
  <div>
    <AppField required name="validType" label-align="top" label="选择验证方式" class="radio-field">
      <template #input>
        <div class="radio-group">
          <label v-for="option in validTypeOptions" :key="option.value" class="radio-item">
            <input
              type="radio"
              :value="option.value"
              v-model="validType"
              class="radio-input"
              @change="emit('update:ValidType', validType)"
              @update:modelValue="emit('update:ValidType', $event)"
            />
            <span class="ml-2">{{ option.label }}</span>
          </label>
        </div>
      </template>
    </AppField>
    <AppField
      required
      name="verificationCode"
      :label="`${validTypeOptions.find(option => option.value === validType)?.label}码`"
      v-model="verificationCode"
      :rules="[rulesRequired(), rulesVerifyCode()]"
      maxlength="6"
      type="number"
      placeholder="请输入"
      @update:model-value="(val) => emit('update:VerifyCode', String(val ?? ''))"
      @input="(e: Event) => {
        verificationCode = (e.target as HTMLInputElement).value
        emit('update:VerifyCode', verificationCode)
      }"
    >
      <template #right-icon>
        <van-button
          v-if="validType !== 2"
          :loading="codeLoading"
          :disabled="countdown > 0 || !props.verifiable"
          size="small"
          type="primary"
          round
          class="verificationBtn"
          @click.stop="getVerificationCode"
        >
          {{ countdown > 0 ? `${countdown}秒` : (hasRequestedCode ? '重新获取' : '获取验证码') }}
        </van-button>
      </template>
    </AppField>
    <!-- 圖片驗證碼 -->
    <ImageCaptchaDialog
      v-model:show="showImageCaptcha"
      :type="captchaType"
      :skipSendCode="true"
      @verifySuccess="handleCaptchaVerifySuccess"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.radio-field .van-field__body) {
  border: none;
  padding: 0;
}

.radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  width: 100%;
  padding: 12px 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.radio-input {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  background-color: transparent;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:checked {
    border-width: 2px;
    border-color: var(--color-primary-normal);

    &::after {
      background-color: var(--color-primary-normal);
      opacity: 1;
      width: 9px;
      height: 9px;
    }
  }

  &:not(:checked)::after {
    opacity: 0;
  }
}

:deep(.app-field .van-field__control) {
  padding: 0;
}
:deep(.app-field .van-field__body) {
  padding: 8px !important;
}

</style>
