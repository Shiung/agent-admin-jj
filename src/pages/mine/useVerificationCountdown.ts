import { ref, onBeforeUnmount } from 'vue'

export function useVerificationCountdown(duration = 60) {
  const countdown = ref<number>(0)
  const loading = ref<boolean>(false)
  const hasRequested = ref<boolean>(false)

  let timer: ReturnType<typeof setInterval> | null = null

  const clear = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  const start = async (send: () => Promise<boolean | void>) => {
    if (loading.value || countdown.value > 0) return

    try {
      loading.value = true
      const shouldStart = await send()

      // 如果失敗就不啟動倒數
      if (shouldStart === false) return

      hasRequested.value = true
      countdown.value = duration

      clear()
      timer = setInterval(() => {
        countdown.value --
        if (countdown.value <= 0) {
          clear()
          countdown.value = 0
        }
      }, 1000)
    } finally {
      loading.value = false
    }
  }

  onBeforeUnmount(() => {
    clear()
  })

  return {
    countdown,
    loading,
    hasRequested,
    start,
    clear
  }
}
