import type { Directive, DirectiveBinding } from 'vue'

interface ClickOutsideElement extends HTMLElement {
  clickOutsideEvent?: (event: MouseEvent) => void
}

export const clickOutside: Directive = {
  mounted(el: ClickOutsideElement, binding: DirectiveBinding) {
    el.clickOutsideEvent = (event: MouseEvent) => {
      // 檢查點擊是否在元素外部
      if (!(el === event.target || el.contains(event.target as Node))) {
        // 調用綁定的方法
        binding.value(event)
      }
    }
    // 延遲綁定事件，避免立即觸發
    setTimeout(() => {
      document.addEventListener('click', el.clickOutsideEvent!)
    }, 0)
  },
  unmounted(el: ClickOutsideElement) {
    // 清理事件監聽器
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
      delete el.clickOutsideEvent
    }
  },
}

