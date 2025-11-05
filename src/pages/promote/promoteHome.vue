<script setup lang="ts">
import { ref } from 'vue'
import productCard from './components/productCard.vue'
import promoteSwitchBtn from './components/promoteSwitchBtn.vue'
import productSwitchBtn from './components/productSwitchBtn.vue'

const promoteTabs: Array<{ id: number, title: string }> = [{ id: 0, title: '產品' }, { id: 1, title: '素材' }]
const promoteActiveTab = ref<number>(promoteTabs[0]?.id ?? 0)

const productTabs: Array<{ id: number, title: string }> = [{ id: 0, title: '代理' }, { id: 1, title: '专属' }]
const productActiveTab = ref<number>(productTabs[0]?.id ?? 0)

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
  <div class="px-3 flex-1 flex flex-col space-y-4">
    <promote-switch-btn :promote-tabs="promoteTabs" v-model:promote-active-tab="promoteActiveTab" />
    <product-card v-for="d in data" :product="d" :key="d.id" />
    <div class="flex-1 mb-0" />
    <product-switch-btn v-if="promoteActiveTab !== promoteTabs?.[1]?.id" :product-tabs="productTabs" v-model:product-active-tab="productActiveTab" />
  </div>
</template>