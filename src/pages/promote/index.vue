<script setup lang="ts">
import { usePromote } from './composables/provideStore'

usePromote()

</script>

<template>
  <div class="flex flex-col">
    <router-view />
  </div>
</template>
