<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import getDeviceId from '@/utils/getDeviceId'
import { useUserStore } from '@/stores/user'

import API from '@/apis'

const router = useRouter()
const userStore = useUserStore()

const IS_SERVE = import.meta.env.DEV

// TODO - 上dev前要把測試資料砍了
const formData = ref({
  Username: IS_SERVE ? 'rtest1105' : '',
  Password: IS_SERVE ? 'test1234' : '',
  ValidCode: '',
  KeyCode: '',
  FromType: 7,
  Domain: IS_SERVE ? import.meta.env.VITE_PROXY_TARGET : window.location.host,
  IsApp: 0,
  UseNewPermission: true,
  Platform: 'H5',
  DeviceId: getDeviceId() ?? '',
  remember: false,
})

const loading = ref(false)
const showPassword = ref(false)
const captchaCode = ref('')
const showGoogleLogin = ref(false)
const googleFormData = ref({
  Username: computed(() => formData.value.Username),
  Password: computed(() => formData.value.Password),
  ValidCode: '',
})

const fetchCaptcha = async () => {
  const res = await API.system.imageValidCode()

  if (res.data.Code !== 200) return console.error('### fetchCaptcha')

  captchaCode.value = res.data.Data.Item
  formData.value.ValidCode = '' // 清空輸入
  formData.value.KeyCode = res.data.Data.KeyCode
}

// 初始化驗證碼
fetchCaptcha()

const handleLoginBtnClick = () => {
  if (showGoogleLogin.value) handleVLogin()
  else handleLogin()
}

const handleLogin = async () => {
  if (!formData.value.Username || !formData.value.Password) {
    alert('請輸入帳號和密碼')
    return
  }

  if (!formData.value.ValidCode) {
    alert('請輸入驗證碼')
    return
  }

  loading.value = true

  try {
    // TODO: 實際登入 API 呼叫
    console.log('登入資料：', formData.value)
    const res = await API.system.login(formData.value)
    if (res.data.Code !== 200) return alert('登入失敗，請檢查帳號密碼')

    // Google驗證
    if ((res.data.Data as any).LoginType === 3) return showGoogleLogin.value = true

    userStore.userInfo = res.data.Data

    // 登入成功後導向首頁
    router.push('/')
    alert('登入成功！')
  } catch (error) {
    console.error('登入失敗：', error)
    alert('登入失敗，請檢查帳號密碼')
    fetchCaptcha() // 失敗後刷新驗證碼
  } finally {
    loading.value = false
  }
}

const handleVLogin = async () => {
  if (!googleFormData.value.ValidCode) return alert('請輸入Google驗證碼')

  loading.value = true

  try {
    const res = await API.system.vLogin(googleFormData.value)
    if (res.data.Code !== 200) return alert('登入失敗，請檢查帳號密碼')

    userStore.userInfo = res.data.Data

    // 登入成功後導向首頁
    router.push('/')
    alert('登入成功！')
  } catch (error) {
    console.error('登入失敗：', error)
    alert('登入失敗，請檢查帳號密碼')
  } finally {
    loading.value = false
  }
}

const togglePassword = () => showPassword.value = !showPassword.value
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8">
    <!-- 登入卡片 -->
    <div class="w-full max-w-md">
      <!-- Logo 區域 -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">後台管理系統</h2>
        <p class="text-sm sm:text-base text-gray-600">請登入您的帳號以繼續</p>
      </div>

      <!-- 表單卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <form @submit.prevent="handleLoginBtnClick" class="space-y-5">
          <!-- 帳號輸入 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              帳號
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input id="username" v-model="formData.Username" type="text" autocomplete="username" required
                placeholder="請輸入帳號"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base" />
            </div>
          </div>

          <!-- 密碼輸入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="password" v-model="formData.Password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" required placeholder="請輸入密碼"
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base" />
              <button type="button" @click="togglePassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 驗證碼輸入 -->
          <div>
            <label for="captcha" class="block text-sm font-medium text-gray-700 mb-2">
              驗證碼
            </label>
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input id="captcha" v-model="formData.ValidCode" type="text" required placeholder="請輸入驗證碼"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base uppercase" />
              </div>
              <!-- 驗證碼顯示區 -->
              <div class="flex items-center gap-2">
                <div
                  class="captcha-box flex items-center justify-center w-24 sm:w-28 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 select-none cursor-not-allowed">
                  <img v-if="captchaCode" :src="'data:image/png;base64,' + captchaCode" alt="验证码">
                </div>
                <!-- 刷新按鈕 -->
                <button type="button" @click="fetchCaptcha"
                  class="p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="刷新驗證碼">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="showGoogleLogin">
            <div class="flex-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input id="captcha" v-model="googleFormData.ValidCode" type="text" required placeholder="請輸入Google驗證碼"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base uppercase" />
            </div>
          </div>

          <!-- 記住我 & 忘記密碼 -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center cursor-pointer">
              <input v-model="formData.remember" type="checkbox"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <span class="ml-2 text-gray-700">記住我</span>
            </label>
            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              忘記密碼？
            </a>
          </div>

          <!-- 登入按鈕 -->
          <button type="submit" :disabled="loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>

        <!-- 註冊連結 -->
        <div class="mt-6 text-center text-sm text-gray-600">
          還沒有帳號？
          <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            立即註冊
          </a>
        </div>
      </div>

      <!-- 版權資訊 -->
      <div class="mt-8 text-center text-xs sm:text-sm text-gray-500">
        © 2025 後台管理系統. All rights reserved.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自訂動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 驗證碼樣式 */
.captcha-box {
  position: relative;
  overflow: hidden;
}

.captcha-text {
  position: relative;
  z-index: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.2em;
}

.captcha-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(45deg, transparent 45%, rgba(99, 102, 241, 0.1) 50%, transparent 55%),
    linear-gradient(-45deg, transparent 45%, rgba(147, 51, 234, 0.1) 50%, transparent 55%);
  background-size: 10px 10px;
}

/* 確保在小螢幕上也能正常顯示 */
@media (max-width: 640px) {
  .min-h-screen {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .captcha-box {
    width: 90px;
  }
}
</style>
