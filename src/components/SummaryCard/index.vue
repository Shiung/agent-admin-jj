<script setup lang="ts">
import { computed } from 'vue'
import { formatMoneyWithCommas, formatSignedMoney } from '@/utils/formatNumber'

interface Props {
  label: string // 标签文字（如：代存金额总计、总盈利）
  value: number // 数值（分）
  icon?: string // 可选的装饰图标路径
  colorType?: 'primary' | 'signed' // 颜色类型：primary=固定主色，signed=根据正负值
}

const props = withDefaults(defineProps<Props>(), {
  colorType: 'primary'
})

// 格式化显示数据
const formattedData = computed(() => {
  if (props.colorType === 'signed') {
    // 使用带符号的金额格式化（根据正负值显示颜色和符号）
    return formatSignedMoney(props.value)
  } else {
    // 使用普通金额格式化（固定主色）
    return {
      text: formatMoneyWithCommas(props.value, 2, true),
      color: 'text-primary-normal'
    }
  }
})

// 最终显示的文本
const displayText = computed(() => formattedData.value.text)

// 最终显示的颜色
const displayColor = computed(() => formattedData.value.color)
</script>

<template>
  <div class="summary-card">
    <div class="summary-content">
      <!-- 左侧：标题和金额 -->
      <div class="summary-info">
        <span class="summary-label">{{ label }}</span>
        <span class="summary-value" :class="displayColor">{{ displayText }}</span>
      </div>

      <!-- 右侧：装饰图标（可选） -->
      <div v-if="icon" class="summary-icon">
        <img :src="icon" :alt="label" class="h-[76px] w-[124px]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-card {
  padding: 4px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: -0.5px 0.5px 3px 0px rgba(0, 0, 0, 0.15);
}

.summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.summary-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral2-basic);
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
}

.summary-icon {
  position: relative;
}

.summary-icon img {
  height: 76px;
  width: 124px;
}
</style>
