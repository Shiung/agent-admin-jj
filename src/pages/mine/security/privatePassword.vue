<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import { rulesRequired } from '@/utils/formRules'
import API from '@/apis'
import VerificationMethods from './components/VerificationMethods.vue'
import type { FormInstance } from 'vant'

const router = useRouter()

const loading = ref(false)
const formRef = ref<FormInstance | null>(null)
const privatePassword = ref('')
const confirmPrivatePassword = ref('')
const validType = ref(0)
const verificationCode = ref('')
const showPassword = {
  current: ref(false),
  confirm: ref(false)
}

const canGetVerificationCode = computed(() => {
  return !!privatePassword.value && !!confirmPrivatePassword.value
})

const togglePassword = (type: 'current' | 'confirm') => {
  showPassword[type].value = !showPassword[type].value
}
const submit = async () => {
  loading.value = true
  formRef.value?.validate().then(async () => {
    try {
      const res = await API.admin.updatePrivatePasswordV2({
        NewPassword: privatePassword.value?.trim(),
        ConfirmPassword: confirmPrivatePassword.value?.trim(),
        VerifyCode: verificationCode.value?.trim(),
        ValidType: validType.value,
      })
      if (res.data.Code !== 200) {
        showFailToast(res.data.Msg)
        return
      }
      showToast('修改成功')
      router.replace({ name: 'security' })
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
    <NavBar title="私人密码" />
    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField
        v-model="privatePassword"
        name="privatePassword"
        label-align="top"
        label="私人密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword.current.value ? 'text' : 'password'"
              :value="privatePassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { privatePassword = (e.target as HTMLInputElement).value }"
            />
            <van-icon
              :name="showPassword.current.value ? 'eye-o' : 'closed-eye'"
              class="cursor-pointer"
              @click.stop="togglePassword('current')"
            />
          </div>
        </template>
      </AppField>
      <AppField
        v-model="confirmPrivatePassword"
        name="confirmPassword"
        label-align="top"
        label="确认私人密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword.confirm.value ? 'text' : 'password'"
              :value="confirmPrivatePassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { confirmPrivatePassword = (e.target as HTMLInputElement).value }"
            />
            <van-icon
              :name="showPassword.confirm.value ? 'eye-o' : 'closed-eye'"
              class="cursor-pointer"
              @click.stop="togglePassword('confirm')"
            />
          </div>
        </template>
      </AppField>
      <VerificationMethods
        :ValidType="validType"
        :VerifyCode="verificationCode"
        :verifiable="canGetVerificationCode"
        @update:ValidType="validType = $event"
        @update:VerifyCode="verificationCode = $event"
      />
      <div class="px-4 my-4">
        <van-button block round type="primary" :disabled="!privatePassword || !confirmPrivatePassword" :loading="loading" native-type="submit">提交</van-button>
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
