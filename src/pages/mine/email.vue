<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showFailToast } from 'vant'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'
import { rulesRequired } from '@/utils/formRules'
import type { FormInstance } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const email = ref(userStore.accountInfo?.Email || '')
const verificationCode = ref('')
const loading = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)
const formRef = ref<FormInstance | null>(null)

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// 获取验证码
const getVerificationCode = async () => {
  if (!validateEmail(email.value)) {
    showFailToast('请输入正确的邮箱地址')
    return
  }

  if (countdown.value > 0) {
    return
  }

  codeLoading.value = true
  try {
    const res = await API.system.emailVerify({ Email: email.value.trim() })
    if (res.data.Code !== 200) {
      console.error(res.data)
      return
    }

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('获取验证码失败：', error)
  } finally {
    codeLoading.value = false
  }
}

const submit = async () => {
  loading.value = true
  formRef.value?.validate().then(async () => {
    try {
      const res = await API.admin.updateEmail({
        Email: email.value.trim(),
        VerifyCode: verificationCode.value.trim()
      })
      if (res.data.Code !== 200) {
        showFailToast(res.data.Msg)
        return
      }
      showToast('修改成功')
      router.replace({ name: 'mineProfile' })
      } catch (error) {
        console.error('更新失败：', error)
      } finally {
        loading.value = false
      }
  })
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="邮箱地址" />

    <div class="py-3">
      <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
        <AppField
          v-model="email"
          name="email"
          label-align="top"
          label="邮箱地址"
          placeholder="请输入"
          required
          :rules="[rulesRequired()]"
        >
          <template #input>
            <div class="flex items-center w-full gap-2">
              <input
                :value="email"
                type="email"
                class="flex-1 outline-none pl-2.5"
                placeholder="请输入"
                @input="(e: Event) => { email = (e.target as HTMLInputElement).value }"
              />
            </div>
          </template>
        </AppField>

        <AppField
          v-model="verificationCode"
          name="verificationCode"
          label-align="top"
          label="邮箱验证码"
          placeholder="请输入"
          required
          autocomplete="off"
        >
          <template #input>
            <div class="flex items-center w-full gap-2">
              <input
                :value="verificationCode"
                type="text"
                class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
                placeholder="请输入"
                @input="(e: Event) => { verificationCode = (e.target as HTMLInputElement).value }"
              />
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
            </div>
          </template>
        </AppField>
        <div class="px-4 my-4">
          <van-button
            block
            round
            type="primary"
            :loading="loading"
            :disabled="!email.trim() || !verificationCode.trim()"
            native-type="submit"
          >
            提交
          </van-button>
        </div>
      </van-form>
    </div>
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
