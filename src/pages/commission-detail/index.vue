<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import API from '@/apis'
import type { CompareCommissionResponseData, CompareCommissionData, CommissionChildList } from '@/apis/codegen/data-contracts'
import { formatMoneyToK, formatSignedMoney, formatMoney, formatNumber } from '@/utils/formatNumber'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar/index.vue'
import InfoDialog from '@/components/InfoDialog/index.vue'

const userStore = useUserStore()

// 是否为多层代理
const isSingleAgent = computed(() => userStore.isSingleAgent)
const commissionRateParseFunction = computed(() => isSingleAgent.value ? formatNumber : formatMoney)

// 显示说明弹窗
const showInfo = ref(false)

// 当前月份
const currentMonth = computed(() => dayjs().format('YYYY-MM'))

const fetchCompareCommission = async () => {
  const res = await API.admin.getCompareCommission()
  if (res.data.Code !== 200) return

  detailData.value = res.data.Data
}

fetchCompareCommission()

const detailData = ref<CompareCommissionResponseData>({
  CurrentMonth: {} as CompareCommissionData,
  LastMonth: {} as CompareCommissionData,
})

// 预计会员佣金列表
const memberCommissionList = computed(() => {
  // 單層跟多層的key不同
  const commissionTotalKey = isSingleAgent.value ? 'CommissionTotal' : 'CommissionSelfTotal'
  return [
    { label: '会员佣金', value: { current: detailData.value.CurrentMonth[commissionTotalKey], last: detailData.value.LastMonth[commissionTotalKey] }, isSigned: false },
    { label: '净盈利', value: { current: detailData.value.CurrentMonth.CleanBetWinTotal, last: detailData.value.LastMonth.CleanBetWinTotal }, isSigned: true },
    { label: '总盈利', value: { current: detailData.value.CurrentMonth.BetWinTotal, last: detailData.value.LastMonth.BetWinTotal }, isSigned: true },
    { label: '输赢调整', value: { current: detailData.value.CurrentMonth.MoneyChangeFee, last: detailData.value.LastMonth.MoneyChangeFee }, isSigned: false },
    { label: '场馆费', value: { current: detailData.value.CurrentMonth.ApiFeeTotalFee, last: detailData.value.LastMonth.ApiFeeTotalFee }, isSigned: false },
    {
      label: '存提手续费',
      value: { current: new Big(detailData.value.CurrentMonth?.PayMoneyFee ?? 0).plus(detailData.value.CurrentMonth.WithdrawMoneyFee ?? 0).toFixed(2), last: new Big(detailData.value.LastMonth?.PayMoneyFee ?? 0).plus(detailData.value.LastMonth?.WithdrawMoneyFee ?? 0).toFixed(2) },
      isSigned: false
    },
    { label: '红利', value: { current: detailData.value.CurrentMonth.RedGoldFee, last: detailData.value.LastMonth.RedGoldFee }, isSigned: false },
    { label: '返水', value: { current: detailData.value.CurrentMonth.BackWaterGoldFee, last: detailData.value.LastMonth.BackWaterGoldFee }, isSigned: false },
    { label: '上期结余', value: { current: detailData.value.CurrentMonth.LastMonthCleanBetWinTotal, last: detailData.value.LastMonth.LastMonthCleanBetWinTotal }, isSigned: true },
    { label: '代存回馈', value: { current: detailData.value.CurrentMonth.AdminChargeMoneyFee, last: detailData.value.LastMonth.AdminChargeMoneyFee }, isSigned: false },
  ]
})

// 预计下级贡献列表
const subordinateContributionList = computed(() => {
  const result: { label: string, value: { current: string, last: string } }[] = []

  const levelMap: Record<number, string> = {
    1: '一级代理佣金',
    2: '二级代理佣金',
    3: '三级代理佣金',
    4: '四级代理佣金',
    5: '五级代理佣金',
  }

  detailData.value.CurrentMonth?.CommissionChildList?.forEach((item: CommissionChildList) => {
    const label = item.CurrentAdmin ? '代理佣金' : levelMap[item.Level] ?? ''
    result.push({ label, value: { current: formatMoneyToK(item.CommissionTotal), last: formatMoneyToK(detailData.value.LastMonth.CommissionChildList.find((lastItem: CommissionChildList) => lastItem.Level === item.Level)?.CommissionTotal ?? 0) } })
  })

  return [
    // { label: '代理佣金', value: { current: detailData.value.CurrentMonth.CommissionTotal, last: detailData.value.LastMonth.CommissionTotal } },
    ...result,
  ]
})

const commissionDetailInfo = computed(() => {
  return [
    { title: '数据更新频率：', content: '每半点（例如：00:30、01:00、01:30...）'},
    { title: '会员佣金：', content: '会员佣金 = 总盈利 - 输赢调整 - 平台费 - 存提手续费 - 返水 - 红利 + 上期结余) × 佣金比例% + 代存回馈'},
    ...(isSingleAgent.value ? [] : [{ title: '代理佣金：', content: '从下级代理获得的佣金分润。'}]),
    { title: '每月1日 - 4日进行上月的总佣金结算。', content: ''},
  ]
})
</script>

<template>
  <div class="pb-6">
    <!-- 顶部导航栏 -->
    <NavBar title="佣金详情" />

    <!-- 预计会员佣金 -->
    <div class="mt-4 px-4">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-neutral2-basic">{{ currentMonth }}</h2>
        <button @click="showInfo = true" class="p-2 rounded-full">
          <van-icon name="question-o" size="16" :style="{ fontWeight: 'bold' }" />
        </button>
      </div>

      <!-- 佣金比例 -->
      <div
        class="flex items-center justify-between h-[4.0625rem] bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-2 gap-3">
        <div class="w-[7.5rem] text-primary-normal text-sm font-semibold">佣金比例</div>
        <van-divider vertical :style="{ height: '1.25rem', color: 'var(--color-primary-10)' }" />
        <div class="flex items-center justify-center flex-1 bg-primary-5 text-primary-normal rounded-2xl p-1">
          <div class="text-2xl font-semibold">{{ commissionRateParseFunction(detailData.CurrentMonth.CommissionRate) }}</div>
          <div class="text-lg self-end font-semibold">%</div>
        </div>
      </div>

      <!-- 预计佣金回馈 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between h-8 px-3 bg-bg-floor-1-2">
          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">预计佣金回馈</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">上月</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">本月</div>
        </div>
        <div v-for="(item, index) in memberCommissionList" :key="index"
          class="flex items-center justify-between h-10 mx-3 border-b border-neutral2-sixth last:border-b-0">

          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">{{ item.label }}</div>
          <div class="flex-1 flex items-center justify-end text-sm" :class="[
            item.isSigned ? formatSignedMoney(item.value.last).color : 'text-neutral2-basic'
          ]">
            {{ item.isSigned ? formatSignedMoney(item.value.last).text : formatMoneyToK(item.value.last) }}
          </div>
          <div class="flex-1 flex items-center justify-end text-sm font-semibold" :class="[
            item.isSigned ? formatSignedMoney(item.value.current).color : 'text-neutral2-basic'
          ]">
            {{ item.isSigned ? formatSignedMoney(item.value.current).text : formatMoneyToK(item.value.current) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 预计下级贡献 -->
    <div v-if="!isSingleAgent" class="mt-6 px-4">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between h-8 px-3 bg-bg-floor-1-2">
          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">预计下级贡献</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">上月</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">本月</div>
        </div>
        <div v-for="(item, index) in subordinateContributionList" :key="index"
          class="flex items-center justify-between h-10 mx-3 border-b border-neutral2-sixth last:border-b-0">
          <div class="flex-1 flex items-center justify-start text-sm text-neutral2-basic">{{ item.label }}</div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic">
            {{ item.value.last }}
          </div>
          <div class="flex-1 flex items-center justify-end text-sm text-neutral2-basic font-semibold">
            {{ item.value.current }}
          </div>
        </div>
      </div>
    </div>

    <!-- 说明弹窗 -->
    <InfoDialog v-model:show="showInfo" title="佣金详情说明">
      <template v-for="(item, index) in commissionDetailInfo" :key="index">
        <p><strong>{{ index + 1 }}. {{ item.title }}</strong>{{ item.content }}</p>
      </template>
    </InfoDialog>
  </div>
</template>

<style scoped></style>
