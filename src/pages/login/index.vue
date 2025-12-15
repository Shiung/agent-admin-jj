<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import GoogleVerifyForm from './components/GoogleVerifyForm.vue'
import GoogleBindForm from './components/GoogleBindForm.vue'

declare const __APP_VERSION__: string
const APP_VERSION = `v${__APP_VERSION__}`

// 當前 Tab: 'login' 或 'register'
const activeTab = ref<'login' | 'register'>('login')

// Google 驗證狀態
const showGoogleVerify = ref(false)
const googleVerifyData = ref({
  username: '',
  password: ''
})

// Google 綁定狀態
const showGoogleBind = ref(false)
const googleBindData = ref({
  username: '',
  password: '',
  googleLoginAuthToken: ''
})

const handleShowGoogleVerify = (username: string, password: string) => {
  googleVerifyData.value = { username, password }
  showGoogleVerify.value = true
}

const handleCloseGoogleVerify = () => {
  showGoogleVerify.value = false
}

const handleShowGoogleBind = (username: string, password: string, googleLoginAuthToken: string) => {
  googleBindData.value = { username, password, googleLoginAuthToken }
  showGoogleBind.value = true
}

const handleCloseGoogleBind = () => {
  showGoogleBind.value = false
}

// 綁定成功後，關閉綁定彈窗，跳轉到驗證彈窗
const handleGoogleBindSuccess = (username: string, password: string) => {
  showGoogleBind.value = false
  handleShowGoogleVerify(username, password)
}

const handleRegisterSuccess = () => {
  activeTab.value = 'login'
}
</script>

<template>
  <div class="login-page">
    <!-- 頂部背景區域 -->
    <div class="header-section">
      <img src="/static/images/login/title.png" alt="title" class="title-image" />
    </div>

    <!-- 內容區域 -->
    <div class="content-section">
      <!-- Tab 切換 -->
      <van-tabs v-model:active="activeTab" class="login-tabs">
        <van-tab title="登录" name="login">
          <LoginForm 
            @show-google-verify="handleShowGoogleVerify" 
            @show-google-bind="handleShowGoogleBind"
          />
        </van-tab>
        
        <van-tab title="注册" name="register">
          <RegisterForm @register-success="handleRegisterSuccess" />
        </van-tab>
      </van-tabs>

      <!-- 版本號 -->
      <div class="version">{{ APP_VERSION }}</div>

      <!-- Google 驗證 Popup (在 content-section 內從右側滑入) -->
      <van-popup
        v-model:show="showGoogleVerify"
        position="right"
        :overlay="false"
        class="google-popup"
      >
        <GoogleVerifyForm 
          v-if="showGoogleVerify"
          :username="googleVerifyData.username"
          :password="googleVerifyData.password"
          @close="handleCloseGoogleVerify"
        />
        <!-- 版本號 -->
        <div class="version">{{ APP_VERSION }}</div>
      </van-popup>

      <!-- Google 綁定 Popup (在 content-section 內從右側滑入) -->
      <van-popup
        v-model:show="showGoogleBind"
        position="right"
        :overlay="false"
        class="google-popup"
      >
        <GoogleBindForm 
          v-if="showGoogleBind"
          :username="googleBindData.username"
          :password="googleBindData.password"
          :google-login-auth-token="googleBindData.googleLoginAuthToken"
          @close="handleCloseGoogleBind"
          @bound="handleGoogleBindSuccess"
        />
        <!-- 版本號 -->
        <div class="version">{{ APP_VERSION }}</div>
      </van-popup>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: url('/static/images/login/bg.png') no-repeat center center;
  background-size: cover;
}

/* 頂部區域 */
.header-section {
  position: relative;
  height: 10rem;
  overflow: hidden;
}

.title-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

/* 內容區域 */
.content-section {
  flex: 1;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 1.25rem 1.25rem 0 0;
  box-shadow: -1px 1px 6px 0px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

/* van-tabs 樣式覆蓋 */
.login-tabs {
  --van-tabs-bottom-bar-height: 2px;
  --van-tab-active-text-color: var(--color-primary-normal);
  --van-tab-text-color: var(--color-neutral2-secondary);
  --van-tabs-bottom-bar-color: var(--color-primary-normal);
  --van-tabs-nav-background: transparent;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-tabs :deep(.van-tabs__nav) {
  padding: 0;
  justify-content: space-around;
  gap: 2rem;
}

.login-tabs :deep(.van-tab) {
  flex: none;
  padding: 0;
  font-size: 1rem;
  font-weight: 500;
}

/* 兩個 tab 之間的垂直分隔線 - 置於正中間 */
.login-tabs :deep(.van-tabs__nav::after) {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 1rem;
  background-color: var(--color-neutral2-sixth);
}

.login-tabs :deep(.van-tabs__line) {
  bottom: 0;
}

.login-tabs :deep(.van-tabs__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-tabs :deep(.van-tab__panel) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 版本號 */
.version {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-neutral2-secondary);
  padding: 1rem 0;
}

/* Google 驗證 Popup - 只在 content-section 內滑動 */
.google-popup {
  position: absolute !important;
  left: 0;
  bottom: 0;
  width: 100% !important;
  height: 100% !important;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  border-radius: 1.25rem 1.25rem 0 0;
}
</style>
