import '@/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ConfigProvider } from 'vant'

import Big from 'big.js'

import App from './App.vue'
import router from './router'
import { clickOutside } from '@/directives/click-outside'

// 全局的設置無條件捨去
Big.RM = Big.roundDown
const vantComponents = [ConfigProvider]

const app = createApp(App)

app.use(createPinia())
vantComponents.forEach((c) => app.use(c))
app.use(router)

// 註冊全局指令
app.directive('click-outside', clickOutside)
;(async () => {
  await router.isReady()

  app.mount('#app')

  // 移除加載動畫
  const entryLoading = document.getElementById('entry-loading')
  if (!entryLoading) return

  // 淡出動畫
  entryLoading.classList.add('hide')
  entryLoading.addEventListener(
    'transitionend',
    () => {
      entryLoading.remove()
    },
    { once: true },
  )
})()
