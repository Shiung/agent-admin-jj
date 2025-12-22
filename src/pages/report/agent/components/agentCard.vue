<script setup lang="ts">
import { computed } from 'vue'
import AgentDataCard from './agentDataCard.vue'

interface AgentData {
  username?: string
  level?: string
  date?: string  // 历史模式下显示日期
  totalProfit: number
  betAmount: number
  profitMargin: string
  firstDepositCount: number
  registerCount: number
  conversionRate: string
}

interface Props {
  agent: AgentData
  isHistoryMode?: boolean  // 是否是历史模式
}

const props = withDefaults(defineProps<Props>(), {
  isHistoryMode: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}

// 格式化总盈利显示
const formattedTotalProfit = computed(() => {
  const value = props.agent.totalProfit
  const formatted = value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString()
  return {
    value: formatted,
    highlight: value > 0,
    normal: value === 0,
    negative: value < 0
  }
})

// 卡片数据
const cardData = computed(() => [
  [
    { label: '总盈利', value: formattedTotalProfit.value.value, highlight: formattedTotalProfit.value.highlight, normal: formattedTotalProfit.value.normal, negative: formattedTotalProfit.value.negative },
    { label: '投注金额', value: props.agent.betAmount.toLocaleString() },
    { label: '盈余比例', value: props.agent.profitMargin }
  ],
  [
    { label: '首存人数', value: props.agent.firstDepositCount.toLocaleString() },
    { label: '注册人数', value: props.agent.registerCount.toLocaleString() },
    { label: '转化率', value: props.agent.conversionRate }
  ]
])
</script>

<template>
  <div class="agent-card" @click="handleClick">
    <!-- 代理信息头部 -->
    <div class="agent-header">
      <!-- 历史模式：显示日期 -->
      <div v-if="isHistoryMode" class="agent-info">
        <span class="agent-date">{{ agent.date }}</span>
      </div>

      <!-- 实时模式：显示用户名和级别 -->
      <div v-else class="agent-info">
        <span class="agent-username">{{ agent.username }}</span>
        <span class="agent-level">{{ agent.level }}</span>
      </div>

      <van-icon name="arrow" class="arrow-icon" />
    </div>

    <!-- 数据卡片 -->
    <AgentDataCard class="agent-data-card" :data="cardData" />
  </div>
</template>

<style scoped>
.agent-card {
  background: var(--color-white);
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  border: 1px solid var(--color-neutral2-seventh);
}

.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agent-username {
  font-size: 14px;
  color: var(--color-neutral-basic);
  font-weight: 600;
}

.agent-level {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

.agent-date {
  font-size: 14px;
  color: var(--color-neutral-basic);
  font-weight: 600;
}

.arrow-icon {
  color: var(--color-neutral-secondary);
  font-size: 16px;
}

/* 覆盖 AgentDataCard 的样式 */
.agent-card :deep(.agent-data-card) {
  border: none;
  padding: 0;
}
</style>
