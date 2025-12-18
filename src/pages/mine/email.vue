<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { rulesRequired, rulesMail, rulesVerifyCode } from '@/utils/formRules'
import { useVerificationCountdown } from './useVerificationCountdown.ts'
import type { FormInstance } from 'vant'
import API from '@/apis'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance | null>(null)
const email = ref<string>(userStore.accountInfo?.Email || '')
const verificationCode = ref<string>('')
const loading = ref<boolean>(false)

const {
  countdown,
  loading: codeLoading,
  start: startCountdown
} = useVerificationCountdown(60)


// 获取验证码
const getVerificationCode = async () => {
  const emailValue = email.value.trim()
  if (!emailValue) return

  try {
    await formRef.value?.validate('email')
  } catch {
    return
  }

  await startCountdown(async () => {
    const res = await API.system.emailVerify({ Email: emailValue })
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

    const res = await API.admin.updateEmail({
      Email: email.value.trim(),
      VerifyCode: verificationCode.value.trim()
    })

    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }

    showSuccessToast('修改成功')
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
    <NavBar title="邮箱地址" />

    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField
        v-model="email"
        name="email"
        label-align="top"
        label="邮箱地址"
        placeholder="请输入"
        required
        type="email"
        :rules="[rulesRequired(), rulesMail()]"
      />

      <AppField
        v-model="verificationCode"
        name="verificationCode"
        label-align="top"
        label="邮箱验证码"
        placeholder="请输入"
        required
        autocomplete="off"
        maxlength="6"
        type="number"
        :rules="[rulesRequired(), rulesVerifyCode()]"
      >
        <template #right-icon>
          <van-button
            :loading="codeLoading"
            :disabled="!email.trim() || countdown > 0"
            size="small"
            type="primary"
            round
            class="verificationBtn"
            @click.stop="getVerificationCode"
          >
            {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
          </van-button>
        </template>
      </AppField>
      <div class="px-4 my-4">
        <van-button
          block
          round
          type="primary"
          class="gray-disabled"
          :loading="loading"
          :disabled="!email.trim() || !verificationCode.trim()"
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

/* 国家代码选择器样式 */
.mobile-country-code :deep(.dropdown-button) {
  height: auto !important;
  padding: 8px !important;
  border: none !important;
  background: #f8fafd !important;
  min-width: 3.5rem;
}

.mobile-country-code :deep(.dropdown-button:hover),
.mobile-country-code :deep(.dropdown-button[data-state="open"]) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.verificationBtn {
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
