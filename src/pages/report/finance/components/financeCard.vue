<script setup lang="ts">
import { formatSignedMoney } from '@/utils/formatNumber'
interface DataItem {
  label: string
  value: string | number
  highlight?: boolean // 是否高亮显示（红色）
  isMoney?: boolean // 是否为需要格式化的金额（带符号和颜色）
}

interface Props {
  title: string
  showArrow?: boolean
  showBackgroundColor?: boolean // 是否显示背景色
  data: DataItem[][]  // 二维数组，每行一个数组
  fontSize?: number
}

withDefaults(defineProps<Props>(), {
  showArrow: true,
  showBackgroundColor: true
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div class="finance-card" :class="{ 'no-header': !title && !showArrow }" @click="handleClick">
    <!-- 标题和箭头 -->
    <div v-if="title || showArrow" class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <van-icon v-if="showArrow" name="arrow" class="card-arrow" />
    </div>

    <!-- 数据区域 -->
    <div class="card-body">
      <div
        v-for="(row, rowIndex) in data"
        :key="rowIndex"
        class="data-row"
        :class="{
          'row-first': rowIndex === 0,
          'no-background': !showBackgroundColor
        }"
      >
        <div
          v-for="(item, colIndex) in row"
          :key="colIndex"
          class="data-item"
        >
          <span class="data-label" :style="fontSize ? { fontSize: fontSize + 'px', fontWeight: '600' } : undefined">{{ item.label }}</span>
          <span v-if="item.isMoney" :class="formatSignedMoney(item.value).color">{{ formatSignedMoney(item.value).text }}</span>
          <span v-else class="data-value" :class="{ 'highlight': item.highlight }">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-card {
  background: white;
  border-radius: 16px;
  cursor: pointer;
  padding-top: 8px;
  padding-bottom: 8px;
  border: 1px solid var(--color-neutral2-seventh);
}

.finance-card.no-header {
  padding-top: 8px;
}

/* 标题区域 */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-basic);
  margin-right: 12px;
  /* margin-top: 2px; */
}

.card-arrow {
  color: var(--color-neutral-secondary);
  margin-top: 2px;
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

.data-row.no-background {
  background-color: transparent;
}

.row-first {
  border-radius: 16px 16px 0 0;
  margin: 0 12px;
  margin-bottom: 2px;
}

.data-row:last-child {
  border-radius: 0 0 16px 16px;
  margin: 0 12px;
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
  color: var(--color-primary-normal);
  font-weight: 600;
}
</style>
