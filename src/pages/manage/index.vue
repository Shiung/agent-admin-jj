<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type SwitchTab from '@/components/SwitchTab/index.vue'

const route = useRoute()


const ls: InstanceType<typeof SwitchTab>['$props']['tabs'] = [
  { id: 'manageMember', title: '會員', to: { name: 'manageMember' }},
  { id: 'manageAgent', title: '代理', to: { name: 'manageAgent' }},
  { id: 'manageTeam', title: '團隊', to: { name: 'manageTeam' }},
]

const active = ref<InstanceType<typeof SwitchTab>['$props']['activeTab']>(ls.findIndex(l => l.id.toString() === route.name) ?? 0)

</script>

<template>
  <div class="min-h-full flex flex-col flex-1">
    <switch-tab v-model:active-tab="active" :tabs="ls" class="px-3" />
    <router-view />
  </div>
</template>
