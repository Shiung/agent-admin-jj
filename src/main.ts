import '@/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Big from 'big.js'

import App from './App.vue'
import router from './router'

// 全局的設置無條件捨去
Big.RM = Big.roundDown

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
