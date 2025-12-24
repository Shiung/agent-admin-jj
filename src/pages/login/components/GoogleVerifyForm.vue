<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import API from '@/apis'
import { rulesRequired, rulesVerifyCode } from '@/utils/formRules'

interface Props {
  username: string
  password: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const googleCode = ref('')

const handleSubmit = async () => {
  if (!googleCode.value) {
    showToast('请输入Google验证码')
    return
  }

  loading.value = true

  try {
    const payload = {
      Username: props.username,
      Password: props.password,
      ValidCode: googleCode.value,
    }
    const res = await API.system.vLogin(payload)

    if (res.data.Code !== 200) {
      showToast(res.data.Msg || '登录失败，请检查账号密码')
      return
    }

    userStore.setToken(res.data.Data?.Token as any)
    userStore.fetchIsLogin()

    router.replace({ name: 'index' })
    showToast('登录成功！')
  } catch (error) {
    console.error('登录失败：', error)
    showToast('登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  googleCode.value = ''
  emit('close')
}
</script>

<template>
  <div class="google-verify-container">
    <div class="google-header">
      <van-icon name="arrow-left" class="back-icon" @click="handleBack" />
      <span class="google-title">谷歌验证</span>
    </div>

    <van-form @submit="handleSubmit" class="google-form">
      <!-- Google 验证码 -->
      <div class="form-group">
        <AppField
          v-model="googleCode"
          name="googleCode"
          type="number"
          placeholder="请输入"
          class="form-input"
          autocomplete="off"
          maxlength="6"
          :rules="[rulesRequired(), rulesVerifyCode()]"
        />
      </div>

      <!-- 提交按鈕 -->
      <div class="button-section">
        <van-button
          block
          round
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="提交中..."
          class="submit-btn"
          :disabled="String(googleCode).length !== 6"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.google-verify-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: white;
  height: 100%;
}

/* Google 驗證頭部 */
.google-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  margin-bottom: 0.5rem;
}

.back-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  color: var(--color-neutral2-basic);
  cursor: pointer;
}

.google-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 auto;
  color: var(--color-neutral2-basic);
}

/* 表單 */
.google-form {
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-neutral2-basic);
  margin-bottom: 0.5rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  height: 3rem;
  padding: 0 1rem;
  background-color: var(--color-neutral2-eighth);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 1.5rem;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary-normal);
}

.form-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: var(--color-neutral2-basic);
  background: transparent;
}

.form-input::placeholder {
  color: var(--color-neutral2-fourth);
}

/* 按鈕區域 */
.button-section {
  margin-top: 2rem;
  padding: 0 1rem;
}

.submit-btn {
  height: 2.75rem;
  font-size: 1rem;
}
</style>
