<script setup lang="ts">
import { defineAsyncComponent, ref, inject, type Component, watchEffect } from 'vue'
import promoteSwitchBtn from './components/promoteSwitchBtn.vue'
import productSwitchBtn from './components/productSwitchBtn.vue'

import { PromoteActionSymbol } from './composables/provideStore'

const { updateDomainType } = inject(PromoteActionSymbol)!

const promoteTabs: Array<{ id: number, title: string, comp: Component }> = [
  { id: 0, title: '产品', comp: defineAsyncComponent(() => import('./components/productList.vue')) },
  { id: 1, title: '素材', comp: defineAsyncComponent(() => import('./components/materialList.vue')) }
]
const promoteActiveTab = ref<number>(promoteTabs[0]?.id ?? 0)

const productTabs: Array<{ id: number, title: string }> = [{ id: 0, title: '代理' }, { id: 1, title: '专属' }]
const productActiveTab = ref<number>(productTabs[0]?.id ?? 0)

watchEffect(() => {
  if (typeof updateDomainType === 'function') {
    updateDomainType(productActiveTab.value as 0 | 1)
  }
})
</script>

<template>
  <div class="px-3 flex-1 flex flex-col space-y-4">
    <HeaderBar />
    <promote-switch-btn :promote-tabs="promoteTabs" v-model:promote-active-tab="promoteActiveTab" />
    <component :is="promoteTabs[promoteActiveTab]?.comp" />
    <div class="flex-1 mb-0" />
    <product-switch-btn v-if="promoteActiveTab !== promoteTabs?.[1]?.id" :product-tabs="productTabs" v-model:product-active-tab="productActiveTab" />
  </div>
</template>