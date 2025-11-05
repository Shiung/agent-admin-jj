<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {

})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="sticky top-0 bg-amber-300">fake header</div>
    <router-view />
  </div>
</template>