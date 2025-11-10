<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import API from '@/apis'
import type { NetcashdashboardInfoV2Data } from '@/apis/codegen/data-contracts'
import { formatNumberToK, formatMoneyToK, formatSignedMoney } from '@/utils/formatNumber'
import { useGlobalStore } from '@/stores/global'
import Dropdown from '@/components/Dropdown/index.vue'

const globalStore = useGlobalStore()

const activeTab = ref(0)
const tabs = [{ label: '月報', value: 2 }, { label: '日報', value: 1 }]
// 显示说明弹窗
const showInfo = ref(false)

const currentMonth = computed(() => {
  if (activeTab.value === 1) return dayjs().format('YYYY-MM-DD')
  return dayjs().format('YYYY-MM')
})

const options = computed(() => globalStore.configInfo?.RealPackageIdNameMap.map((pkg) => ({
  label: pkg.PackageName,
  value: pkg.PackageId,
})) || [])

const selectedPackageId = ref(1)

const netcashdashboardInfoV2 = ref<NetcashdashboardInfoV2Data>({
  PlayerNum: 0,
  ActivityUserNum: 0,
  LastMonthTotal: {
    SumNewRegNum: 0,
    SumPayNum: 0,
    SumWithdrawNum: 0,
    SumNewPayMoney: 0,
    SumPayMoney: 0,
    SumWithdrawMoney: 0,
    SumFirstPayNum: 0,
    SumBetGameNum: 0,
    SumGoodBetGameMoney: 0,
    SumFirstPayMoney: 0,
    SumBetGameMoney: 0,
    SumWinLostMoney: 0,
    SumAgentCustomerPayMoney: 0,
    SumAgentCustomerPayNum: 0,
  },
  MonthTotal: {
    SumNewRegNum: 0,
    SumPayNum: 0,
    SumWithdrawNum: 0,
    SumNewPayMoney: 0,
    SumPayMoney: 0,
    SumWithdrawMoney: 0,
    SumFirstPayNum: 0,
    SumBetGameNum: 0,
    SumGoodBetGameMoney: 0,
    SumFirstPayMoney: 0,
    SumBetGameMoney: 0,
    SumWinLostMoney: 0,
    SumAgentCustomerPayMoney: 0,
    SumAgentCustomerPayNum: 0,
  },
})

const fetchNetcashdashboardInfoV2 = async () => {
  const res = await API.admin.getNetcashdashboardInfoV2({
    ReportType: activeTab.value,
    MonthDate: currentMonth.value,
    PackageId: selectedPackageId.value,
  })
  if (res.data.Code !== 200) return
  netcashdashboardInfoV2.value = res.data.Data
}

onMounted(() => {
  fetchNetcashdashboardInfoV2()
})

watch(() => [currentMonth.value, selectedPackageId.value], () => {
  fetchNetcashdashboardInfoV2()
})

const showInfoData = computed(() => {
  const totalWinLostMoney = formatSignedMoney(netcashdashboardInfoV2.value.MonthTotal.SumWinLostMoney)
  return [
    [{ label: '有效投注', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumGoodBetGameMoney), barClass: 'bg-primary-normal' }, { label: '总盈利', value: totalWinLostMoney.text, barClass: totalWinLostMoney.color}],
    [{ label: '注册人数', value: formatNumberToK(netcashdashboardInfoV2.value.MonthTotal.SumNewRegNum), barClass: 'bg-success-normal' }, { label: '新会员充值金额', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumNewPayMoney), barClass: 'bg-success-normal' }],
    [{ label: '充值人数', value: formatNumberToK(netcashdashboardInfoV2.value.MonthTotal.SumPayNum), barClass: 'bg-warning-normal' }, { label: '充值金额', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumPayMoney), barClass: 'bg-warning-normal' }],
    [{ label: '提现人数', value: formatNumberToK(netcashdashboardInfoV2.value.MonthTotal.SumWithdrawNum), barClass: 'bg-error-normal' }, { label: '提现金额', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumWithdrawMoney), barClass: 'bg-error-normal' }],
    [{ label: '首存人数', value: formatNumberToK(netcashdashboardInfoV2.value.MonthTotal.SumFirstPayNum), barClass: 'bg-fixed-lightBlue' }, { label: '首存金额', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumFirstPayMoney), barClass: 'bg-fixed-lightBlue' }],
    [{ label: '代存人数', value: formatNumberToK(netcashdashboardInfoV2.value.MonthTotal.SumAgentCustomerPayNum), barClass: 'bg-fixed-purple' }, { label: '代存金额', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumAgentCustomerPayMoney), barClass: 'bg-fixed-purple' }],
    [{ label: '投注人数', value: formatNumberToK(netcashdashboardInfoV2.value.MonthTotal.SumBetGameNum), barClass: 'bg-fixed-pink' }, { label: '投注金额', value: formatMoneyToK(netcashdashboardInfoV2.value.MonthTotal.SumBetGameMoney), barClass: 'bg-fixed-pink' }],
  ]
})

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <Dropdown class="flex-1 h-10 mr-2" v-model="selectedPackageId" :options="options" height="2.5rem" />
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
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-neutral2-basic">{{ currentMonth }}</h2>
      <button @click="showInfo = true" class="p-2 rounded-full">
        <van-icon name="question-o" size="16" :style="{ fontWeight: 'bold' }" />
      </button>
    </div>

    <div v-for="(infoRow, rowIdx) in showInfoData" :key="rowIdx" class="flex items-center justify-between bg-bg-floor-1-2 rounded-2xl h-[4.25rem] mb-2">
      <div v-for="(info, infoIdx) in infoRow" :key="infoIdx" class="flex flex-col items-center justify-center px-3 py-2 flex-1">
        <div class="flex items-center justify-center gap-1">
          <div :class="info.barClass" class="w-[.125rem] h-2 rounded-full" />
          <div class="text-sm text-neutral2-secondary">{{ info.label }}</div>
        </div>
        <div class="text-lg font-semibold text-neutral2-basic">{{ info.value }}</div>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-neutral2-basic">历史数据</h2>
      <div class="flex items-center justify-between">
        <div class="text-sm text-neutral2-secondary">1</div>
        <div class="text-sm text-neutral2-secondary">2</div>
      </div>
    </div>

    <!-- 说明弹窗 -->
    <InfoDialog v-model:show="showInfo" title="运营数据说明">
      <p><strong>1. 数据更新频率：</strong>每10分钟</p>
      <p><strong>2. 总盈利：</strong>会员投注产生的公司盈亏。</p>
      <p><strong>3. 新会员充值金额：</strong>所选时间内注册会员充值的金额。</p>
      <p><strong>4.</strong>红色正数代表公司盈利，绿色负数代表公司成本。</p>
    </InfoDialog>
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