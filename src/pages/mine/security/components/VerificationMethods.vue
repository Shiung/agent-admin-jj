<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { showToast, showFailToast } from 'vant'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'
import getDeviceId from '@/utils/getDeviceId'
import { opTypeConf } from '@/consts/constant'
import { rulesRequired } from '@/utils/formRules'

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
const emit = defineEmits<{
  (e: 'update:ValidType', value: number): void
  (e: 'update:VerifyCode', value: string): void
}>()

const userStore = useUserStore()
const adminInfo = computed(() => userStore.userInfo?.Admin || {})
const validType = ref(props.ValidType)
const verificationCode = ref(props.VerifyCode)
const codeLoading = ref(false)
const countdown = ref(0)

const validTypeOptions = [
  { label: '手机验证', value: 0 },
  { label: '邮箱验证', value: 1 },
  { label: '谷歌验证', value: 2 }
]

watch(() => props.ValidType, (newVal) => {
  validType.value = newVal
})
watch(() => props.VerifyCode, (newVal) => {
  verificationCode.value = newVal
})

const getVerificationCode = async () => {
  if (countdown.value > 0) {
    return
  }

  const baseParams = {
    DeviceId: getDeviceId() ?? '',
    OpType: opTypeConf.INFO_SETTING_PRIVATE
  }

  type VerificationType = 0 | 1
  const verificationConfig: Record<VerificationType, {
    api: () => Promise<any>
  }> = {
    0: {
      api: () => API.system.sendPhoneVerifyCode({
        Number: adminInfo.value.Mobile || '',
        ...baseParams
      })
    },
    1: {
      api: () => API.system.sendEmailVerifyCode({
        Email: adminInfo.value.Email || '',
        ...baseParams
      })
    }
  }

  const config = verificationConfig[validType.value as VerificationType]
  if (!config) return

  codeLoading.value = true
  try {
    const res = await config.api()
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }

    showToast('驗證碼已發送，請注意查收')

    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('獲取驗證碼失敗：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    codeLoading.value = false
  }
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
      :rules="[rulesRequired(), { pattern: /^\d{6}$/, message: '请输入6位数验证码' }]"
      @update:model-value="(val) => emit('update:VerifyCode', String(val ?? ''))"
    >
      <template #input>
        <div class="flex items-center w-full gap-2">
          <input
            :value="verificationCode"
            class="flex-1 outline-none bg-transparent pl-2.5 text-base text-neutral-basic placeholder:text-neutral2-fourth"
            placeholder="请输入"
            maxlength="6"
            @input="(e: Event) => {
              const value = (e.target as HTMLInputElement).value
              verificationCode = value
              emit('update:VerifyCode', value)
            }"
          />
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
            {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
          </van-button>
        </div>
      </template>
    </AppField>
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
