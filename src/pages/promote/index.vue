<script setup lang="ts">
import { usePromote } from './composables/provideStore'

usePromote()

</script>

<template>
  <div class="min-h-screen flex flex-col">
    <router-view />
  </div>
</template>