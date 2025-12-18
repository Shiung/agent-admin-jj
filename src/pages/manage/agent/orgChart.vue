<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import OrgNode from './components/OrgNode.vue'
import apis from '@/apis'
import type { NetcashmultiTreeItem } from '@/apis/codegen/data-contracts'

// 層級映射
const levelMap: Record<number, string> = {
  1: '一级代理',
  2: '二级代理',
  3: '三级代理',
  4: '四级代理',
  5: '五级代理',
}

// 樹狀資料
const treeData = ref<NetcashmultiTreeItem | null>(null)
const loading = ref(true)

// 當前可見的層級
const currentVisibleLevel = ref(1)

// 顯示模式：佣金比例 or 當期總盈利
const displayMode = ref<'commission' | 'profit'>('commission')
const displayOptions = [
  { label: '佣金比例', value: 'commission' },
  { label: '当期总盈利', value: 'profit' },
]

// Refs
const tabsRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLElement | null>(null)


// 獲取樹狀資料
const fetchTreeData = async () => {
  loading.value = true
  try {
    const res = await apis.netcashmulti.getNetcashmultiTree()
    if (res.data.Code === 200) {
      treeData.value = res.data.Data.MultiAgentTree
    }
  } catch (error) {
    console.error('Failed to fetch tree data:', error)
  } finally {
    loading.value = false
  }
}
const minLevel = computed(() => {
  if (!treeData.value) return 1
  return treeData.value.AccountLevel || 1
})

// 計算最大層級
const maxLevel = computed(() => {
  if (!treeData.value) return 1
  
  const getMaxLevel = (node: NetcashmultiTreeItem, level: number): number => {
    if (!node.Children?.length) return level
    return Math.max(...node.Children.map(child => getMaxLevel(child, level + 1)))
  }
  
  return getMaxLevel(treeData.value, minLevel.value)
})

// 層級標籤
const levelTabs = computed(() => {
  const tabs = []
  for (let i = minLevel.value; i <= Math.min(maxLevel.value, 5); i++) {
    tabs.push({ id: i, title: levelMap[i] })
  }
  return tabs
})

// 是否正在程式化滾動（點擊 tab 觸發）
let isScrollingProgrammatically = false

// 滾動到指定層級
const scrollToLevel = (level: number) => {
  const chartEl = chartRef.value
  if (!chartEl) return
  
  // 先更新 active 狀態
  currentVisibleLevel.value = level
  
  // 標記正在程式化滾動，防止 scroll 事件覆蓋
  isScrollingProgrammatically = true
  
  // 找到該層級的第一個節點
  const levelNode = chartEl.querySelector(`[data-level="${level}"]`) as HTMLElement
  if (levelNode) {
    const chartRect = chartEl.getBoundingClientRect()
    const nodeRect = levelNode.getBoundingClientRect()
    const scrollLeft = nodeRect.left - chartRect.left + chartEl.scrollLeft - 16
    
    chartEl.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }
  
  // 延遲解除標記，讓滾動動畫完成
  setTimeout(() => {
    isScrollingProgrammatically = false
  }, 500)
}

// 處理圖表滾動
const handleChartScroll = () => {
  // 如果是程式化滾動（點擊 tab 觸發），跳過處理
  if (isScrollingProgrammatically) return
  
  const chartEl = chartRef.value
  if (!chartEl) return
  
  const chartRect = chartEl.getBoundingClientRect()
  
  // 找出所有帶有 data-level 的節點
  const allNodes = chartEl.querySelectorAll('[data-level]')
  
  let leftmostLevel = 5
  let leftmostPosition = Infinity
  
  allNodes.forEach(node => {
    const nodeRect = node.getBoundingClientRect()
    const level = parseInt(node.getAttribute('data-level') || '5')
    
    // 檢查節點是否在可見範圍內
    if (nodeRect.right > chartRect.left && nodeRect.left < chartRect.right) {
      // 找出最左邊的可見節點
      if (nodeRect.left < leftmostPosition) {
        leftmostPosition = nodeRect.left
        leftmostLevel = level
      }
    }
  })
  
  if (leftmostPosition !== Infinity && currentVisibleLevel.value !== leftmostLevel) {
    currentVisibleLevel.value = leftmostLevel
    scrollTabToLevel(leftmostLevel)
  }
}

// 滾動標籤到對應層級
const scrollTabToLevel = (level: number) => {
  const tabsEl = tabsRef.value
  if (!tabsEl) return
  
  const tabEl = tabsEl.querySelector(`[data-tab-level="${level}"]`) as HTMLElement
  if (tabEl) {
    const tabsRect = tabsEl.getBoundingClientRect()
    const tabRect = tabEl.getBoundingClientRect()
    
    // 如果標籤不在可見範圍內，滾動到它
    if (tabRect.left < tabsRect.left || tabRect.right > tabsRect.right) {
      const scrollLeft = tabRect.left - tabsRect.left + tabsEl.scrollLeft - tabsRect.width / 2 + tabRect.width / 2
      tabsEl.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
  }
}

onMounted(() => {
  fetchTreeData()
})
</script>

<template>
  <div class="org-chart-page">
    <NavBar title="代理组织图" />
    
    <!-- 層級標籤 -->
    <div class="level-tabs" ref="tabsRef">
      <div 
        v-for="tab in levelTabs" 
        :key="tab.id"
        :data-tab-level="tab.id"
        :class="['level-tab', { 'is-active': currentVisibleLevel === tab.id }]"
        @click="scrollToLevel(tab.id)"
      >
        {{ tab.title }}
      </div>
    </div>
    
    <!-- 顯示模式下拉選單 -->
    <div class="filter-row">
      <Dropdown 
        v-model="displayMode" 
        :options="displayOptions" 
        placeholder="佣金比例"
      />
    </div>
    
    <!-- 組織圖 -->
    <div 
      v-if="loading" 
      class="loading-container"
    >
      <van-loading size="24px">加载中...</van-loading>
    </div>
    
    <div 
      v-else-if="treeData"
      class="org-chart-container" 
      ref="chartRef"
      @scroll="handleChartScroll"
    >
      <div class="tree-wrapper">
        <OrgNode :node="treeData" :level="1" :display-mode="displayMode" is-root />
      </div>
    </div>
    
    <div v-else class="empty-container">
      <empty />
    </div>
  </div>
</template>

<style scoped>
.org-chart-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-white);
}

.level-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.level-tabs::-webkit-scrollbar {
  display: none;
}

.level-tab {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-neutral2-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.level-tab.is-active {
  color: var(--color-primary-normal);
  font-weight: 500;
}

.filter-row {
  padding: 0.75rem 1rem;
}

.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.org-chart-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 1rem;
}

.tree-wrapper {
  display: inline-flex;
  min-width: max-content;
}
</style>