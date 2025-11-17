<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { usePromote } from './composables/provideStore'

const route = useRoute()
const { states } = usePromote()

const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })

watchEffect(() => {
  if (states.isReady) loading.close()
})

watchEffect(() => {
  if (route.name) {
    window.scrollTo({ top: 0 })
  }
})

</script>

<template>
  <div class="flex flex-col flex-1">
    <router-view />
  </div>
</template>
