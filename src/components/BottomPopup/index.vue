<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  showClose?: boolean
  cancelText?: string
  confirmText?: string
  confirmDisabled?: boolean
  height?: string
}

withDefaults(defineProps<Props>(), {
  title: '提示',
  showClose: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmDisabled: false,
  height: '93%',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'cancel': []
  'confirm': []
}>()

const handleCancel = () => {
  emit('cancel')
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
    @click-overlay="handleCancel"
    @update:show="emit('update:show', $event)"
  >
    <div class="flex-1 flex flex-col pt-2 h-full">
      <!-- 标题 -->
      <h3 class="relative flex items-center justify-center px-4 text-lg font-semibold text-neutral2-basic mb-2">
        {{ title }}
        <van-image v-if="showClose" src="./static/images/common/close.svg" fit="contain" class="!absolute right-4 w-4 h-4" @click="handleCancel" />
      </h3>
      
      <!-- 内容插槽 -->
      <slot />
      
      <!-- 按钮 -->
      <div class="flex gap-3 p-4">
        <van-button type="primary" plain round class="flex-1 !text-base" @click="handleCancel">
          {{ cancelText }}
        </van-button>
        <van-button type="primary" round native-type="submit" class="flex-1 !text-base gray-disabled" :disabled="confirmDisabled" @click="handleConfirm">
          {{ confirmText }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>
