<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const el = ref<HTMLDivElement>()

defineProps<{
  loading: boolean
}>()

const finished = defineModel<boolean>('finished', { required: true })

const emit = defineEmits<{
  (e: 'onLoad'): void
}>()

useIntersectionObserver(
  el,
  ([entry]) => {
    const isActive = entry?.isIntersecting ?? false
    if (isActive) emit('onLoad')
  },
  {
    rootMargin: '0px -10px 0px -10px'
  }
)

</script>

<template>
  <div v-if="finished" class="flex justify-center items-center text-xs text-neutral2-tertiary p-2">
    没有更多了
  </div>
  <div v-else-if="loading" class="flex justify-center items-center p-2">
    <van-loading color="var(--color-primary-normal)" />
  </div>
  <div v-else ref="el" />
</template>
