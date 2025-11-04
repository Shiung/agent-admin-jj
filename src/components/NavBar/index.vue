<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
}

withDefaults(defineProps<Props>(), {
  title: '',
})

const emit = defineEmits<{
  'back': []
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  router.back()
}
</script>

<template>
  <div class="sticky top-0 z-10 bg-white">
    <div class="flex items-center justify-between h-14 px-4">
      <!-- 返回按钮 -->
      <button 
        @click="handleBack" 
        class="p-2 -ml-2 rounded-full transition-colors"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- 标题 -->
      <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>

      <!-- 右側插槽 -->
      <slot name="right">
        <!-- 占位符保持布局平衡 -->
        <div class="w-10" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
</style>

