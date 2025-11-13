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

const app = createApp(App)

app.use(createPinia())
app.use(ConfigProvider)
app.use(router)

// 註冊全局指令
app.directive('click-outside', clickOutside)

app.mount('#app')
