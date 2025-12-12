<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import type SwitchTab from '@/components/SwitchTab/index.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const route = useRoute()

const rootRouteLs = ['manageMember', 'manageAgent', 'manageTeam']

const ls: InstanceType<typeof SwitchTab>['$props']['tabs'] = [
  { id: 'manageMember', title: '会员管理', to: { name: 'manageMember' }},
  ...(!userStore.isSingleAgent ? [{ id: 'manageAgent', title: '代理管理', to: { name: 'manageAgent' }}] : []),
  ...(userStore.hasTeam ? [{ id: 'manageTeam', title: '团队管理', to: { name: 'manageTeam' }}] : []),
]

const active = ref<InstanceType<typeof SwitchTab>['$props']['activeTab']>(ls.findIndex(l => l.id.toString() === route.name) ?? 0)

const isTabAlive = computed(() => {
  const routeName = route.name
  return rootRouteLs.some((l) => l === routeName)
})

</script>

<template>
  <div class="min-h-full flex flex-col flex-1">
    <switch-tab v-if="ls.length > 1 && isTabAlive" v-model:active-tab="active" :tabs="ls" class="px-3" />
    <router-view />
  </div>
</template>
