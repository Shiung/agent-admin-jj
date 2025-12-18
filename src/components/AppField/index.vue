<script setup lang="ts">
import { ref, useSlots } from 'vue'
import type { FieldInstance, FieldProps } from 'vant'
import { useMutationObserver } from '@vueuse/core'

export type AppFieldProps = {
  modelValue?: FieldProps['modelValue']
  name?: FieldProps['name']
  label?: FieldProps['label']
  labelAlign?: FieldProps['labelAlign']
  placeholder?: FieldProps['placeholder']
  clearable?: FieldProps['clearable']
  rules?: FieldProps['rules']
  type?: FieldProps['type']
  maxlength?: FieldProps['maxlength']
  disabled?: FieldProps['disabled']
  readonly?: FieldProps['readonly']
  border?: FieldProps['border']
  error?: FieldProps['error']

  /** 禁止輸入空格 */
  disableSpace?: boolean
  // 之後有需要可以再把其它常用 prop 補進來
  [key: string]: any
}

const props = withDefaults(defineProps<AppFieldProps>(), {
  labelAlign: 'top',
  placeholder: '请输入',
  border: false,
  disableSpace: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: FieldProps['modelValue'] | undefined): void
}>()

const slots = useSlots()

const fieldRef = ref<FieldInstance | null>(null)
const hasError = ref(false)

// 偵測 error DOM 是否存在
useMutationObserver(
  () => fieldRef.value?.$el,
  () => {
    const el = fieldRef.value?.$el
    if (!el) return
    hasError.value = !!el.querySelector('.van-field__error-message')
  },
  { childList: true, subtree: true }
)

const updateModelValue = (val: FieldProps['modelValue']) => {
  if (props.disableSpace && typeof val === 'string') {
    emit('update:modelValue', val.replace(/\s+/g, ''))
    return
  }

  emit('update:modelValue', val)
}

const onKeydown = (e: KeyboardEvent) => {
  if (props.disableSpace && e.key === ' ') {
    e.preventDefault()
  }
}
</script>

<template>
  <van-field ref="fieldRef" v-bind="props" class="app-field" :class="{ 'app-field--error': hasError }"
    :model-value="modelValue" @update:model-value="updateModelValue" @keydown="onKeydown">
    <template v-if="slots.label" #label>
      <slot name="label" />
    </template>

    <template v-if="slots.input" #input>
      <slot name="input" />
    </template>

    <template v-if="slots['left-icon']" #left-icon>
      <slot name="left-icon" />
    </template>

    <template v-if="slots['right-icon']" #right-icon>
      <slot name="right-icon" />
    </template>

    <template v-if="slots.button" #button>
      <slot name="button" />
    </template>

    <template v-if="slots['error-message']" #error-message="slotProps">
      <slot name="error-message" v-bind="slotProps" />
    </template>

    <template v-if="slots.extra" #extra>
      <slot name="extra" />
    </template>
  </van-field>
</template>

<style lang="scss" scoped>
.app-field {
  :deep(.van-field__label) {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-neutral-basic);
    line-height: 24px;
    
    &.van-field__label--required::before  {
      display: none;  
    }

    &.van-field__label--required::after {
      content: "*";
      color: var(--color-error-normal);
    }
  }

  :deep(.van-field__body) {
    padding: 12px;
    border-radius: 9999px;
    border: 1px solid var(--color-neutral2-seventh);

    .van-field__button {
      margin: -2rem 0;
    }
  }

  :deep(.van-field__control) {
    font-size: 16px;
    font-weight: 400;
    color: var(--color-neutral-basic);

    &::placeholder {
      color: var(--color-neutral2-fourth);
    }
  }

  &.van-field--disabled {
    :deep(.van-field__value) {
      .van-field__body {
        background-color: var(--color-neutral2-seventh);
        .van-field__control {
          -webkit-text-fill-color: var(--color-neutral-basic)
        }
      }
    }
  }

  &:focus-within {
    :deep(.van-field__body) {
      border-color: var(--color-primary-50);
    }
  }

  &.app-field--error {
    :deep(.van-field__body) {
      border-color: var(--color-error-50);
    }
  }

  :deep(.van-field__error-message) {
    margin-top: 4px;
    margin-left: 12px;
    line-height: 1.6;
  }
}
</style>
