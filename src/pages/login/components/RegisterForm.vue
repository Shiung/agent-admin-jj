<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useGlobalStore } from '@/stores/global'
import API from '@/apis'
import getDeviceId from '@/utils/getDeviceId'
import ImageCaptchaDialog from '@/components/ImageCaptchaDialog/index.vue'
import DropdownFilled from '@/components/Dropdown/Filled.vue'
import { countryCodeOptions } from '@/consts/constant'

const IS_SERVE = import.meta.env.DEV

const globalStore = useGlobalStore()

const needBindPhone = computed(() => !!globalStore.systemConfig.PhoneRegister)

const needBindEmail = computed(() => !!globalStore.systemConfig.EmailRegister)

const emit = defineEmits(['registerSuccess'])

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  emailCode: '',
  inviteCode: '',
  phone: '',
  phoneCode: '',
  countryCode: '86',
})

// 表單錯誤訊息
const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  emailCode: '',
  phone: '',
  phoneCode: '',
})

// 驗證規則
const validateUsername = () => {
  const value = formData.value.username.trim()
  if (!value) {
    errors.username = '请输入账号'
    return false
  }
  if (value.length < 6 || value.length > 20) {
    errors.username = '账号长度需为6-20个字符'
    return false
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    errors.username = '账号只能包含字母和数字'
    return false
  }
  errors.username = ''
  return true
}

const validatePassword = () => {
  const value = formData.value.password
  if (!value) {
    errors.password = '请输入密码'
    return false
  }
  if (value.length < 8 || value.length > 20) {
    errors.password = '密码长度需为8-20个字符'
    return false
  }
  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  const value = formData.value.confirmPassword
  if (!value) {
    errors.confirmPassword = '请确认密码'
    return false
  }
  if (value !== formData.value.password) {
    errors.confirmPassword = '两次输入的密码不一致'
    return false
  }
  errors.confirmPassword = ''
  return true
}

const validateEmail = () => {
  if (!needBindEmail.value) return true
  const value = formData.value.email.trim()
  if (!value) {
    errors.email = '请输入邮箱地址'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    errors.email = '请输入正确的邮箱格式'
    return false
  }
  errors.email = ''
  return true
}

const validateEmailCode = () => {
  if (!needBindEmail.value) return true
  const value = formData.value.emailCode.trim()
  if (!value) {
    errors.emailCode = '请输入邮箱验证码'
    return false
  }
  errors.emailCode = ''
  return true
}

const validatePhone = () => {
  if (!needBindPhone.value) return true
  const value = formData.value.phone.trim()
  if (!value) {
    errors.phone = '请输入手机号'
    return false
  }
  if (!/^\d+$/.test(value)) {
    errors.phone = '手机号只能包含数字'
    return false
  }
  errors.phone = ''
  return true
}

const validatePhoneCode = () => {
  if (!needBindPhone.value) return true
  const value = formData.value.phoneCode.trim()
  if (!value) {
    errors.phoneCode = '请输入手机验证码'
    return false
  }
  errors.phoneCode = ''
  return true
}

// 驗證全部表單
const validateForm = () => {
  const results = [
    validateUsername(),
    validatePassword(),
    validateConfirmPassword(),
    validateEmail(),
    validateEmailCode(),
    validatePhone(),
    validatePhoneCode(),
  ]
  return results.every(Boolean)
}

// 清除單個欄位錯誤
const clearError = (field: keyof typeof errors) => {
  errors[field] = ''
}

const showPassword = ref(false)
const emailLoading = ref(false)
const phoneLoading = ref(false)
const emailCountdown = ref(0)
const phoneCountdown = ref(0)

// 圖片驗證碼彈窗控制
const showImageCaptcha = ref(false)
const captchaType = ref<'phone' | 'email'>('phone')

const togglePassword = () => showPassword.value = !showPassword.value

// 點擊獲取郵箱驗證碼 - 彈出圖片驗證
const handleGetEmailCode = () => {
  if (!validateEmail()) return
  captchaType.value = 'email'
  showImageCaptcha.value = true
}

// 點擊獲取手機驗證碼 - 彈出圖片驗證
const handleGetPhoneCode = () => {
  if (!validatePhone()) return
  captchaType.value = 'phone'
  showImageCaptcha.value = true
}

// 圖片驗證成功後的回調
const handleCaptchaSuccess = () => {
  if (captchaType.value === 'email') {
    startEmailCountdown()
  } else {
    startPhoneCountdown()
  }
}

const startEmailCountdown = () => {
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const startPhoneCountdown = () => {
  phoneCountdown.value = 60
  const timer = setInterval(() => {
    phoneCountdown.value--
    if (phoneCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleRegister = async () => {
  // 先驗證表單
  if (!validateForm()) return

  const data = {
    Username: formData.value.username,
    Password: formData.value.password,
    Invt: formData.value.inviteCode,
    DevicePlatform: 'H5',
    AgentId: globalStore.systemConfig.AgentId,
    DeviceId: getDeviceId() ?? '',
    Domain: IS_SERVE ? import.meta.env.VITE_PROXY_TARGET : window.location.host,
    ...(needBindEmail.value ? { Email: formData.value.email, Code: formData.value.emailCode } : {}),
    ...(needBindPhone.value ? { IAC: formData.value.countryCode.replace('+', ''), Number: formData.value.phone, Code: formData.value.phoneCode } : {}),
  }

  const registerFunctionKey = needBindEmail.value ? 'emailRegisterv2' : needBindPhone.value ? 'phoneRegisterv2' : 'registerv2'
  const res = await API.system[registerFunctionKey](data as any)

  if (res.data.Code !== 200) return

  showToast('恭喜您,注册成功')
  resetForm()
  emit('registerSuccess')
}

// 重置表單
const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    emailCode: '',
    inviteCode: '',
    phone: '',
    phoneCode: '',
    countryCode: '86',
  }
  // 清除所有錯誤訊息
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// 獲取完整手機號碼（帶國碼）
const fullPhoneNumber = computed(() => {
  return `${formData.value.countryCode.replace('+', '')}_${formData.value.phone}`
})
</script>


<template>
  <div class="register-form-container">
    <van-form @submit="handleRegister" class="register-form">
      <!-- 账号 -->
      <div class="form-group">
        <label class="form-label">账号</label>
        <div class="input-wrapper" :class="{ 'input-error': errors.username }">
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入"
            class="form-input"
            @input="clearError('username')"
          />
        </div>
        <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
      </div>

      <!-- 密码 -->
      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="input-wrapper" :class="{ 'input-error': errors.password }">
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入"
            class="form-input"
            @input="clearError('password')"
          />
          <van-icon
            :name="showPassword ? 'eye-o' : 'closed-eye'"
            class="input-icon"
            @click="togglePassword"
          />
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <!-- 确认密码 -->
      <div class="form-group">
        <label class="form-label">确认密码</label>
        <div class="input-wrapper" :class="{ 'input-error': errors.confirmPassword }">
          <input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请输入"
            class="form-input"
            @input="clearError('confirmPassword')"
          />
        </div>
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <template v-if="needBindEmail">
        <!-- 邮箱地址 -->
        <div class="form-group">
          <label class="form-label">邮箱地址</label>
          <div class="input-wrapper" :class="{ 'input-error': errors.email }">
            <input
              v-model="formData.email"
              type="email"
              placeholder="请输入"
              class="form-input"
              @input="clearError('email')"
            />
          </div>
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <!-- 邮箱验证码 -->
        <div class="form-group">
          <label class="form-label">邮箱验证码</label>
          <div class="input-wrapper code-wrapper" :class="{ 'input-error': errors.emailCode }">
            <input
              v-model="formData.emailCode"
              type="text"
              placeholder="请输入"
              class="form-input"
              autocomplete="off"
              @input="clearError('emailCode')"
            />
            <van-button
              type="primary"
              round
              class="code-btn"
              :loading="emailLoading"
              :disabled="emailCountdown > 0"
              @click.prevent="handleGetEmailCode"
            >
              {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
            </van-button>
          </div>
          <span v-if="errors.emailCode" class="error-message">{{ errors.emailCode }}</span>
        </div>
      </template>

      <template v-if="needBindPhone">
        <!-- 手机号 -->
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="input-wrapper phone-wrapper" :class="{ 'input-error': errors.phone }">
            <div class="country-code">
              <DropdownFilled v-model="formData.countryCode" placeholder="请选择" height="2rem" :options="countryCodeOptions" />
            </div>
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="请输入"
              class="form-input"
              @input="clearError('phone')"
            />
          </div>
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <!-- 手机号验证码 -->
        <div class="form-group">
          <label class="form-label">手机号验证码</label>
          <div class="input-wrapper code-wrapper" :class="{ 'input-error': errors.phoneCode }">
            <input
              v-model="formData.phoneCode"
              type="text"
              placeholder="请输入"
              class="form-input"
              autocomplete="off"
              @input="clearError('phoneCode')"
            />
            <van-button
              type="primary"
              round
              class="code-btn"
              :loading="phoneLoading"
              :disabled="phoneCountdown > 0"
              @click.prevent="handleGetPhoneCode"
            >
              {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
            </van-button>
          </div>
          <span v-if="errors.phoneCode" class="error-message">{{ errors.phoneCode }}</span>
        </div>
      </template>

      <!-- 邀请码 -->
      <div class="form-group">
        <label class="form-label">邀请码</label>
        <div class="input-wrapper">
          <input
            v-model="formData.inviteCode"
            type="text"
            placeholder="请输入"
            class="form-input"
          />
        </div>
      </div>

      <!-- 注册按鈕 -->
      <div class="button-section">
        <van-button
          block
          round
          type="primary"
          native-type="submit"
          class="submit-btn"
        >
          注册
        </van-button>
      </div>
    </van-form>

    <!-- 圖片驗證碼彈窗 -->
    <ImageCaptchaDialog
      v-model:show="showImageCaptcha"
      :type="captchaType"
      :phone="fullPhoneNumber"
      :email="formData.email"
      :username="formData.username"
      @success="handleCaptchaSuccess"
    />
  </div>
</template>

<style scoped>
.register-form-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 表單 */
.register-form {
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

/* 驗證碼按鈕 */
.code-wrapper {
  gap: 0.5rem;
  padding-right: 0;
}

.code-btn {
  flex-shrink: 0;
  padding: 0 1rem;
  font-size: 0.75rem;
}

/* 手機號國碼 */
.phone-wrapper {
  gap: 0.5rem;
}

.country-code {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.5rem;
  border-right: 1px solid var(--color-neutral2-sixth);
  color: var(--color-neutral2-basic);
  font-size: 0.875rem;
  cursor: pointer;
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

/* 錯誤訊息樣式 */
.input-error {
  border-color: #f56c6c !important;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  padding-left: 1rem;
  font-size: 0.75rem;
  color: #f56c6c;
}
</style>
