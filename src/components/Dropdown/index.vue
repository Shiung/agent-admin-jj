<script setup lang="ts">
import { ref, computed } from 'vue'

interface DropdownOption {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  class?: string
  height?: string
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
}

const model = defineModel<string | number>('modelValue', { required: true })

const props = withDefaults(defineProps<Props>(), {
  placeholder: '請選擇',
  disabled: false,
  class: '',
  height: '2.5rem',
})

const emit = defineEmits<{
  'change': [value: string | number]
}>()

const isOpen = ref(false)

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.placeholder
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: DropdownOption) => {
  model.value = option.value
  emit('change', option.value)
  isOpen.value = false
}

// 點擊外部關閉下拉選單
const handleClickOutside = () => {
  isOpen.value = false
}
</script>

<template>
  <div :class="['dropdown-container', props.class]" v-click-outside="handleClickOutside">
    <!-- 下拉選單按鈕 -->
    <button
      type="button"
      class="dropdown-button"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      @click="toggleDropdown"
    >
      <span class="dropdown-text" :class="{ 'is-placeholder': !selectedOption }">
        {{ displayText }}
      </span>
      <svg
        class="dropdown-icon"
        :class="{ 'rotate': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉選單內容 -->
    <transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-menu">
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-item"
          :class="{ 'is-selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          <span>{{ option.label }}</span>
          <svg
            v-if="option.value === modelValue"
            class="check-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  width: 100%;
}

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

.dropdown-button.is-open {
  border-color: var(--color-primary-normal);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.dropdown-button.is-disabled {
  background: var(--color-bg-floor-1-2);
  color: var(--color-neutral2-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-text {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.dropdown-text.is-placeholder {
  color: var(--color-neutral2-secondary);
  font-weight: 400;
}

.dropdown-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-neutral2-secondary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-white);
  border: 1px solid var(--color-neutral2-seventh);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 16rem;
  overflow-y: auto;
  overflow-x: hidden;
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

.check-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary-normal);
  flex-shrink: 0;
  margin-left: 0.5rem;
}

/* 動畫效果 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* RWD 響應式 */
@media (max-width: 640px) {
  .dropdown-button {
    height: v-bind(height);
    padding: .75rem .5rem;
    font-size: .875rem;
  }

  .dropdown-text {
    font-size: .875rem;
  }

  .dropdown-item {
    padding: .75rem .5rem;
    font-size: .875rem;
  }

  .dropdown-menu {
    max-height: 60vh;
  }
}
</style>

