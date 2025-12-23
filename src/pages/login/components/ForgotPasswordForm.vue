<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { countryCodeOptions } from '@/consts/constant'
import API from '@/apis'
import DropdownFilled from '@/components/Dropdown/Filled.vue'
import ImageCaptchaDialog from '@/components/ImageCaptchaDialog/index.vue'

const emit = defineEmits<{
  close: []
  success: []
}>()

const globalStore = useGlobalStore()

// 步驟: 1=填寫用戶名, 2=身份驗證, 3=設置密碼
const currentStep = ref(1)

// 表單數據
const formData = ref({
  username: '',
  countryCode: '86',
  phone: '',
  email: '',
  // 驗證碼
  captchaCode: '',
  // 新密碼
  newPassword: '',
  confirmPassword: '',
})

const valideCodeV2Token = ref('')

// 驗證方式: 'phone' | 'email' | 'google'
const verifyType = ref<'phone' | 'email' | 'google'>('phone')

watch(() => verifyType.value, () => {
  formData.value.captchaCode = ''
})

// 各種 loading 狀態
const loading = ref(false)
const phoneLoading = ref(false)
const emailLoading = ref(false)

// 倒計時
const phoneCountdown = ref(0)
const emailCountdown = ref(0)

// 密碼顯示狀態
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 圖片驗證碼相關
const showImageCaptcha = ref(false)
const captchaType = ref<'phone' | 'email'>('phone')

// 步驟文字
const steps = [
  { key: 1, label: '1.填写用户名' },
  { key: 2, label: '2.身份验证' },
  { key: 3, label: '3.设置密码' },
]

// 完整手機號碼
const fullPhoneNumber = computed(() => {
  return `${formData.value.countryCode.replace('+', '')}_${formData.value.phone}`
})

// 驗證用戶名
const validateUsername = () => {
  if (!formData.value.username) {
    showToast('请输入账号')
    return false
  }
  return true
}

// 下一步
const handleNextStep = async () => {
  if (currentStep.value === 1) {
    if (!validateUsername()) return
    // TODO: 可以在這裡調用 API 驗證用戶名是否存在
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!validateVerification()) return
    if (!(await valideCodeV2())) return
    // TODO: 調用驗證 API
    currentStep.value = 3
  }
}

// 驗證身份驗證步驟
const validateVerification = () => {
  if (verifyType.value === 'phone') {
    if (!formData.value.phone) {
      showToast('请输入手机号')
      return false
    }
    if (!formData.value.captchaCode) {
      showToast('请输入手机验证码')
      return false
    }
  } else if (verifyType.value === 'email') {
    if (!formData.value.email) {
      showToast('请输入邮箱地址')
      return false
    }
    if (!formData.value.captchaCode) {
      showToast('请输入邮箱验证码')
      return false
    }
  } else if (verifyType.value === 'google') {
    if (!formData.value.captchaCode) {
      showToast('请输入谷歌验证码')
      return false
    }
  }
  return true
}

// 完成重置密碼
const handleComplete = async () => {
  if (!formData.value.newPassword) {
    showToast('请输入新密码')
    return
  }
  if (formData.value.newPassword.length < 8 || formData.value.newPassword.length > 20) {
    showToast('密码长度需为8-20位')
    return
  }
  if (!formData.value.confirmPassword) {
    showToast('请确认新密码')
    return
  }
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    const res = await API.system.retrievePasswordV2({
      Username: formData.value.username,
      ValidType: verifyType.value === 'phone' ? 0 : verifyType.value === 'email' ? 1 : 2,
      IAC: formData.value.countryCode.replace('+', ''),
      Number: formData.value.phone,
      Email: formData.value.email,
      Code: valideCodeV2Token.value,
      Password: formData.value.newPassword,
      ConfirmPassword: formData.value.confirmPassword,
    })

    if (res.data.Code !== 200) return showToast(res.data.Msg || '密码重置失败')

    showToast('密码重置成功')
    emit('success')
    emit('close')
  } catch (error: any) {
    console.error('重置密码失败：', error)
    showToast(error?.response?.data?.Msg || '重置密码失败')
  } finally {
    loading.value = false
  }
}

const validUserV2 = async () => {
  const res = await API.system.validUserV2({
    Username: formData.value.username,
    ValidType: verifyType.value === 'phone' ? 0 : verifyType.value === 'email' ? 1 : 2,
    ...(verifyType.value === 'phone' ? { IAC: formData.value.countryCode.replace('+', ''), Number: formData.value.phone } : {}),
    ...(verifyType.value === 'email' ? { Email: formData.value.email } : {}),
    AgentId: globalStore.systemConfig.AgentId,
    Domain: String(import.meta.env.DEV ? import.meta.env.VITE_PROXY_TARGET : window.location.host).replace('http://', '').replace('https://', ''),
  })
  if (res.data.Code === 200) return true
  showToast(res.data.Msg || '资料不匹配')
  return false
}

const valideCodeV2 = async () => {
  valideCodeV2Token.value = ''
  const res = await API.system.valideCodeV2({
    Username: formData.value.username,
    ValidType: verifyType.value === 'phone' ? 0 : verifyType.value === 'email' ? 1 : 2,
    ...(verifyType.value === 'phone' ? { IAC: formData.value.countryCode.replace('+', ''), Number: formData.value.phone } : {}),
    ...(verifyType.value === 'email' ? { Email: formData.value.email } : {}),
    AgentId: globalStore.systemConfig.AgentId,
    Domain: String(import.meta.env.DEV ? import.meta.env.VITE_PROXY_TARGET : window.location.host).replace('http://', '').replace('https://', ''),
    Code: formData.value.captchaCode,
  })
  if (res.data.Code !== 200) {
    showToast(res.data.Msg || '验证码不正确')
    return false
  }

  valideCodeV2Token.value = res.data.Data.Token
  return true
}

// 獲取手機驗證碼
const handleGetPhoneCode = async () => {
  if (!formData.value.phone) return showToast('请输入手机号')
  captchaType.value = 'phone'

  if (!(await validUserV2())) return

  showImageCaptcha.value = true
}

// 獲取郵箱驗證碼
const handleGetEmailCode = async () => {
  if (!formData.value.email) return showToast('请输入邮箱地址')
  captchaType.value = 'email'

  if (!(await validUserV2())) return

  showImageCaptcha.value = true
}

// 圖片驗證碼成功後的回調
const handleCaptchaSuccess = () => {
  showImageCaptcha.value = false
  if (captchaType.value === 'phone') {
    startPhoneCountdown()
  } else {
    startEmailCountdown()
  }
}

// 開始手機倒計時
const startPhoneCountdown = () => {
  phoneCountdown.value = 60
  const timer = setInterval(() => {
    phoneCountdown.value--
    if (phoneCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 開始郵箱倒計時
const startEmailCountdown = () => {
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 返回
const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    emit('close')
  }
}
</script>

<template>
  <div class="forgot-password-container">
    <!-- 頭部 -->
    <div class="forgot-header">
      <van-icon name="arrow-left" class="back-icon" @click="handleBack" />
      <span class="forgot-title">忘记密码</span>
    </div>

    <!-- 步驟指示器 -->
    <div class="step-indicator">
      <template v-for="(step, index) in steps" :key="step.key">
        <div
          class="step-item"
          :class="{ 'step-active': currentStep >= step.key, 'step-current': currentStep === step.key }"
        >
          {{ step.label }}
        </div>
        <span v-if="index < steps.length - 1" class="step-arrow">》</span>
      </template>
    </div>

    <!-- 步驟 1: 填寫用戶名 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="form-group">
        <label class="form-label">账号</label>
        <div class="input-wrapper">
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入"
            class="form-input"
          />
        </div>
      </div>
    </div>

    <!-- 步驟 2: 身份驗證 -->
    <div v-if="currentStep === 2" class="step-content">
      <!-- 驗證方式選擇 -->
      <div class="form-group">
        <label class="form-label">选择验证方式</label>
        <div class="verify-type-selector">
          <van-button
            :type="verifyType === 'phone' ? 'primary' : 'default'"
            round
            size="small"
            @click="verifyType = 'phone'"
          >
            手机验证
          </van-button>
          <van-button
            :type="verifyType === 'email' ? 'primary' : 'default'"
            round
            size="small"
            @click="verifyType = 'email'"
          >
            邮箱验证
          </van-button>
          <van-button
            :type="verifyType === 'google' ? 'primary' : 'default'"
            round
            size="small"
            @click="verifyType = 'google'"
          >
            谷歌验证
          </van-button>
        </div>
      </div>

      <!-- 手機驗證 -->
      <template v-if="verifyType === 'phone'">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="input-wrapper phone-wrapper">
            <div class="country-code">
              <DropdownFilled v-model="formData.countryCode" placeholder="请选择" height="2rem" :options="countryCodeOptions" />
            </div>
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="请输入"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">手机号验证码</label>
          <div class="input-wrapper code-wrapper">
            <input
              v-model="formData.captchaCode"
              type="text"
              placeholder="请输入"
              class="form-input"
              autocomplete="off"
            />
            <van-button
              type="primary"
              round
              class="code-btn min-w-28"
              :loading="phoneLoading"
              :disabled="phoneCountdown > 0"
              @click="handleGetPhoneCode"
            >
              {{ phoneCountdown > 0 ? `${phoneCountdown}s` : '获取验证码' }}
            </van-button>
          </div>
        </div>
      </template>

      <!-- 郵箱驗證 -->
      <template v-if="verifyType === 'email'">
        <div class="form-group">
          <label class="form-label">邮箱地址</label>
          <div class="input-wrapper">
            <input
              v-model="formData.email"
              type="email"
              placeholder="请输入"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">邮箱验证码</label>
          <div class="input-wrapper code-wrapper">
            <input
              v-model="formData.captchaCode"
              type="text"
              placeholder="请输入"
              class="form-input"
              autocomplete="off"
            />
            <van-button
              type="primary"
              round
              class="code-btn min-w-28"
              :loading="emailLoading"
              :disabled="emailCountdown > 0"
              @click="handleGetEmailCode"
            >
              {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
            </van-button>
          </div>
        </div>
      </template>

      <!-- 谷歌驗證 -->
      <template v-if="verifyType === 'google'">
        <div class="form-group">
          <label class="form-label">谷歌验证码</label>
          <div class="input-wrapper">
            <input
              v-model="formData.captchaCode"
              type="text"
              placeholder="请输入"
              class="form-input"
              autocomplete="off"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- 步驟 3: 設置密碼 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="form-group">
        <label class="form-label">新密码</label>
        <div class="input-wrapper">
          <input
            v-model="formData.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            placeholder="请输入"
            class="form-input"
          />
          <van-icon
            :name="showNewPassword ? 'eye-o' : 'closed-eye'"
            class="input-icon"
            @click="showNewPassword = !showNewPassword"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">确认新密码</label>
        <div class="input-wrapper">
          <input
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请输入"
            class="form-input"
          />
          <van-icon
            :name="showConfirmPassword ? 'eye-o' : 'closed-eye'"
            class="input-icon"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </div>
      </div>
    </div>

    <!-- 按鈕 -->
    <div class="button-section">
      <van-button
        block
        round
        type="primary"
        :loading="loading"
        class="submit-btn"
        @click="currentStep === 3 ? handleComplete() : handleNextStep()"
      >
        {{ currentStep === 3 ? '完成' : '下一步' }}
      </van-button>
    </div>

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
.forgot-password-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: white;
  height: 100%;
}

/* 頭部 */
.forgot-header {
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

.forgot-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 auto;
  color: var(--color-neutral2-basic);
}

/* 步驟指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.step-item {
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  color: var(--color-neutral2-fourth);
  border: 1px solid var(--color-neutral2-sixth);
  background-color: transparent;
  transition: all 0.2s;
}

.step-item.step-active {
  color: var(--color-primary-normal);
  border-color: var(--color-primary-normal);
}

.step-item.step-current {
  background-color: var(--color-primary-normal);
  color: white;
  border-color: var(--color-primary-normal);
}

.step-arrow {
  color: var(--color-neutral2-fifth);
  font-size: 0.75rem;
}

/* 步驟內容 */
.step-content {
  flex: 1;
}

/* 表單 */
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

/* 驗證方式選擇器 */
.verify-type-selector {
  display: flex;
  gap: 0.5rem;
}

.verify-type-selector .van-button {
  min-width: 5rem;
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
</style>
