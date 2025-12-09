<script setup lang="ts">
import { computed } from 'vue'
import type { NetcashmultiTreeItem } from '@/apis/codegen/data-contracts'
import { formatMoney } from '@/utils/formatNumber'

const props = defineProps<{
  node: NetcashmultiTreeItem
  level: number
  displayMode: 'commission' | 'profit'
  isRoot?: boolean
}>()

const emit = defineEmits<{
  nodeVisible: [level: number, visible: boolean]
}>()

// 顯示的數值
const displayValue = computed(() => {
  if (props.displayMode === 'commission') {
    return `${formatMoney(props.node.CommissionRate)}%`
  } else {
    return formatMoney(props.node.SumWinLose)
  }
})

// 是否為根節點（一級代理）
const isRootNode = computed(() => props.isRoot || props.level === 1)
</script>

<template>
  <div class="org-node" :class="{ 'is-root': isRootNode }">
    <!-- 節點卡片 -->
    <div 
      class="node-card" 
      :class="{ 'root-card': isRootNode, 'child-card': !isRootNode }"
      :data-level="level"
    >
      <div class="avatar">
        <img src="/static/images/avatar.png" alt="avatar" />
      </div>
      <div class="info">
        <div class="username">{{ node.Username }}</div>
        <div class="value">{{ displayValue }}</div>
      </div>
    </div>
    
    <!-- 子節點區域 -->
    <div v-if="node.Children?.length" class="children-wrapper">
      <!-- 從父節點到垂直線的水平連接線 -->
      <div class="connector-from-parent"></div>
      <!-- 垂直連接線容器 -->
      <div v-if="node.Children.length > 1" class="vertical-line-container">
        <div class="vertical-line"></div>
      </div>
      <div class="children">
        <div 
          v-for="(child, index) in node.Children" 
          :key="child.AdminId"
          class="child-row"
          :class="{
            'is-first': index === 0,
            'is-last': index === node.Children.length - 1,
            'is-only': node.Children.length === 1
          }"
        >
          <OrgNode 
            :node="child" 
            :level="level + 1"
            :display-mode="displayMode"
            :is-root="false"
            @node-visible="(l, v) => emit('nodeVisible', l, v)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.org-node {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

/* 根節點卡片樣式 (一級代理) */
.root-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 7.5rem;
  min-height: 8rem;
  padding: 1rem;
  background: var(--color-bg-floor-1-2);
  border-radius: 0.75rem;
  border: 1px solid var(--color-primary-normal);
  flex-shrink: 0;
}

.root-card .avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 0.5rem;
  background: white;
}

.root-card .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.root-card .info {
  text-align: center;
}

.root-card .username {
  font-size: 0.875rem;
  color: var(--color-neutral2-basic);
  font-weight: 600;
  white-space: nowrap;
}

.root-card .value {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

/* 子節點卡片樣式 (二級代理及以上) */
.child-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  height: 3.25rem;
  min-width: 9.25rem;
  padding: .25rem .5rem;
  background: var(--color-bg-floor-1-2);
  border-radius: 1rem;
  flex-shrink: 0;
}

.child-card .avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.child-card .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.child-card .info {
  text-align: left;
}

.child-card .username {
  font-size: 0.75rem;
  color: var(--color-neutral2-basic);
  font-weight: 600;
  white-space: nowrap;
}

.child-card .value {
  font-size: 0.75rem;
  color: var(--color-neutral2-secondary);
  margin-top: 0.125rem;
}

/* 子節點包裝器 */
.children-wrapper {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-left: 0;
  position: relative;
}

/* 從父節點到垂直線的水平連接線 */
.connector-from-parent {
  width: 1.5rem;
  height: 1px;
  background: var(--color-neutral2-sixth);
  flex-shrink: 0;
  /* 讓水平線對齊第一個子節點的中心位置 */
  margin-top: 1.75rem;
}

/* 垂直線容器 */
.vertical-line-container {
  position: relative;
  width: 1px;
  flex-shrink: 0;
  align-self: stretch;
}

/* 垂直線 - 從第一個子節點中心連到最後一個子節點中心 */
.vertical-line {
  position: absolute;
  left: 0;
  top: 1.75rem;
  bottom: 1.5rem;
  width: 1px;
  background: var(--color-neutral2-sixth);
}

.children {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 每個子節點行 */
.child-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

/* 水平連接線 - 從垂直線到子節點卡片 */
.child-row::before {
  content: '';
  width: 1rem;
  height: 1px;
  background: var(--color-neutral2-sixth);
  flex-shrink: 0;
  margin-top: 1.75rem;
}
</style>
