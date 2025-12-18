<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import getDeviceId from '@/utils/getDeviceId'
import API from '@/apis'

const userStore = useUserStore()
const router = useRouter()

const emit = defineEmits<{
  showGoogleVerify: [username: string, password: string]
  showGoogleBind: [username: string, password: string, googleLoginAuthToken: string]
  showForgotPassword: []
}>()

const IS_SERVE = import.meta.env.DEV

const formData = ref({
  Username: '',
  Password: '',
  ValidCode: '',
  KeyCode: '',
  FromType: 7,
  Domain: IS_SERVE ? import.meta.env.VITE_PROXY_TARGET : window.location.host,
  IsApp: 0,
  UseNewPermission: true,
  Platform: 'H5',
  DeviceId: getDeviceId() ?? '',
})

const loading = ref(false)
const showPassword = ref(false)
const captchaCode = ref('')

const fetchCaptcha = async () => {
  try {
    const res = await API.system.imageValidCode()
    if (res.data.Code !== 200) {
      console.error('### fetchCaptcha Code != 200', res.data)
      return
    }

    captchaCode.value = res.data.Data.Item
    formData.value.ValidCode = ''
    formData.value.KeyCode = res.data.Data.KeyCode
  } catch (err) {
    console.error('取得验证码失败', err)
  }
}

onMounted(() => {
  fetchCaptcha()
})

const handleLogin = async () => {
  if (!formData.value.Username || !formData.value.Password) {
    showToast('请输入帐号和密码')
    return
  }

  if (!formData.value.ValidCode) {
    showToast('请输入验证码')
    return
  }

  loading.value = true

  try {
    const res = await API.system.login(formData.value)
    console.log('###', res.data.Code)
    if (res.data.Code !== 200) {
      showToast(res.data.Msg || '登录失败，请检查帐号密码')
      fetchCaptcha()
      return
    }

    const data = res.data.Data as any

    // 需要 Google 驗證
    if (data.LoginType === 3) {
      emit('showGoogleVerify', formData.value.Username, formData.value.Password)
      return
    }

    // 需要綁定 Google 驗證器
    if (data.IsRequireGoogleAuthBinding === 1) {
      emit('showGoogleBind', formData.value.Username, formData.value.Password, data.GoogleLoginAuthToken || '')
      return
    }

    // 登入成功，交給父組件處理
    userStore.setToken(data.Token)
    userStore.fetchIsLogin()
    showToast('登录成功！')

    router.replace({ name: 'index' })
  } catch (error) {
    console.error('登录失败：', error)
    showToast('登录失败，请检查帐号密码')
    fetchCaptcha()
  } finally {
    loading.value = false
  }
}

const togglePassword = () => showPassword.value = !showPassword.value

const handleForgotPassword = () => {
  emit('showForgotPassword')
}
</script>

<template>
  <div class="login-form-container">
    <van-form @submit="handleLogin" class="login-form">
      <!-- 账号 -->
      <div class="form-group">
        <label class="form-label">账号</label>
        <div class="input-wrapper">
          <input 
            v-model="formData.Username" 
            type="text" 
            placeholder="请输入"
            class="form-input"
          />
        </div>
      </div>

      <!-- 密码 -->
      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="input-wrapper">
          <input 
            v-model="formData.Password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入"
            class="form-input"
          />
          <van-icon 
            :name="showPassword ? 'eye-o' : 'closed-eye'" 
            class="input-icon"
            @click="togglePassword" 
          />
        </div>
      </div>

      <!-- 验证码 -->
      <div class="form-group">
        <label class="form-label">验证码</label>
        <div class="input-wrapper captcha-wrapper">
          <input 
            v-model="formData.ValidCode" 
            type="text" 
            placeholder="请输入"
            class="form-input"
            autocomplete="off"
          />
          <div class="captcha-image" @click="fetchCaptcha">
            <img v-if="captchaCode" :src="`data:image/png;base64,${captchaCode}`" alt="验证码" />
          </div>
        </div>
      </div>

      <!-- 登录按鈕 -->
      <div class="button-section">
        <van-button 
          block 
          round 
          type="primary" 
          native-type="submit" 
          :loading="loading" 
          loading-text="登录中..."
          class="submit-btn"
        >
          登录
        </van-button>
      </div>

      <!-- 忘记密码 -->
      <div class="forgot-password" @click="handleForgotPassword">
        忘记密码
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.login-form-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 表單 */
.login-form {
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

.input-icon {
  font-size: 1.25rem;
  color: var(--color-primary-normal);
  cursor: pointer;
}

/* 驗證碼 */
.captcha-wrapper {
  gap: 0.75rem;
}

.captcha-image {
  width: 6rem;
  height: 2.5rem;
  border-radius: 0.25rem;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

/* 忘記密碼 */
.forgot-password {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-primary-normal);
  cursor: pointer;
}
</style>
