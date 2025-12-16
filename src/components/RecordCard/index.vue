<script setup lang="ts">
// 详细信息项
interface DetailItem {
  label: string
  value: string | number
  showCopy?: boolean // 是否显示复制按钮（用于订单号）
  highlight?: boolean // 是否高亮显示（用于金额）
  multiline?: boolean // 是否多行显示（用于备注）
}

// 时间信息项
interface TimeItem {
  label: string
  value: string
}

interface Props {
  // 头部信息
  headerTitle: string // 主标题（会员账号、代理账号等）
  headerSubtitle?: string // 副标题（VIP等级等）
  // 详细信息列表
  details: DetailItem[]
  // 时间信息列表（可选，1-2项）
  times?: TimeItem[]
  // 是否可点击
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

// 复制文本
const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  showToast({
    message: '复制成功',
    position: 'middle',
    zIndex: 10000,
  })
}
</script>

<template>
  <div
    class="record-card"
    :class="{ 'clickable': clickable }"
    @click="handleClick"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-info">
        <span class="header-title">{{ headerTitle }}</span>
        <span v-if="headerSubtitle" class="header-subtitle">{{ headerSubtitle }}</span>
      </div>
    </div>

    <!-- 内层白色表格 -->
    <div class="card-inner">
      <!-- 详细信息列表 -->
      <ul class="detail-list">
        <li
          v-for="(detail, index) in details"
          :key="index"
          class="detail-item"
        >
          <span class="detail-label">{{ detail.label }}</span>
          <div class="detail-value-wrapper" :class="{ 'multiline': detail.multiline }">
            <span
              class="detail-value"
              :class="{
                'highlight': detail.highlight,
                'multiline-text': detail.multiline
              }"
            >
              {{ detail.value }}
            </span>
            <van-image
              v-if="detail.showCopy"
              width="12"
              height="12"
              src="/static/images/common/copy.png"
              @click.stop="copyText(String(detail.value))"
              style="cursor: pointer;"
            />
          </div>
        </li>
      </ul>
    </div>

    <!-- 时间信息（可选） -->
    <div v-if="times && times.length > 0" class="time-section">
      <div
        v-for="(time, index) in times"
        :key="index"
        class="time-row"
      >
        <span class="time-label">{{ time.label }}</span>
        <span class="time-value">{{ time.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 外层灰色容器 */
.record-card {
  position: relative;
  background: var(--color-bg-floor-1-2);
  border-radius: 16px;
  padding: 12px;
  overflow: visible;
}

.record-card.clickable {
  cursor: pointer;
}

/* 内层白色表格 */
.card-inner {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 14px;
  color: var(--color-neutral-basic);
  font-weight: 600;
}

.header-subtitle {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

/* 详细信息列表 */
.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

/* 使用伪元素创建带左右间距的分隔线 */
.detail-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background-color: var(--color-neutral2-sixth);
}

.detail-item:last-child::after {
  display: none;
}

.detail-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-neutral-basic);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-value.highlight {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-primary-normal);
}

/* 多行文本（备注） */
.detail-value.multiline-text {
  white-space: pre-wrap;
  word-break: break-word;
  overflow: visible;
  text-overflow: unset;
}

.detail-value-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 70%;
}

/* 多行容器 */
.detail-value-wrapper.multiline {
  max-width: 70%;
  align-items: flex-start;
}

/* 时间区域 */
.time-section {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-label {
  font-size: 12px;
  color: var(--color-neutral-secondary);
}

.time-value {
  font-size: 14px;
  color: var(--color-neutral-basic);
}
</style>
