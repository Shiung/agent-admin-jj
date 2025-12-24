<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { rulesRequired } from '@/utils/formRules'
import type { FormInstance } from 'vant'
import API from '@/apis'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import VerificationMethods from './components/VerificationMethods.vue'

const router = useRouter()

const loading = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const privatePassword = ref<string>('')
const confirmPrivatePassword = ref<string>('')
const validType = ref<number>(0)
const verificationCode = ref<string>('')
const showPassword = ref<{ current: boolean, confirm: boolean }>({ current: false, confirm: false })

const enableEdit = computed(() => {
  return !!privatePassword.value.trim() && !!confirmPrivatePassword.value.trim() && verificationCode.value.length === 6
})

const togglePassword = (type: 'current' | 'confirm') => {
  showPassword.value[type] = !showPassword.value[type]
}

const validateConfirmPassword = (val: string) => {
  return val === privatePassword.value
}

const handlePrivatePasswordInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  privatePassword.value = target.value

  if (confirmPrivatePassword.value) {
    formRef.value?.validate('confirmPassword')
  }
}

const handleConfirmPasswordInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  confirmPrivatePassword.value = target.value

  if (confirmPrivatePassword.value && privatePassword.value) {
    formRef.value?.validate('confirmPassword')
  }
}

const submit = async () => {
  if (loading.value) return
  try {
    loading.value = true
    await formRef.value?.validate()

    const res = await API.admin.updatePrivatePasswordV2({
      NewPassword: privatePassword.value.trim(),
      ConfirmPassword: confirmPrivatePassword.value.trim(),
      VerifyCode: verificationCode.value.trim(),
      ValidType: validType.value,
    })

    if (res.data.Code !== 200) {
      if (res.data.Code === 10152 || res.data.Code === 10034) {
        showToast('验证码错误')
      } else {
        showFailToast(res.data.Msg)
      }
      return
    }

    showToast('编辑成功')
    router.replace({ name: 'security' })
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
    <NavBar title="私人密码" />
    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField
        v-model="privatePassword"
        name="privatePassword"
        label-align="top"
        label="私人密码"
        placeholder="请输入"
        required
        maxlength="20"
        :rules="[rulesRequired()]"
        :type="showPassword.current ? 'text' : 'password'"
        @input="handlePrivatePasswordInput"
      >
        <template #right-icon>
          <van-icon
            :name="showPassword.current ? 'eye-o' : 'closed-eye'"
            class="cursor-pointer"
            @click.stop="togglePassword('current')"
          />
        </template>
      </AppField>
      <AppField
        v-model="confirmPrivatePassword"
        name="confirmPassword"
        label-align="top"
        label="确认私人密码"
        placeholder="请输入"
        required
        maxlength="20"
        :rules="[rulesRequired(), { validator: validateConfirmPassword, message: '密码不一致' }]"
        :type="showPassword.confirm ? 'text' : 'password'"
        @input="handleConfirmPasswordInput"
      >
        <template #right-icon>
          <van-icon
            :name="showPassword.confirm ? 'eye-o' : 'closed-eye'"
            class="cursor-pointer"
            @click.stop="togglePassword('confirm')"
          />
        </template>
      </AppField>
      <VerificationMethods
        :ValidType="validType"
        :VerifyCode="verificationCode"
        :verifiable="!!privatePassword.trim() && !!confirmPrivatePassword.trim()"
        @update:ValidType="validType = $event"
        @update:VerifyCode="verificationCode = $event"
      />
      <div class="px-4 my-4">
        <van-button
          block
          round
          class="gray-disabled"
          type="primary"
          :disabled="!enableEdit"
          :loading="loading"
          native-type="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>
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
