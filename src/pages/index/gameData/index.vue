<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import API from '@/apis'
import type { CompareGameDataData } from '@/apis/codegen/data-contracts'
import { formatMoneyToK, formatSignedMoney } from '@/utils/formatNumber'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const activeTab = ref(0)
const tabs = [{ label: '月報', value: 2 }, { label: '日報', value: 1 }]

const currentMonth = computed(() => {
  if (activeTab.value === 1) return dayjs().format('YYYY-MM-DD')
  return dayjs().format('YYYY-MM')
})

const compareGameData = ref<CompareGameDataData>({
  GameData: [],
  LastPeriodGameData: [],
})

const fetchCompareGameData = async () => {
  const res = await API.admin.getCompareGameData({
    ReportType: activeTab.value,
  })
  if (res.data.Code !== 200) return
  compareGameData.value = res.data.Data
}

onMounted(() => {
  fetchCompareGameData()
})

watch(() => [activeTab.value], () => {
  fetchCompareGameData()
})

const gameDataList = computed(() => {
  return compareGameData.value.GameData.map((item) => {
    const lastItem = compareGameData.value.LastPeriodGameData.find((lastItem) => lastItem.GameType === item.GameType)
    return {
      label: gameStore.allGameTypeMapping[item.GameType] ?? item.GameType,
      last: {
        validBet: lastItem?.SumValidWater ?? 0,
        totalWinLost: lastItem?.SumWinLose ?? 0,
      },
      current: {
        validBet: item.SumValidWater ?? 0,
        totalWinLost: item.SumWinLose ?? 0,
      },
    }
  })
})

</script>

<template>
  <div>
    <div class="flex items-center justify-between bg-white px-3 py-2 pt-2 fixed top-[var(--mainFixedHeight)] left-0 z-10 w-full">
      <h2 class="text-lg font-semibold text-neutral2-basic">{{ currentMonth }}</h2>
      <!-- 日月報選擇 -->
      <div class="operation-tabs bg-white w-[7.25rem] h-10">
        <van-tabs
          v-model:active="activeTab"
          color="var(--color-primary-normal)"
          title-active-color="var(--color-white)"
          title-inactive-color="var(--color-neutral-secondary)"
          type="card"
        >
          <van-tab v-for="tab in tabs" :key="tab.value" :title="tab.label" :name="tab.value" />
        </van-tabs>
      </div>
    </div>

    <div class="w-full h-10 mb-2" />

    <!-- 预计佣金回馈 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between h-8 px-3 bg-bg-floor-1-2">
        <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">游戏名称</div>
        <div class="flex-[0.5]" />
        <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">上月</div>
        <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">本月</div>
      </div>
      <div
        v-for="(item, index) in gameDataList"
        :key="index"
        class="flex items-center justify-between h-20 mx-3 border-b border-neutral2-sixth last:border-b-0"
      >

        <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic mr-3">{{ item.label }}</div>
        <div class="flex-3 h-full flex flex-col justify-center">
          <div class="flex items-center justify-between h-full border-b border-neutral2-sixth">
            <div class="flex-[0.5] text-xs text-neutral2-tertiary">有效投注</div>
            <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">
              {{ formatMoneyToK(item.last.validBet) }}
            </div>
            <div
              class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold"
            >
              {{ formatMoneyToK(item.current.validBet) }}
            </div>
          </div>
          <div class="flex items-center justify-between h-full">
            <div class="flex-[0.5] text-xs text-neutral2-tertiary">总盈利</div>
            <div
              class="flex-1 flex items-center justify-end text-sm"
              :class="[formatSignedMoney(item.last.totalWinLost).color]"
            >
              {{ formatSignedMoney(item.last.totalWinLost).text }}
            </div>
            <div
              class="flex-1 flex items-center justify-end text-sm font-semibold"
              :class="[formatSignedMoney(item.current.totalWinLost).color]"
            >
              {{ formatSignedMoney(item.current.totalWinLost).text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.operation-tabs {
  /* 自定义 van-tabs 样式 */
  :deep(.van-tabs) {
    --van-tabs-card-height: 2.5rem;
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
    font-size: .875rem;
    font-weight: 400;
  }
}
</style>