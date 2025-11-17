<script setup lang="ts">
import { ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

interface TabItem {
  key: string
  label: string
  active: string
  inactive: string
  to: RouteLocationRaw
}

const tabs: TabItem[] = [
  {
    key: 'home',
    label: '首页',
    active: './static/images/tabBar/active/home.svg',
    inactive: './static/images/tabBar/home.svg',
    to: { name: 'index' },
  },
  {
    key: 'manage',
    label: '管理',
    active: './static/images/tabBar/active/manage.svg',
    inactive: './static/images/tabBar/manage.svg',
    to: { name: 'manage' },
  },
  {
    key: 'promote',
    label: '推广',
    active: './static/images/tabBar/active/promote.svg',
    inactive: './static/images/tabBar/promote.svg',
    to: { name: 'promoteHome' },
  },
  {
    key: 'report',
    label: '报表',
    active: './static/images/tabBar/active/report.svg',
    inactive: './static/images/tabBar/report.svg',
    to: { name: 'report' },
  },
  {
    key: 'mine',
    label: '个人',
    active: './static/images/tabBar/active/mine.svg',
    inactive: './static/images/tabBar/mine.svg',
    to: { name: 'mine' },
  },
]

const activeKey = ref('home')
</script>

<template>
  <van-tabbar class="app-tabbar" v-model="activeKey" route placeholder :border="false" safe-area-inset-bottom>
    <van-tabbar-item v-for="tab in tabs" :key="tab.key" :name="tab.key" :to="tab.to">
      <template #icon="props">
        <img :src="props.active ? tab.active : tab.inactive" />
      </template>
      {{ tab.label }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<style lang="scss" scoped>
.app-tabbar {
  --van-tabbar-item-font-size: 12px;
  --van-tabbar-item-icon-margin-bottom: 4px;

  :deep(.van-tabbar) {
    box-shadow: 0 -1px 6px rgba(15, 30, 60, 0.10);
  }

  :deep(.van-tabbar-item__icon img) {
    height: 28px;
  }
}
</style>
