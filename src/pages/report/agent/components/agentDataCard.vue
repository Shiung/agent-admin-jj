<script setup lang="ts">
import { ref } from 'vue'

interface DataItem {
  label: string
  value: string | number
  highlight?: boolean
}

interface Props {
  title?: string
  date?: string
  showReportTabs?: boolean  // 是否显示月报/日报 tab
  data: DataItem[][]
}

withDefaults(defineProps<Props>(), {
  title: '',
  date: '',
  showReportTabs: false
})

// 月报/日报切换
const reportType = ref(0)  // 0: 月报, 1: 日报
</script>

<template>
  <div class="agent-data-card">
    <!-- 标题和日期/Tab -->
    <div v-if="title || date || showReportTabs" class="card-header">
      <span class="card-title">{{ title }}</span>

      <!-- 历史数据：显示月报/日报 tab -->
      <div v-if="showReportTabs" class="report-tabs">
        <van-tabs
          v-model:active="reportType"
          color="var(--color-primary-normal)"
          title-active-color="var(--color-white)"
          title-inactive-color="var(--color-neutral-secondary)"
          type="card"
        >
          <van-tab :title="'月报'" :name="0" />
          <van-tab :title="'日报'" :name="1" />
        </van-tabs>
      </div>

      <!-- 实时数据：显示日期 -->
      <span v-else class="card-date">{{ date }}</span>
    </div>

    <!-- 数据区域 -->
    <div class="card-body">
      <div
        v-for="(row, rowIndex) in data"
        :key="rowIndex"
        class="data-row"
        :class="{ 'row-first': rowIndex === 0 }"
      >
        <div
          v-for="(item, colIndex) in row"
          :key="colIndex"
          class="data-item"
        >
          <span class="data-label">{{ item.label }}</span>
          <span class="data-value" :class="{ 'highlight': item.highlight }">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-data-card {
  background: white;
  border-radius: 16px;
  padding: 12px;
  border: 1px solid var(--color-neutral2-seventh);
}

/* 标题区域 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-basic);
}

.card-date {
  font-size: 14px;
  color: var(--color-neutral-secondary);
}

/* 数据区域 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.data-row {
  display: flex;
  background-color: var(--color-bg-floor-1-2);
  height: 52px;
}

.row-first {
  border-radius: 16px 16px 0 0;
  margin-bottom: 2px;
}

.data-row:last-child {
  border-radius: 0 0 16px 16px;
}

.data-row:only-child {
  border-radius: 16px;
}

.data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.data-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
  font-weight: 400;
}

.data-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-basic);
}

.data-value.highlight {
  color: var(--color-error-normal);
  font-weight: 600;
}

/* 月报/日报 tab */
.report-tabs {
  width: 5.5rem;

  --van-tabs-card-height: 28px;
  --van-padding-md: 0rem;
  --van-radius-sm: 6.25rem;

  :deep(.van-tabs) {
    overflow: visible !important;
  }

  :deep(.van-tabs__wrap) {
    overflow: visible !important;
  }

  :deep(.van-tabs__nav) {
    overflow: visible !important;
  }

  :deep(.van-tabs__nav.van-tabs__nav--card) {
    padding: 0.125rem;
    border: 1px solid var(--color-neutral2-seventh) !important;
    background: white;
    overflow: visible !important;
  }

  :deep(.van-tab--card) {
    border: none !important;
  }

  :deep(.van-tab.van-tab--card.van-tab--active) {
    border-radius: var(--van-radius-sm);
  }

  :deep(.van-tab) {
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
