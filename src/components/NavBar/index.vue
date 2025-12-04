<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
  showDetail?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  showDetail: false
})

const emit = defineEmits<{
  'back': [],
  'detailClick': []
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  router.back()
}

const handleDetailClick = () => {
  emit('detailClick')
}
</script>

<template>
  <van-nav-bar fixed placeholder safe-area-inset-top :title="title" left-arrow @click-left="handleBack">
    <template #left>
      <svg class="w-6 h-6 text-[var(--color-neutral-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </template>
    <template #right>
      <slot v-if="$slots.right" name="right" />
      <div v-if="showDetail" class="flex items-center" @click="handleDetailClick">
        <van-image src="./static/images/common/resultRecord.svg" fit="contain" class="w-6" />
      </div>
    </template>
  </van-nav-bar>
</template>

<style scoped></style>
