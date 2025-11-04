<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {

})
</script>

<template>
  <div class="h-screen">
    <router-view />
    
    <!-- <div class="h-[200px] bg-red-700">
      ptomote
      <router-link to="/promote/child">chiid</router-link>
    </div>
    <Teleport defer to="#teleport-promote">
      <div class="bg-amber-950">haha</div>
    </Teleport> -->
  </div>
</template>