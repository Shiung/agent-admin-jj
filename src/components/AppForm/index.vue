<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'vant'

// 定義 props，繼承 van-form 的常用屬性
// 根據需要可以擴充更多
interface Props {
  showError?: boolean
  submitOnEnter?: boolean
  labelWidth?: string | number
  labelAlign?: 'left' | 'center' | 'right' | 'top'
  inputAlign?: 'left' | 'center' | 'right'
  scrollToError?: boolean
  validateFirst?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showError: true,
  submitOnEnter: true,
  labelAlign: 'top',
  scrollToError: true,
  validateFirst: true
})

const emit = defineEmits<{
  (e: 'submit', values: any): void
  (e: 'failed', errorInfo: any): void
}>()

const formRef = ref<FormInstance>()

// 暴露 submit 方法供外部調用
const submit = () => {
  formRef.value?.submit()
}

// 暴露 validate 方法
const validate = (name?: string | string[]) => {
  return formRef.value?.validate(name)
}

// 暴露 resetValidation 方法
const resetValidation = (name?: string | string[]) => {
  formRef.value?.resetValidation(name)
}

// 暴露 getValues 方法 (Vant 4.9+)
const getValues = () => {
  return formRef.value?.getValues()
}

defineExpose({
  submit,
  validate,
  resetValidation,
  getValues,
  formRef
})
</script>

<template>
  <van-form
    ref="formRef"
    v-bind="props"
    class="app-form"
    @submit="(values) => emit('submit', values)"
    @failed="(errorInfo) => emit('failed', errorInfo)"
  >
    <slot />
  </van-form>
</template>

<style lang="scss" scoped>
.app-form {
  // 可以在這裡添加全域的 form 樣式調整
  :deep(.van-cell) {
    padding-left: 0;
    padding-right: 0;
    
    &::after {
      display: none;
    }
  }
}
</style>
