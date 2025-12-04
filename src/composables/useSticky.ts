import { ref, onMounted, onUnmounted, nextTick, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

interface UseStickyOptions {
  containerRef: Ref<HTMLElement | null>
  tabQueryIndex: string
  stickyTop?: number
}

/**
 * A composable function to handle sticky element logic.
 * It tracks scroll position and applies a fixed class to a specified element
 * when it scrolls past a certain threshold.
 * It also handles re-initialization on tab switches.
 *
 * 吸頂元素邏輯的組合式函數。
 * 它會追蹤滾動位置，並在滾動超過特定閾值時，對指定元素應用固定類別。
 * 同時，它也處理在 Tab 切換時的重新初始化。
 * @param options - The options for the sticky behavior.
 * @param options - 吸頂行為的配置選項。
 * @returns - The reactive state and functions to control the sticky behavior.
 * @returns - 控制吸頂行為的響應式狀態和函數。
 */
export function useSticky(options: UseStickyOptions) {
  const { containerRef, tabQueryIndex, stickyTop = 108 } = options

  const route = useRoute()

  const isFilterBarFixed = ref(false)
  const filterBarOriginalTop = ref(0)
  const filterBarHeight = ref(0)
  const isFilterBarInitialized = ref(false)
  const pullRefreshDisabled = ref(false) // This is also part of the scroll logic

  let retryCount = 0

  const doUpdateFilterBarDimensions = () => {
    // Using a timeout to ensure the DOM is fully rendered after a tab switch
    setTimeout(() => {
      if (!containerRef.value) return

      const filterBar = containerRef.value.querySelector('.sticky-filter-bar') as HTMLElement
      if (filterBar) {
        const rect = filterBar.getBoundingClientRect()
        const scrollY = window.scrollY || document.documentElement.scrollTop

        if (rect.height > 0) {
          filterBarOriginalTop.value = rect.top + scrollY
          filterBarHeight.value = filterBar.offsetHeight
          isFilterBarInitialized.value = true
        } else if (retryCount < 5) {
          // If the element is not rendered yet (e.g., height is 0), retry a few times
          retryCount++
          setTimeout(doUpdateFilterBarDimensions, 100)
        }
      }
    }, 200)
  }

  const updateFilterBarDimensions = () => {
    retryCount = 0
    doUpdateFilterBarDimensions()
  }

  const checkScrollPosition = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    // Disable pull-to-refresh when not at the top of the page
    pullRefreshDisabled.value = scrollTop > 5

    if (isFilterBarInitialized.value) {
      const fixedThreshold = filterBarOriginalTop.value - stickyTop
      isFilterBarFixed.value = scrollTop > fixedThreshold
    }
  }

  // Watch for tab changes to re-initialize the sticky state
  watch(
    () => route.query.tab,
    async (newTab) => {
      // The commission tab is the default (index '0' or undefined)
      const isCurrentTab = newTab === tabQueryIndex || (tabQueryIndex === '0' && newTab === undefined)
      if (isCurrentTab) {
        // Reset state and re-calculate dimensions when switching back to this tab
        isFilterBarFixed.value = false
        isFilterBarInitialized.value = false
        await nextTick()
        updateFilterBarDimensions()
      }
    }
  )

  onMounted(() => {
    updateFilterBarDimensions()
    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    checkScrollPosition() // Initial check
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', checkScrollPosition)
  })

  return {
    isFilterBarFixed,
    filterBarHeight,
    pullRefreshDisabled,
    updateFilterBarDimensions
  }
}
