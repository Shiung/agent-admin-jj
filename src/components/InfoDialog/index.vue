<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  confirmText?: string
  width?: string
}

withDefaults(defineProps<Props>(), {
  title: '提示',
  confirmText: '我知道了',
  width: '85%',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': []
}>()

const handleConfirm = () => {
  emit('update:show', false)
  emit('confirm')
}
</script>

<template>
  <van-popup
    :show="show"
    position="center"
    round
    :style="{ width: width, maxWidth: '400px' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="p-6">
      <!-- 标题 -->
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ title }}</h3>
      
      <!-- 内容插槽 -->
      <div class="space-y-3 text-sm text-gray-600 leading-relaxed mb-6">
        <slot />
      </div>
      
      <!-- 确认按钮 -->
      <van-button 
        type="primary" 
        class="w-full" 
        @click="handleConfirm"
      >
        {{ confirmText }}
      </van-button>
    </div>
  </van-popup>
</template>

<style scoped>
/* 可以添加自定义样式 */
</style>

