<script setup lang="ts">
import { ref, watch } from 'vue'
import API from '@/apis'
import { useGlobalStore } from '@/stores/global'
import getDeviceId from '@/utils/getDeviceId'
import { opTypeConf } from '@/consts/constant'

export interface ImageCaptchaDialogProps {
  /** 验证码发送类型 */
  type: 'phone' | 'email'
  /** 手机号码（type 为 'phone' 时必填） */
  phone?: string
  /** 邮箱地址（type 为 'email' 时必填） */
  email?: string
  /** 用户名 */
  username?: string
  /** 操作类型 */
  opType?: number
}

const props = withDefaults(defineProps<ImageCaptchaDialogProps>(), {
  opType: opTypeConf.REGISTER,
})

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'close'): void
}>()

const show = defineModel<boolean>('show', { default: false })

const globalStore = useGlobalStore()

// 图片验证码相关
const captchaImage = ref('')
const captchaKeyCode = ref('')
const captchaInput = ref('')
const loading = ref(false)
const refreshing = ref(false)

// 获取图片验证码
const fetchCaptchaImage = async () => {
  refreshing.value = true
  try {
    const res = await API.system.imageValidCode()
    if (res.data.Code === 200 && res.data.Data) {
      captchaImage.value = res.data.Data.Item
      captchaKeyCode.value = res.data.Data.KeyCode
    } else {
      showToast(res.data.Msg || '获取验证码失败')
    }
  } catch (error: any) {
    console.error('获取图片验证码失败：', error)
    showToast(error?.response?.data?.Msg || '获取验证码失败')
  } finally {
    refreshing.value = false
  }
}

// 提交验证并发送验证码
const handleSubmit = async () => {
  if (!captchaInput.value) {
    showToast('请输入图片验证码')
    return
  }

  loading.value = true
  try {
    const deviceId = getDeviceId() ?? ''
    const agentId = globalStore.systemConfig.AgentId

    if (props.type === 'phone' && !props.phone) return showToast('请输入手机号码')
    if (props.type === 'email' && !props.email) return showToast('请输入邮箱地址')
    if (!props.username) return showToast('请输入帐号')

    const query = {
      DeviceId: deviceId,
      OpType: props.opType,
      KeyCode: captchaKeyCode.value,
      ValidCode: captchaInput.value,
      AgentId: agentId,
      Username: props.username,
      ...(props.type === 'phone' ? { Number: props.phone } : {}),
      ...(props.type === 'email' ? { Email: props.email } : {}),
    }

    const apiFunctionKey = props.type === 'phone' ? 'phoneSendCode' : 'emailSendCode'

    const res = await API.system[apiFunctionKey](query as any)

    if (res.data.Code === 200) {
      showToast('验证码已发送，请注意查收!')
      emit('success')
      handleClose()
    } else {
      showToast(res.data.Msg || '发送失败')
      // 验证失败时刷新验证码
      await fetchCaptchaImage()
      captchaInput.value = ''
    }

  } catch (error: any) {
    console.error('发送验证码失败：', error)
    showToast(error?.response?.data?.Msg || '发送验证码失败')
    // 错误时刷新验证码
    await fetchCaptchaImage()
    captchaInput.value = ''
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  show.value = false
  captchaInput.value = ''
  emit('close')
}

// 监听 show 变化，显示时获取验证码
watch(show, (newVal) => {
  if (newVal) {
    fetchCaptchaImage()
  }
})
</script>

<template>
  <van-dialog
    v-model:show="show"
    title="请输入图中验证码"
    :show-confirm-button="false"
    :close-on-click-overlay="true"
    teleport="#app"
    @close="handleClose"
  >
    <div class="captcha-dialog-content">
      <!-- 图片验证码区域 -->
      <div class="captcha-image-wrapper">
        <div class="captcha-image-container" @click="fetchCaptchaImage">
          <img
            v-if="captchaImage"
            :src="`data:image/png;base64,${captchaImage}`"
            alt="验证码"
            class="captcha-image"
          />
          <div v-else class="captcha-placeholder">
            <van-loading v-if="refreshing" size="24" />
            <span v-else>点击获取</span>
          </div>
        </div>
      </div>

      <!-- 验证码输入框 -->
      <div class="captcha-input-wrapper">
        <input
          v-model="captchaInput"
          type="text"
          placeholder="请输入"
          class="captcha-input"
          maxlength="6"
          autocomplete="off"
          @keyup.enter="handleSubmit"
        />
      </div>

      <!-- 按钮区域 -->
      <div class="captcha-buttons">
        <van-button
          plain
          round
          class="cancel-btn"
          @click="handleClose"
        >
          取消
        </van-button>
        <van-button
          type="primary"
          round
          class="confirm-btn"
          :loading="loading"
          :disabled="!captchaInput || captchaInput.length !== 4"
          @click="handleSubmit"
        >
          获取验证码
        </van-button>
      </div>
    </div>
  </van-dialog>
</template>

<style scoped>
.captcha-dialog-content {
  padding: 1.5rem 1rem;
}

.captcha-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.captcha-image-container {
  width: 160px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: var(--color-neutral2-eighth, #f5f5f5);
  border: 1px solid var(--color-neutral2-seventh, #e0e0e0);
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.captcha-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral2-fourth, #999);
  font-size: 0.875rem;
}

.captcha-refresh-tip {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-neutral2-fourth, #999);
}

.captcha-input-wrapper {
  margin-bottom: 1.5rem;
}

.captcha-input {
  width: 100%;
  height: 2.75rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--color-neutral2-seventh, #e0e0e0);
  border-radius: 1.375rem;
  background-color: var(--color-neutral2-eighth, #f5f5f5);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.captcha-input:focus {
  border-color: var(--color-primary-normal, #1989fa);
}

.captcha-input::placeholder {
  color: var(--color-neutral2-fourth, #999);
}

.captcha-buttons {
  display: flex;
  gap: 0.75rem;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 2.5rem;
}
</style>
