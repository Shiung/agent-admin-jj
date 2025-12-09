<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommissionPage from './commission/index.vue'
import FinancePage from './finance/index.vue'
import AgentPage from './agent/index.vue'

const route = useRoute()
const router = useRouter()

// Tab 配置
type TabId = 'commission' | 'finance' | 'agent'

const tabs: { id: TabId; name: string }[] = [
  { id: 'commission', name: '佣金' },
  { id: 'finance', name: '财务' },
  { id: 'agent', name: '代理' }
]

const defaultTabId: TabId = 'commission'
const activeTab = ref<TabId>(defaultTabId) // 默认选中第一个 tab

// 记录已访问过的 tab，用于实现懒加载
const visitedTabs = ref<Set<string>>(new Set([activeTab.value]))

// 从路由查询参数中恢复 activeTab
onMounted(() => {
  // 只有當路由是 report 主頁面時才處理 tab 切換
  if (route.name === 'report') {
    const tabId = (route.query.tab as TabId) || defaultTabId
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      activeTab.value = tab.id
      visitedTabs.value.add(tab.id)
    }
  }
})

// 監聽路由變化，處理瀏覽器返回按鈕
watch(() => route.query.tab, (newTabId) => {
  if (route.name === 'report' && newTabId) {
    const tab = tabs.find(t => t.id === newTabId)
    if (tab) {
      activeTab.value = tab.id
      visitedTabs.value.add(tab.id)
    }
  }
}, { immediate: true })

// 当 activeTab 改变时，更新路由查询参数并记录已访问的 tab
watch(activeTab, (newTab) => {
  // 只有當路由是 report 主頁面時才更新路由
  if (route.name === 'report') {
    visitedTabs.value.add(newTab)
    router.replace({
      name: 'report',
      query: { tab: newTab }
    })
  }
})
</script>

<template>
  <div class="bg-white">
    <van-tabs class="report-tabs" v-model:active="activeTab" color="var(--color-primary-normal)"
      title-active-color="var(--color-white)" title-inactive-color="var(--color-neutral-secondary)" type="card">
      <van-tab v-for="tab in tabs" :key="tab.id" :name="tab.id" :title="tab.name" />
    </van-tabs>

    <!-- 使用 v-if 懒加载 + v-show 控制显示，每个 tab 只在第一次访问时挂载 -->
    <div class="tab-content">
      <CommissionPage v-if="visitedTabs.has('commission')" v-show="activeTab === 'commission'" />
      <FinancePage v-if="visitedTabs.has('finance')" v-show="activeTab === 'finance'" />
      <AgentPage v-if="visitedTabs.has('agent')" v-show="activeTab === 'agent'" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.report-tabs {
  &:deep() {
    --van-tabs-card-height: 48px;
    --van-padding-md: 0rem;
    --van-radius-sm: 6.25rem;

    >.van-tabs__wrap {
      position: fixed;
      top: 44px;
      left: 0;
      right: 0;
      z-index: 20;
      background-color: white;
      height: 64px;
      padding: 8px 12px;

      .van-tabs__nav.van-tabs__nav--card {
        padding: 0.1875rem;
        border-color: var(--color-neutral2-seventh) !important;

        .van-tab {
          font-size: 15px;
          font-weight: 400;
        }

        .van-tab.van-tab--card.van-tab--active {
          border-radius: var(--van-radius-sm);
        }
      }

      .van-tab--card {
        border-right: none;
      }
    }

    >.van-tabs__content {
      padding-top: 64px;
      position: relative;
    }
  }
}
</style>
