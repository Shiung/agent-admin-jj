<!-- 給非input類型的表單元件用(只改樣式) -->
<script setup lang="ts">
import { useSlots } from 'vue'
import type { FieldProps } from 'vant'

export type FormFieldProps = {
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
  // 之後有需要可以再把其它常用 prop 補進來
  [key: string]: any
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  labelAlign: 'top',
  border: false
})

const slots = useSlots()
</script>

<template>
  <van-field v-bind="props" class="form-field">
    <template v-for="(_value, name) in slots" #[name]>
      <slot :name="name" />
    </template>
  </van-field>
</template>

<style lang="scss" scoped>
.form-field {
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

  :deep(.van-field__error-message) {
    margin-top: 4px;
    margin-left: 12px;
    line-height: 1.6;
  }
}
</style>