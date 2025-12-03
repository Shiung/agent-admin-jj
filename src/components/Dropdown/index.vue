<script setup lang="ts">
import { computed, useAttrs, watch } from 'vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const attrs = useAttrs()

interface DropdownOption {
  label: string
  value: string | number | null
}

interface Props {
  height?: string
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
}

const model = defineModel<string | number | null>('modelValue', { required: true })

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  height: '2.5rem',
})

const emit = defineEmits<{
  'change': [value: string | number | null]
}>()

const selectedOption = computed(() => {
  return props.options.find(option => option.value === model.value)
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.placeholder
})


watch(model, (val) => emit('change', val))
</script>

<template>
  <Select v-model="model" :disabled="disabled">
    <SelectTrigger class="dropdown-button" :class="attrs.class">
      <SelectValue :placeholder="placeholder">
        <slot name="prefix" />
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">{{ displayText }}</p>
        <slot name="suffix" />
      </SelectValue>
    </SelectTrigger>
    <SelectContent class="dropdown-menu">
      <SelectGroup>
        <SelectItem
          v-for="option in options"
          :key="option.value || `${option.label}-${option.value}`"
          :value="option.value"
          :class="['dropdown-item', { 'is-selected': option.value === model }]"
        >
          <p class="whitespace-nowrap overflow-hidden text-ellipsis">{{ option.label }}</p>
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped>
.dropdown-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: v-bind(height);
  padding: .75rem .5rem;
  background: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 6.25rem;
  font-size: 0.875rem;
  color: var(--color-neutral2-basic);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-button:hover:not(.is-disabled) {
  border-color: var(--color-primary-normal);
  background: var(--color-bg-floor-1-2);
}

.dropdown-button[data-state="open"] {
  border-color: var(--color-primary-normal);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.dropdown-button[data-disabled="true"] {
  background: var(--color-bg-floor-1-2);
  color: var(--color-neutral2-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* RWD 響應式 */
@media (max-width: 640px) {
  .dropdown-button {
    height: v-bind(height);
    padding: .75rem .5rem;
    font-size: .875rem;
  }
}
</style>
<style lang="scss">
.dropdown-menu {
  background: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  /* max-height: 16rem; */
  --reka-popper-available-height: 16rem;
  & > [role="presentation"] {
    padding: 0;
  }
}

/* 滾動條樣式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: var(--color-neutral2-seventh);
  border-radius: 0 0.5rem 0.5rem 0;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: var(--color-neutral2-seventh);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral2-seventh);
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-neutral2-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background: var(--color-primary-5);
}

.dropdown-item.is-selected {
  background: var(--color-primary-10);
  color: var(--color-primary-normal);
  font-weight: 500;
}

/* RWD 響應式 */
@media (max-width: 640px) {
  .dropdown-item {
    padding: .75rem .5rem;
    font-size: .875rem;
  }

  .dropdown-menu {
    max-height: 60vh;
  }
}
</style>