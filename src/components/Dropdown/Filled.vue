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
  placeholder: '請選擇',
  disabled: false,
  height: '1.5rem',
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
    <SelectContent class="dropdown-menu min-w-auto">
      <SelectGroup>
        <SelectItem
          v-for="option in options"
          :key="option.value || `${option.label}-${option.value}`"
          :value="option.value"
          :class="['dropdown-item', { 'is-selected': option.value === model }]"
          hiddenCheck
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
  flex: none;
  align-items: center;
  justify-content: space-between;
  width: auto;
  height: v-bind(height);
  padding: .75rem .5rem;
  background: var(--color-bg-floor-1-2);
  border: 0px solid var(--color-primary-normal);
  border-radius: 6.25rem;
  font-size: 0.75rem;
  color: var(--color-neutral2-basic);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-button:hover:not(.is-disabled) {
  border-width: 0px;
  box-shadow: none;
  background: var(--color-bg-floor-1-3);
}

.dropdown-button[data-state="open"] {
  border-width: 0px;
  box-shadow: none;
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
    font-size: .75rem;
  }
}
</style>
<style lang="scss" scoped>
.dropdown-menu {
  background: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  /* max-height: 16rem; */
  --reka-popper-available-height: 16rem;
  & > [role="presentation"] {
    min-width: auto;
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
  font-size: 0.75rem;
  color: var(--color-neutral2-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background: transparent;
}

.dropdown-item.is-selected {
  background: transparent;
  color: var(--color-primary-normal);
  font-weight: 500;
}

/* RWD 響應式 */
@media (max-width: 640px) {
  .dropdown-item {
    padding: .75rem .5rem;
    font-size: .75rem;
  }

  .dropdown-menu {
    max-height: 60vh;
  }
}
</style>
