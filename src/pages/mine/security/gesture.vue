<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GestureLock from './components/GestureLock.vue'
import GestureConfirm from './components/GestureConfirm.vue'

const router = useRouter()
const step = ref<'setup' | 'confirm'>('setup')
const firstPattern = ref<number[]>([])
const gestureLockRef = ref<InstanceType<typeof GestureLock>>()
const gestureConfirmRef = ref<InstanceType<typeof GestureConfirm>>()

const handleSetupComplete = (pattern: number[]) => {
  firstPattern.value = pattern
  setTimeout(() => {
    step.value = 'confirm'
    gestureLockRef.value?.reset()
  }, 500)
}

const handleSetupError = () => {
  showToast('至少需要连接4个点')
}

const handleConfirmComplete = (pattern: number[]) => {
  if (pattern.length !== firstPattern.value.length) {
    showToast('手势密码不一致，请重试')
    gestureConfirmRef.value?.reset()
    return
  }

  const isSame = pattern.every((point, index) => point === firstPattern.value[index])
  if (isSame) {
    saveGesturePassword(pattern)
  } else {
    showToast('手势密码不一致，请重试')
    gestureConfirmRef.value?.reset()
  }
}

const handleConfirmError = () => {
  showToast('至少需要连接4个点')
}

const saveGesturePassword = (pattern: number[]) => {
  try {
    const patternString = pattern.join(',')
    localStorage.setItem('gesturePassword', patternString)
    showToast('手势密码设置成功')

    router.replace({ name: 'security' })
  } catch (error: any) {
    showFailToast(error?.response?.data?.Msg)
  }
}
</script>

<template>
  <div class="flex flex-col pb-6 min-h-screen">
    <div class="flex-1 flex flex-col items-center justify-start mt-[64px]">
      <van-image
        src="./static/images/mine/gesture.svg"
        width="50"
        height="50"
        class="mx-auto mb-4"
      />

      <GestureLock
        v-if="step === 'setup'"
        ref="gestureLockRef"
        title="设置手势密码"
        @complete="handleSetupComplete"
        @error="handleSetupError"
      />

      <GestureConfirm
        v-else
        ref="gestureConfirmRef"
        :pattern="firstPattern"
        @complete="handleConfirmComplete"
        @error="handleConfirmError"
      />
    </div>
  </div>
</template>
