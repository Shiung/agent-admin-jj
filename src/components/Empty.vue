<script setup lang="ts">
import empty from '@/assets/images/empty.png'
</script>
<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="flex flex-col items-center">
      <van-image fit="cover" :src="empty" class="w-24" />
      <div class="text-sm text-neutral-secondary">尚无资料</div>
    </div>
  </div>
</template>