<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import getDeviceId from '@/utils/getDeviceId'
import { useUserStore } from '@/stores/user'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'

const router = useRouter()
const userStore = useUserStore()

const IS_SERVE = import.meta.env.DEV

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

const googleCode = ref('')

const fetchCaptcha = async () => {
  try {
    const res = await API.system.imageValidCode()
    if (res.data.Code !== 200) {
      console.error('### fetchCaptcha Code != 200', res.data)
      return
    }

    captchaCode.value = res.data.Data.Item
    formData.value.ValidCode = '' // 清空輸入
    formData.value.KeyCode = res.data.Data.KeyCode
  } catch (err) {
    console.error('取得驗證碼失敗', err)
  }
}

onMounted(() => {
  fetchCaptcha()
})

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
    if (res.data.Code !== 200) {
      showToast(res.data.Msg || '登录失败，请检查帐号密码')
      // 失敗就更新驗證碼
      fetchCaptcha()
      return
    }

    const data = res.data.Data as any

    // Google驗證
    if (data.LoginType === 3) {
      showGoogleLogin.value = true
      return
    }

    userStore.setToken(data.Token)
    userStore.fetchIsLogin()

    // 登录成功後導向首頁
    router.replace({ name: 'index' })
    showToast('登录成功！')
  } catch (error) {
    console.error('登录失败：', error)
    showToast('登录失败，请检查帐号密码')
    fetchCaptcha()
  } finally {
    loading.value = false
  }
}

const handleVLogin = async () => {
  if (!googleCode.value) {
    showToast('请输入Google验证码')
    return
  }

  loading.value = true

  try {
    const payload = {
      Username: formData.value.Username,
      Password: formData.value.Password,
      ValidCode: googleCode.value,
    }
    const res = await API.system.vLogin(payload)


    if (res.data.Code !== 200) {
      showToast(res.data.Msg || '登录失败，请检查帐号密码')
      return
    }

    userStore.setToken(res.data.Data?.Token as any)
    userStore.fetchIsLogin()

    // 登录成功後導向首頁
    router.replace({ name: 'index' })
    showToast('登录成功！')
  } catch (error) {
    console.error('登录失敗：', error)
    showToast('登录失败，请检查帐号密码')
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
      <h2 class="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2">登录</h2>

      <van-form @submit="handleLoginBtnClick" class="bg-white rounded-2xl shadow-xl p-4">
        <!-- 账号 -->
        <AppField v-model="formData.Username" name="Username" label="账号" placeholder="请输入账号" clearable
          :rules="[{ required: true, message: '请输入账号' }]">
        </AppField>

        <!-- 密码 -->
        <AppField v-model="formData.Password" name="Password" label="密码" :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码" :rules="[{ required: true, message: '请输入密码' }]">
          <template #right-icon>
            <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click.stop="togglePassword" />
          </template>
        </AppField>

        <!-- 验证码 -->
        <AppField v-model="formData.ValidCode" name="ValidCode" label="验证码" placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]" autocomplete="off">
          <template #button>
            <div
              class="flex items-center justify-center w-26 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300"
              @click.stop="fetchCaptcha">
              <img v-if="captchaCode" :src="`data:image/png;base64,${captchaCode}`" alt="验证码" />
            </div>
          </template>
        </AppField>

        <!-- Google 驗證碼（第二階段） -->
        <AppField v-if="showGoogleLogin" v-model="googleCode" name="GoogleValidCode" label="Google 验证码"
          label-align="top" placeholder="请输入 Google 验证码" autocomplete="off"
          :rules="[{ required: true, message: '请输入 Google 验证码' }]">
        </AppField>

        <!-- 記住我＆忘記密碼 -->
        <div class="flex items-center justify-between text-sm mt-2">
          <van-checkbox v-model="formData.remember" shape="round" icon-size="16px">
            記住我
          </van-checkbox>
          <!-- <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              忘記密碼？
            </a> -->
        </div>

        <!-- 登录按鈕 -->
        <div class="mt-4">
          <van-button block round type="primary" native-type="submit" :loading="loading" loading-text="登录中...">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
<style scoped></style>
