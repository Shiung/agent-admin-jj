<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
}

withDefaults(defineProps<Props>(), {
  title: '',
})

const emit = defineEmits<{
  'back': []
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  router.back()
}
</script>

<template>
  <van-nav-bar fixed placeholder safe-area-inset-top :title="title" left-arrow @click-left="handleBack">
    <template #left>
      <svg class="w-6 h-6 text-[var(--color-neutral-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </template>
  </van-nav-bar>
</template>

<style scoped></style>
