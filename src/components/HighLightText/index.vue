<script setup lang="ts">
import { computed } from 'vue';

const { word, keyWord } = defineProps<{
  word: string
  keyWord: string
}>()

const render = computed<Array<{ text: string; isHighlight: boolean }>>(() => {
  if (!keyWord) return [{ text: word, isHighlight: false }]
  const req = new RegExp(`(${keyWord})`, 'g')
  const parts = word.split(req)
  return parts.filter((p) => p !== '').map((p) => ({
    text: p,
    isHighlight: p === keyWord
  })) 
})

</script>

<template>
  <span v-for="(w, idx) in render" :key="idx" :class="w.isHighlight && 'text-primary-normal'">{{ w.text }}</span>
</template>