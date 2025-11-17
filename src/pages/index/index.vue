<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import API from '@/apis'
import HeaderBar from '@/components/HeaderBar/index.vue'
import CurrentPeriodCommission from './currentPeriodCommission/index.vue'
import OperationalData from './operationalData/index.vue'
import GameData from './gameData/index.vue'

// 当前激活的标签页
const activeTab = ref(0)
const tabs = ['本期佣金', '运营数据', '游戏数据']

// 当前显示的数据
const currentComponent = computed(() => {
  switch (activeTab.value) {
    case 0: return CurrentPeriodCommission
    case 1: return OperationalData
    case 2: return GameData
    default: return null
  }
})

const netcashdashboardInfoV2 = ref({
  PlayerNum: 0,
  ActivityUserNum: 0,
})

const currentMonth = computed(() => {
  if (activeTab.value === 1) return dayjs().format('YYYY-MM-DD')
  return dayjs().format('YYYY-MM')
})

const fetchNetcashdashboardInfoV2 = async () => {
  const res = await API.admin.getNetcashdashboardInfoV2({
    ReportType: activeTab.value,
    MonthDate: currentMonth.value,
    PackageId: 0,
  })
  if (res.data.Code !== 200) return
  netcashdashboardInfoV2.value = res.data.Data
}

onMounted(() => {
  fetchNetcashdashboardInfoV2()
})
</script>

<template>
  <div class="main flex flex-col">
    <!-- 头像与功能按钮行 -->
    <HeaderBar />

    <div class="bg-white fixed top-11 left-0 z-10 w-full">
      <!-- 标签页 -->
      <div class="index-tabs bg-white h-16 px-3 py-2">
        <van-tabs v-model:active="activeTab" color="var(--color-primary-normal)" title-active-color="var(--color-white)"
          title-inactive-color="var(--color-neutral-secondary)" type="card">
          <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab" />
        </van-tabs>
      </div>

      <!-- 指标数据 -->
      <div class="bg-primary-10 h-10 flex items-center justify-between gap-4 px-3 py-2">
        <div class="px-3">
          <div class="flex items-center justify-center gap-1 text-primary-normal text-sm">
            <van-image width="16" height="16" src="./static/images/index/menber.png" />
            下级会员
            <span class="font-semibold">{{ netcashdashboardInfoV2.PlayerNum }}</span>
          </div>
        </div>
        <div class="px-3">
          <div class="flex items-center justify-center gap-1 text-primary-normal text-sm">
            <van-image width="16" height="16" src="./static/images/index/menberFire.png" />
            活跃会员
            <span class="font-semibold">{{ netcashdashboardInfoV2.ActivityUserNum }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 占位符 -->
    <div class="w-full h-[7rem]" />

    <!-- 中间区块 - 数据展示 -->
    <div class="px-3 py-2">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  // header+tabs+指标数据
  --mainFixedHeight: 9.25rem;
}

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
