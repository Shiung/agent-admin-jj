<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GestureLock from './GestureLock.vue'

interface Props {
  pattern: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [pattern: number[]]
  error: []
}>()

const router = useRouter()
const gestureLockRef = ref<InstanceType<typeof GestureLock>>()

const handleComplete = (pattern: number[]) => {
  emit('complete', pattern)
}

const handleError = () => {
  emit('error')
}

defineExpose({
  reset: () => {
    gestureLockRef.value?.reset()
  },
})
</script>

<template>
  <div class="flex flex-col items-center">
    <GestureLock
      ref="gestureLockRef"
      title="确认手势密码"
      :pattern="props.pattern"
      @complete="handleComplete"
      @error="handleError"
    />

    <p
      class="mt-8 text-primary-normal text-base font-semibold cursor-pointer underline"
      @click="router.push({ name: 'gesturePassword' })"
    >
      忘记手势密码?
    </p>
  </div>
</template>
