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
    if (res.data.Code !== 200) return showToast(res.data.Msg || '登入失败，请检查帐号密码')

    // Google驗證
    if ((res.data.Data as any).LoginType === 3) return showGoogleLogin.value = true

    userStore.userInfo = res.data.Data

    // 登入成功後導向首頁
    router.push('/')
    showToast('登入成功！')
  } catch (error) {
    console.error('登入失败：', error)
    showToast('登入失败，请检查帐号密码')
    fetchCaptcha() // 失敗後刷新驗證碼
  } finally {
    loading.value = false
  }
}

const handleVLogin = async () => {
  if (!googleFormData.value.ValidCode) return showToast('请输入Google验证码')

  loading.value = true

  try {
    const res = await API.system.vLogin(googleFormData.value)

    if (res.data.Code !== 200) return showToast(res.data.Msg || '登入失败，请检查帐号密码')

    userStore.userInfo = res.data.Data

    // 登入成功後導向首頁
    router.push('/')
    showToast('登入成功！')
  } catch (error) {
    console.error('登入失敗：', error)
    showToast('登入失败，请检查帐号密码')
  } finally {
    loading.value = false
  }
}

const togglePassword = () => showPassword.value = !showPassword.value
</script>

<template>
  <div
    class="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8">
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
      <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <van-form @submit="handleLoginBtnClick" class="space-y-4">
          <!-- 帳號 -->
          <van-field v-model="formData.Username" name="Username" label="帳號" label-align="top" placeholder="請輸入帳號"
            clearable :rules="[{ required: true, message: '請輸入帳號' }]">
          </van-field>

          <!-- 密碼 -->
          <van-field v-model="formData.Password" name="Password" label="密碼" label-align="top"
            :type="showPassword ? 'text' : 'password'" placeholder="請輸入密碼"
            :rules="[{ required: true, message: '請輸入密碼' }]">
            <template #right-icon>
              <button type="button" class="van-field__right-icon" @click.stop="togglePassword">
                <svg v-if="!showPassword" class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </template>
          </van-field>

          <!-- 驗證碼 -->
          <van-field v-model="formData.ValidCode" name="ValidCode" label="驗證碼" label-align="top" placeholder="請輸入驗證碼"
            autocomplete="off" :rules="[{ required: true, message: '請輸入驗證碼' }]">
            <template #button>
              <div class="flex items-center gap-2">
                <div
                  class="flex items-center justify-center w-24 sm:w-28 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300 select-none">
                  <img v-if="captchaCode" :src="'data:image/png;base64,' + captchaCode" alt="驗證碼" />
                </div>
                <van-icon name="replay" @click.stop="fetchCaptcha" />
              </div>
            </template>
          </van-field>

          <!-- Google 驗證碼（第二階段） -->
          <van-field v-if="showGoogleLogin" v-model="googleFormData.ValidCode" name="GoogleValidCode" label="Google 驗證碼"
            label-align="top" placeholder="請輸入 Google 驗證碼" autocomplete="off"
            :rules="[{ required: true, message: '請輸入 Google 驗證碼' }]">
          </van-field>

          <!-- 記住我＆忘記密碼 -->
          <div class="flex items-center justify-between text-sm mt-2">
            <van-checkbox v-model="formData.remember" shape="round" icon-size="16px">
              記住我
            </van-checkbox>
            <!-- <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              忘記密碼？
            </a> -->
          </div>

          <!-- 登入按鈕 -->
          <div class="mt-4">
            <van-button block round type="primary" native-type="submit" :loading="loading" loading-text="登入中...">
              登入
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.captcha-box {
  width: 90px;
}
</style>
