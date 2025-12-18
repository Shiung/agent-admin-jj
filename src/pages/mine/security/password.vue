<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import { useUserStore } from '@/stores/user'
import API from '@/apis'
import { rulesRequired, rulesPassword } from '@/utils/formRules'
import type { FormInstance } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const loading = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const oldPassword = ref<string>('')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')
const showPassword = ref<{ old: boolean, new: boolean, confirm: boolean }>({ old: false, new: false, confirm: false })

const togglePassword = (type: 'old' | 'new' | 'confirm') => {
  showPassword.value[type] = !showPassword.value[type]
}

const validateConfirmPassword = (val: string) => {
  return val === newPassword.value
}

const handleOldPasswordInput = (e: Event) => {
  oldPassword.value = (e.target as HTMLInputElement).value
  if (newPassword.value && oldPassword.value) {
    formRef.value?.validate('oldPassword')
  }
}

const handleNewPasswordInput = (e: Event) => {
  newPassword.value = (e.target as HTMLInputElement).value
  if (oldPassword.value && newPassword.value) {
    formRef.value?.validate('newPassword')
  }
}

const handleConfirmPasswordInput = (e: Event) => {
  confirmPassword.value = (e.target as HTMLInputElement).value
  if (newPassword.value && confirmPassword.value) {
    formRef.value?.validate('confirmPassword')
  }
}

const submit = async () => {
  if (loading.value) return

  try {
    loading.value = true
    await formRef.value?.validate()

    const res = await API.admin.updateLoginPassword({
      OldPassword: oldPassword.value?.trim(),
      NewPassword: newPassword.value?.trim(),
      ConfirmPassword: confirmPassword.value?.trim(),
    })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }

    showSuccessToast('修改成功，请重新登录')
    userStore.logout()
    router.replace({ name: 'login' })
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
    <NavBar title="登录密码" />
    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField
        v-model="oldPassword"
        name="oldPassword"
        label-align="top"
        label="原密码"
        placeholder="请输入"
        required
        :type="showPassword.old ? 'text' : 'password'"
        :rules="[rulesRequired(), rulesPassword()]"
        @input="handleOldPasswordInput"
      >
        <template #right-icon>
          <van-icon
            :name="showPassword.old ? 'eye-o' : 'closed-eye'"
            class="cursor-pointer"
            @click.stop="togglePassword('old')"
          />
        </template>
      </AppField>
      <AppField
        v-model="newPassword"
        name="newPassword"
        label-align="top"
        label="新密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired(), rulesPassword()]"
        :type="showPassword.new ? 'text' : 'password'"
        @input="handleNewPasswordInput"
      >
        <template #right-icon>
          <van-icon
            :name="showPassword.new ? 'eye-o' : 'closed-eye'"
            class="cursor-pointer"
            @click.stop="togglePassword('new')"
          />
        </template>
      </AppField>
      <AppField
        v-model="confirmPassword"
        name="confirmPassword"
        label-align="top"
        label="确认密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired(), rulesPassword(), { validator: validateConfirmPassword, message: '密码不一致' }]"
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
      <div class="px-4 my-4">
        <van-button
          block
          round
          type="primary"
          class="gray-disabled"
          :loading="loading"
          :disabled="!oldPassword || !newPassword || !confirmPassword"
          native-type="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>
