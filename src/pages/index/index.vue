<script setup lang="ts">
import { ref, computed } from 'vue'
import HeaderBar from '@/components/HeaderBar/index.vue'
import CurrentPeriodCommission from './currentPeriodCommission/index.vue'
import OperationalData from './operationalData/index.vue'
import GameData from './gameData/index.vue'

// 当前激活的标签页
const activeTab = ref(0)
const tabs = ['本期佣金', '运营数据', '游戏数据']

// 模拟数据 - 后续替换为 API
const subordinateMembers = ref(168)
const activeMembers = ref(89)

// 当前显示的数据
const currentComponent = computed(() => {
  switch (activeTab.value) {
    case 0: return CurrentPeriodCommission
    case 1: return OperationalData
    case 2: return GameData
    default: return null
  }
})
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- 头像与功能按钮行 -->
    <HeaderBar />

    <!-- 标签页 -->
    <div class="index-tabs bg-white h-16 px-3 py-2">
      <van-tabs
        v-model:active="activeTab"
        color="var(--color-primary-normal)"
        title-active-color="var(--color-white)"
        title-inactive-color="var(--color-neutral-secondary)"
        type="card"
      >
        <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab" />
      </van-tabs>
    </div>

    <!-- 指标数据 -->
    <div class="bg-primary-10 h-10 flex items-center justify-between gap-4 px-3 py-2">
      <div class="px-3">
        <div class="text-primary-normal text-sm">
          下级会员
          <span class="font-semibold">{{ subordinateMembers }}</span>
        </div>
      </div>
      <div class="px-3">
        <div class="text-primary-normal text-sm">
          活跃会员
          <span class="font-semibold">{{ activeMembers }}</span>
        </div>
      </div>
    </div>

    <!-- 中间区块 - 数据展示 -->
    <div class="px-3 py-2">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.index-tabs {
  /* 自定义 van-tabs 样式 */
  :deep(.van-tabs) {
    --van-tabs-card-height: 3rem;
    --van-padding-md: 0rem;
    --van-radius-sm: 6.25rem;
    .van-tabs__nav.van-tabs__nav--card {
      padding: .25rem;
      border-color: var(--color-neutral2-seventh) !important;
    }
    .van-tab--card {
      border-right: none;
    }
    .van-tab.van-tab--card.van-tab--active {
      border-radius: var(--van-radius-sm);
    }
  }

  :deep(.van-tab) {
    font-size: 15px;
    font-weight: 400;
  }
}
</style>
