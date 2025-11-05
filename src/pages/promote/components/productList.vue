<script setup lang="ts">
import { ref } from 'vue'
import productCard from './productCard.vue'
const data = ref([
  {
    id: 1,
    name: 'K849889_800',
    desc: '生肖世界小游戏',
    version: '3.0.4.2',
    inviteCode: '4932C',
    icon: 'https://via.placeholder.com/64x64.png?text=App',
    appUrl: 'https://6022fakeurl31.cqa.com/?channel=app',
    webUrl: 'https://6022fakeurl31.cqa.com/?channel=h5',
    date: '2025-10-14'
  },
  {
    id: 2,
    name: 'K849889_801',
    desc: '生肖世界小游戏123',
    version: '3.0.4.6',
    inviteCode: '5932C',
    icon: 'https://via.placeholder.com/64x64.png?text=App',
    appUrl: 'https://6022fakeurl31.cqa.com/?channel=app',
    webUrl: 'https://6022fakeurl31.cqa.com/?channel=h5',
    date: '2025-10-14'
  }
])
</script>

<template>
  <div class="space-y-4">
    <product-card v-for="d in data" :product="d" :key="d.id" />
  </div>
</template>