<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatMoneyWithCommas } from '@/utils/formatNumber'

interface Props {
  total: number
  isSingleAgent?: boolean // 是否为单层代理
}

const props = withDefaults(defineProps<Props>(), {
  isSingleAgent: false
})

// 格式化金额显示（除以100，带千分位，去除尾数0）
const formattedTotal = computed(() => {
  return formatMoneyWithCommas(props.total, 2, true)
})

// 控制说明弹窗显示
const showInfoSheet = ref(false)

const openInfoSheet = () => {
  showInfoSheet.value = true
}

const closeInfoSheet = () => {
  showInfoSheet.value = false
}
</script>

<template>
  <div class="bg-white rounded-2xl px-4 py-1 shadow-sm">
    <div class="flex items-center justify-between">
      <!-- 左侧：标题和金额 -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <span class="text-neutral-secondary text-sm">佣金总计</span>
          <button @click="openInfoSheet" class="flex items-center justify-center w-4 h-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1" fill="none" class="text-neutral-secondary" />
              <text x="8" y="11.5" font-size="10" text-anchor="middle" fill="currentColor" class="text-neutral-secondary" font-weight="500">?</text>
            </svg>
          </button>
        </div>
        <span class="text-primary-normal text-2xl font-semibold">{{ formattedTotal }}</span>
      </div>

      <!-- 右侧：装饰图标 -->
      <div class="relative">
        <img src="/static/images/common/commissionWalletIcon.png" alt="佣金总计"
          class="h-[76px] w-[124px]" />
      </div>
    </div>
  </div>

  <!-- 佣金总计说明弹窗 -->
  <van-popup
    v-model:show="showInfoSheet"
    position="bottom"
    round
    :overlay="true"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
    :close-on-click-overlay="true"
    :safe-area-inset-bottom="true"
    teleport="body"
    :z-index="9999"
  >
    <div class="commission-info-sheet">
      <!-- 顶部指示器 -->
      <div class="sheet-indicator"></div>

      <!-- 标题栏 -->
      <div class="sheet-header">
        <div class="header-left">
        <h3 class="sheet-title">佣金总计</h3>
        </div>
        <button @click="closeInfoSheet" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="sheet-content">
        <ul class="formula-list">
          <!-- 数据更新频率 -->
          <li class="formula-item">
            数据更新频率：每半点（例如：00:30、01:00、01:30...）
          </li>

          <!-- 多层代理：包含下级贡献 -->
          <template v-if="!isSingleAgent">
            <li class="formula-item">
              当期佣金 ＝ (总盈利 - 输赢调整 - 场馆费 - 存提手续费 - 返水 - 红利 + 上期结余) × 佣金比例% + 代存回馈 + 下级贡献
            </li>
            <li class="formula-item">
              净盈利 ＝ 总营利 - 输赢调整 - 场馆费 - 存提手续费 - 返水 - 红利
            </li>
            <li class="formula-item">
              冲正后净盈利 ＝ 净盈利 + 上期结余
            </li>
            <li class="formula-item">
              自身佣金 ＝ 冲正后净盈利 × 佣金比例% + 代存回馈
            </li>
            <li class="formula-item">
              下级贡献 ＝ (下级的净盈利 + 下级上期结余) × (自身佣金比例% - 下一级佣金比例%)
            </li>
          </template>

          <!-- 单层代理/团队：不包含下级贡献 -->
          <template v-else>
            <li class="formula-item">
              当期佣金 ＝ (总盈利 - 输赢调整 - 场馆费 - 存提手续费 - 返水 - 红利 + 上期结余) × 佣金比例% + 代存回馈
            </li>
            <li class="formula-item">
              净盈利 ＝ 总营利 - 输赢调整 - 场馆费 - 存提手续费 - 返水 - 红利
            </li>
            <li class="formula-item">
              冲正后净盈利 ＝ 净盈利 + 上期结余
            </li>
            <li class="formula-item">
              自身佣金 ＝ 冲正后净盈利 × 佣金比例% + 代存回馈
            </li>
          </template>
        </ul>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.shadow-sm {
  box-shadow: -0.5px 0.5px 3px 0px rgba(0, 0, 0, 0.15);
}

/* 佣金总计说明弹窗样式 */
.commission-info-sheet {
  padding: 12px 16px 24px;
  background: white;
}

/* 頂部指示器 */
.sheet-indicator {
  width: 22px;
  height: 4px;
  background-color: #1D27561A;
  border-radius: 2px;

  margin: 0 auto;  /* 水平置中 */
  margin-top: -6px;
  margin-bottom: 6px; /* 與標題區保持距離 */
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 16px;
}

/* 左側占位，讓 title 可以真正置中 */
.header-left {
  width: 24px; /* 跟 close-btn 寬度相同即可 */
  height: 24px;
}

/* Title 自動置中 */
.sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2756E5;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #1D2756B2;
  cursor: pointer;
}

/* 左側占位，讓 title 可以真正置中 */
.header-left {
  width: 24px; /* 跟 close-btn 寬度相同即可 */
  height: 24px;
}

/* Title 自動置中 */
.sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2756E5;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #1D2756B2;
  cursor: pointer;
}

/* 内容区域 */
.sheet-content {
  padding: 0;
}

.formula-list {
  list-style: none;
  padding: 0;
  margin: 40px 0px 20px 0px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.formula-item {
  display: flex;              /* 像 list-item，方便控制對齊 */
  align-items: flex-start;    /* 對齊第一行文字 */
  gap: 8px;                   /* 圓點與文字間距 */
  font-size: 14px;
  line-height: 1.6;
  color: #1D2756B2;
}

.formula-item::before {
  content: '•';
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: x-large;         /* 你要的尺寸 */
  line-height: 1;             /* 避免上下溢出 */
  width: 10px;                 /* 正方形空間，適合垂直置中 */
  height: 20px;
  color: #1D2756B2;
}

</style>
