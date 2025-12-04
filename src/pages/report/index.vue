<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommissionPage from './commission/index.vue'
import FinancePage from './finance/index.vue'
import AgentPage from './agent/index.vue'

const route = useRoute()
const router = useRouter()

// Tab 配置
const tabs = ['佣金', '财务', '代理']
const activeTab = ref(0)

// 记录已访问过的 tab，用于实现懒加载
const visitedTabs = ref<Set<number>>(new Set([0])) // 默认第一个 tab 已访问

// 从路由查询参数中恢复 activeTab
onMounted(() => {
  const tabIndex = route.query.tab ? Number(route.query.tab) : 0
  if (tabIndex >= 0 && tabIndex < tabs.length) {
    activeTab.value = tabIndex
    visitedTabs.value.add(tabIndex)
  }
})

// 当 activeTab 改变时，更新路由查询参数并记录已访问的 tab
watch(activeTab, (newTab) => {
  visitedTabs.value.add(newTab)
  router.replace({
    name: 'report',
    query: { tab: newTab }
  })
})
</script>

<template>
  <div class="bg-white">
    <van-tabs class="report-tabs" v-model:active="activeTab" color="var(--color-primary-normal)"
      title-active-color="var(--color-white)" title-inactive-color="var(--color-neutral-secondary)" type="card">
      <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab" />
    </van-tabs>

    <!-- 使用 v-if 懒加载 + v-show 控制显示，每个 tab 只在第一次访问时挂载 -->
    <div class="tab-content">
      <CommissionPage v-if="visitedTabs.has(0)" v-show="activeTab === 0" />
      <FinancePage v-if="visitedTabs.has(1)" v-show="activeTab === 1" />
      <AgentPage v-if="visitedTabs.has(2)" v-show="activeTab === 2" />
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
