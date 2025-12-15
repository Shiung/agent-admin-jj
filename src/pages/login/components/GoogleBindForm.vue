<script setup lang="ts">
import { ref, onMounted } from 'vue'
import API from '@/apis'

interface Props {
  username: string
  password: string
  googleLoginAuthToken: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  bound: [username: string, password: string]
}>()

const loading = ref(false)
const googleCode = ref('')
const googleSecret = ref('')
const secretLoading = ref(false)

// 獲取 Google Secret
const fetchGoogleSecret = async () => {
  secretLoading.value = true
  try {
    const res = await API.system.googleLoginAuth({
      Username: props.username,
      GoogleLoginAuthToken: props.googleLoginAuthToken,
    })
    if (res.data.Code === 200 && res.data.Data) {
      // res.data.Data 應該包含 Secret
      const data = res.data.Data as any
      googleSecret.value = data.Secret || data
    } else {
      showToast(res.data.Msg || '获取密钥失败')
    }
  } catch (error: any) {
    console.error('获取 Google Secret 失败：', error)
    showToast(error?.response?.data?.Msg || '获取密钥失败')
  } finally {
    secretLoading.value = false
  }
}

onMounted(() => {
  fetchGoogleSecret()
})

// 複製密鑰
const handleCopySecret = async () => {
  if (!googleSecret.value) return
  try {
    await navigator.clipboard.writeText(googleSecret.value)
    showToast('复制成功')
  } catch (error) {
    console.error('复制失败：', error)
    // 備用方案
    const textArea = document.createElement('textarea')
    textArea.value = googleSecret.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showToast('复制成功')
  }
}

const handleSubmit = async () => {
  if (!googleCode.value) {
    showToast('请输入Google验证码')
    return
  }

  loading.value = true

  try {
    const res = await API.system.googleLoginAuthBind({
      Username: props.username,
      GoogleLoginAuthToken: props.googleLoginAuthToken,
      ValidCode: googleCode.value,
    })

    if (res.data.Code !== 200) {
      showToast(res.data.Msg || '绑定失败')
      return
    }

    showToast('绑定成功！')
    // 綁定成功後，通知父組件跳轉到 Google 驗證
    emit('bound', props.username, props.password)
  } catch (error: any) {
    console.error('绑定失败：', error)
    showToast(error?.response?.data?.Msg || '绑定失败')
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
  <div class="google-bind-container">
    <div class="google-header">
      <van-icon name="arrow-left" class="back-icon" @click="handleBack" />
      <span class="google-title">谷歌验证</span>
    </div>

    <!-- 提示文字 -->
    <div class="tips-section">
      <van-image src="./static/images/common/lightBulb.png" class="mx-2" width="24" />
      <span class="tips-text">
        可以在苹果商店搜索"Google Authenticator"，或安卓商店搜索"Google身份验证器"下载安装
      </span>
    </div>

    <van-form @submit="handleSubmit" class="google-form">
      <!-- Google 密鑰 -->
      <div class="form-group">
        <label class="form-label">谷歌验证器密钥</label>
        <div class="input-wrapper secret-wrapper">
          <div class="secret-text">
            {{ googleSecret }}
          </div>
          <van-icon 
            name="orders-o" 
            class="copy-icon" 
            @click="handleCopySecret"
          />
        </div>
      </div>

      <!-- Google 验证码 -->
      <div class="form-group">
        <label class="form-label">谷歌验证码</label>
        <div class="input-wrapper">
          <input 
            v-model="googleCode" 
            type="text" 
            placeholder="请输入"
            class="form-input"
            autocomplete="off"
          />
        </div>
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
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.google-bind-container {
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

/* 提示區域 */
.tips-section {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: rgba(25, 137, 250, 0.08);
  border-radius: 0.5rem;
}

.tips-icon {
  color: var(--color-primary-normal);
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.tips-text {
  font-size: 0.75rem;
  color: var(--color-primary-normal);
  line-height: 1.5;
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

/* 密鑰區域 */
.secret-wrapper {
  gap: 0.5rem;
}

.secret-text {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-neutral2-basic);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secret-placeholder {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-neutral2-fourth);
}

.copy-icon {
  font-size: 1.25rem;
  color: var(--color-neutral2-fourth);
  cursor: pointer;
  flex-shrink: 0;
}

.copy-icon:active {
  opacity: 0.7;
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
