<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  showClose?: boolean
  showButton?: boolean
  cancelText?: string
  confirmText?: string
  confirmDisabled?: boolean
  submitLoading?: boolean
  height?: string
}

withDefaults(defineProps<Props>(), {
  title: '提示',
  showClose: true,
  showButton: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmDisabled: false,
  submitLoading: false,
  height: '93%',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'close': []
  'confirm': []
}>()

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: height }"
    @click-overlay="handleClose"
    @update:show="emit('update:show', $event)"
  >
    <div class="flex-1 flex flex-col pt-2 h-full">
      <!-- 标题 -->
      <h3 class="relative flex items-center justify-center px-4 text-lg font-semibold text-neutral2-basic mb-2">
        {{ title }}
        <van-image v-if="showClose" src="./static/images/common/close.svg" fit="contain" class="!absolute right-4 w-4 h-4" @click="handleClose" />
      </h3>
      
      <!-- 内容插槽 -->
      <slot />
      
      <!-- 按钮 -->
      <div v-if="showButton" class="flex gap-3 p-4">
        <van-button 
          class="flex-1 !h-12 !text-base" 
          type="primary" 
          plain 
          round 
          :loading="submitLoading"
          @click="handleClose"
        >
          {{ cancelText }}
        </van-button>
        <van-button 
          class="flex-1 !h-12 !text-base gray-disabled" 
          type="primary" 
          round 
          native-type="submit" 
          :disabled="confirmDisabled" 
          :loading="submitLoading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>
