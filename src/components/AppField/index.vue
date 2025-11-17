<script setup lang="ts">
import { useAttrs, useSlots } from 'vue'
import type { FieldProps } from 'vant'

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
  // 之後有需要可以再把其它常用 prop 補進來
  [key: string]: any
}

const props = withDefaults(defineProps<AppFieldProps>(), {
  labelAlign: 'top',
  border: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: FieldProps['modelValue'] | undefined): void
}>()

const attrs = useAttrs()
const slots = useSlots()
</script>


<template>
  <van-field v-bind="props" v-on="attrs" class="app-field" :model-value="modelValue"
    @update:model-value="val => emit('update:modelValue', val)">
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
  }

  :deep(.van-field__body) {
    padding: 12px;
    border-radius: 9999px;
    border: 1px solid var(--color-neutral2-seventh);
  }

  :deep(.van-field__control) {
    font-size: 16px;
    font-weight: 400;
    color: var(--color-neutral-basic);

    &::placeholder {
      color: var(--color-neutral2-fourth);
    }
  }

  &:focus-within {
    :deep(.van-field__body) {
      border-color: var(--color-primary-50);
    }
  }

  :deep(.van-field__error-message) {
    margin-top: 4px;
    margin-left: 12px;
    line-height: 1.6;
  }

  &:has(:deep(.van-field__error-message)) {
    :deep(.van-field__body) {
      border-color: var(--color-error-50);
    }
  }
}
</style>
