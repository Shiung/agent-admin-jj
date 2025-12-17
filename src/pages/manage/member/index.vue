<script setup lang="ts">
import { computed, defineComponent, ref, h, onMounted, watch } from 'vue'
import UnitCard from '../components/UnitCard.vue'
import type AdvancedBottomSheet from '@/components/AdvancedBottomSheet/index.vue'
import { useRouter } from 'vue-router'
import type SearchBar from '@/components/SearchBar/index.vue'

import { useClipboard } from '@vueuse/core'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'
import { cn } from '@/utils/className'
import API from '@/apis'
import dayjs from 'dayjs'
import { formatSignedMoney, formatNumber, formatMoney } from '@/utils/formatNumber'
import type TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'

const advanceKeyMap = {
  RegTime: 'RegTime',
  activeMember: 'ActiveMemberType',
  bindCard: 'BindCard',
  bindPhone: 'BindPhone',
  packageId: 'PackageId',
  vipLevels: 'VipLevels'
}

const userStore = useUserStore()
const { commissionWalletBalance, creditWalletBalance, depositLimitInfo } = storeToRefs(userStore)
const router = useRouter()
const infinityRef = ref<InfinityExposeType>()

const defaultVipSelector = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// const itemLs = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerListv2>>['data']['Data']['Items']>([])
const totalInfo = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerListv2>>['data']['Data']['Total'] | null>(null)
const pageInfo = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerListv2>>['data']['Data']['Pagination'] | null>(null)

const showAdvanced = ref<boolean>(false)

const regTime = ref<{ startTime: number; endTime: number } | null>(null)
const activeMemberType = ref<0 | 1 | 2 | null>(null)
const bindCard = ref<0 | 1 | 2 | null>(null)
const bindPhone = ref<0 | 1 | 2 | null>(null)
const packageId = ref<number | null>(null)
const vipLevels = ref<Array<number>>(defaultVipSelector)

const selectTime = ref<InstanceType<typeof TimeFilterDropdown>['modelValue']>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix()
})

const sortOptions = ref([
  { value: '-CreateTime', label: '注册时间降序' },
  { value: 'CreateTime', label: '注册时间升序' },
  { value: '-LastTime', label: '最后登录时间降序' },
  { value: 'LastTime', label: '最后登录时间升序' },
  { value: '-WinLose', label: '盈利降序' },
  { value: 'WinLose', label: '盈利升序' },
])

const selectedSort = ref(sortOptions.value[0]?.value ?? '-CreateTime')

const info = computed(() => ([
  { title: '总会员数', amount: formatNumber(pageInfo.value?.MaxCount ?? 0) },
  { title: '总充值', amount: formatMoney(totalInfo.value?.TotalRecharged ?? 0, 2, true) },
  { title: '总代存', amount: formatMoney(totalInfo.value?.TotalAgentApplyGold ?? 0, 2, true) },
]))

const searchLsLoading = ref<boolean>(false)
const searchSelected = ref<InstanceType<typeof SearchBar>['$props']['selected']>(null)
const searchLs = ref<Array<{ id: number, text: string }>>([])

const showDate = (ts: number | string | null) => {
  if (!ts) return null
  const num = Number(ts)
  if (isNaN(num)) return null
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const ShowNumber = defineComponent(
  (props : { formatNum: { color: string; text: string }, useColor?: boolean }, { attrs }) => {
    return () => h('div', { class: cn(attrs?.class ?? '', props.useColor !== undefined && props.formatNum?.color)}, props.formatNum?.text)
  }, {
    props: ['formatNum', 'useColor']
  }
)

const searchPlayerLs = async () => {
  try {
    searchLsLoading.value = true
    const res = await API.playerManage.getPlayerSearch({})
    searchLs.value = (res.data.Data.Items ?? []).map((i) => ({ id: i.PlayerId, text: i.LoginAccount }))
  } catch (e) {
    console.warn('[searchPlayerLs error]:', e)
  } finally {
    searchLsLoading.value = false
  }
}

const fetchData = async (page: number = 0) => {
  try {
    const res = await API.playerManage.getPlayerListv2({
      ReportTimeBegin: selectTime.value.startTime,
      ReportTimeEnd: selectTime.value.endTime,
      PageSize: 20,
      Sort: selectedSort.value,
      Page: page,
      ...(searchSelected.value && { PlayerId: Number(searchSelected.value.id) }),
      ...(regTime.value && { RegTimeBegin: regTime.value.startTime, RegTimeEnd: regTime.value.endTime }),
      ...(activeMemberType.value && { ActiveMemberType: activeMemberType.value }),
      ...(bindCard.value && { BindCard: bindCard.value }),
      ...(bindPhone.value && { BindPhone: bindPhone.value }),
      ...(packageId.value && { PackageId: packageId.value }),
      ...(vipLevels.value.length > 0 && { VipLevels: vipLevels.value.join() })
    })

    // itemLs.value = res.data.Data.Items
    totalInfo.value = res.data.Data.Total
    pageInfo.value = res.data.Data.Pagination

    return {
      data: res.data.Data.Items,
      paging: res.data.Data.Pagination
    }
  } catch (e) {
    console.warn('fetchTest outside', e)
    return { data: [], paging: null }
  }
}

const advancedLs = computed<InstanceType<typeof AdvancedBottomSheet>['$props']['ls']>(() => {
  const productLs = userStore.productPackages
  const { phone, card } = userStore.playerInfoPermission
  return [
    { key: advanceKeyMap.RegTime, title: '注册时间', type: 'time', timeDisableTimeRange: true },
    {
      key: advanceKeyMap.packageId,
      title: '产品包',
      type: 'radio',
      list: [
        { label: '全部', value: '' },
        ...productLs.map((p) => ({
          label: p.PackageName,
          value: p.PackageId
        }))
      ],
    },
    {
      key: advanceKeyMap.activeMember,
      title: '活跃会员',
      type: 'radio',
      list: [
        { label: '全部', value: '' },
        { label: '是', value: 1 },
        { label: '否', value: 2 }
      ],
    },
    {
      key: advanceKeyMap.bindCard,
      title: '银行卡绑定',
      type: 'radio',
      list: [
        { label: '全部', value: '' },
        { label: '是', value: 1 },
        { label: '否', value: 2 }
      ],
    },
    {
      key: advanceKeyMap.bindPhone,
      title: '手机号绑定',
      type: 'radio',
      list: [
        { label: '全部', value: '' },
        { label: '是', value: 1 },
        { label: '否', value: 2 }
      ],
    },
    {
      key: advanceKeyMap.vipLevels,
      title: 'VIP等级',
      type: 'checkbox',
      list: [
        { label: 'VIP0', value: 0 },
        { label: 'VIP1', value: 1 },
        { label: 'VIP2', value: 2 },
        { label: 'VIP3', value: 3 },
        { label: 'VIP4', value: 4 },
        { label: 'VIP5', value: 5 },
        { label: 'VIP6', value: 6 },
        { label: 'VIP7', value: 7 },
        { label: 'VIP8', value: 8 },
        { label: 'VIP9', value: 9 },
        { label: 'VIP10', value: 10 },
      ],
      defaultSelected: defaultVipSelector
    },
  ].filter((l) => {
    if (l.key === advanceKeyMap.bindPhone && !phone) return false
    if (l.key === advanceKeyMap.bindCard && !card) return false
    return true
  }) as InstanceType<typeof AdvancedBottomSheet>['$props']['ls']
})

const advancedHandler = (ls: Map<string, any>) => {
  advancedLs.value.forEach((l) => {
    const getVal = ls.get(l.key)
    switch (l.key) {
      case advanceKeyMap.RegTime: {
        regTime.value = getVal ? { startTime: getVal.startTime, endTime: getVal.endTime } : null
        break
      }
      case advanceKeyMap.packageId: {
        packageId.value = getVal
        break
      }
      case advanceKeyMap.activeMember: {
        activeMemberType.value = getVal
        break
      }
      case advanceKeyMap.bindCard: {
        bindCard.value = getVal
        break
      }
      case advanceKeyMap.bindPhone: {
        bindPhone.value = getVal
        break
      }
      case advanceKeyMap.vipLevels: {
        vipLevels.value = getVal
        break
      }
    }
  })
}

const copyHadandler = (c: string) => {
  useClipboard().copy(c)
  showToast({ message: '复制成功' })
}


const handleGoToDeposit = (member: any) => {
  // 从 store 获取数据
  const query: Record<string, any> = {
    commission: String(commissionWalletBalance.value),
    credit: String(creditWalletBalance.value),
    memberAccount: member.LoginAccount,
    packageName: member.PackageName
  }

  if (depositLimitInfo.value) {
    query.minAmount = String(depositLimitInfo.value.minAmount)
    query.maxAmount = String(depositLimitInfo.value.maxAmount)
    query.dailyAmount = String(depositLimitInfo.value.dailyAmount)
    query.maxWithdrawMultiple = String(depositLimitInfo.value.maxWithdrawMultiple)
    query.isActive = String(depositLimitInfo.value.isActive)
    query.isShowMultiple = String(depositLimitInfo.value.isShowMultiple)
  }

  router.push({
    name: 'agentDeposit',
    query,
  })
}

watch([searchSelected, selectTime, selectedSort, regTime, activeMemberType, bindCard, bindPhone, packageId, vipLevels], () => {
  infinityRef.value?.fetchData()
})

onMounted(() => {
  searchPlayerLs()
})

</script>

<template>
  <div class="py-3 space-y-2 flex-1 flex flex-col">
    <div class="px-3 space-y-2">
      <UnitCard>
        <template #header>
          <div class="flex items-start justify-between px-1">
            <div>
              <div class="text-sm font-semibold text-neutral2-basic">总盈利</div>
              <ShowNumber class="text-xl font-semibold" :format-num="formatSignedMoney(totalInfo?.TotalWinLose ?? 0, 2, false)" use-color />
            </div>
            <van-button round plain type="primary" size="small" @click="router.push({ name: 'manageMemberBelongApply' })">调线申请</van-button>
          </div>
        </template>
        <div class="flex items-center justify-between py-3">
          <div v-for="(d, idx) in info" :key="idx" class="flex-1 flex flex-col items-center justify-center">
            <div class="text-xs text-neutral2-secondary">{{ d.title }}</div>
            <div class="text-sm text-neutral2-basic">{{ d.amount  }}</div>
          </div>
        </div>
      </UnitCard>

      <div class="py-2 flex items-center justify-between space-x-2">
        <AdvancedBottomSheet v-model:show="showAdvanced" :ls="advancedLs" @change="advancedHandler" >
          <template #title>
            <div class="w-10 aspect-square rounded-full flex items-center justify-center outline outline-neutral2-seventh">
              <van-image src="./static/images/manage/filter.svg" fit="contain" class="w-4" />
            </div>
          </template>
        </AdvancedBottomSheet>
        <SearchBar placeholder="会员账号" class="flex-1" v-model:selected="searchSelected" :search-ls="searchLs" />
      </div>

      <div class="flex items-center space-x-1 overflow-x-auto">
        <TimeFilterDropdown v-model:model-value="selectTime" title="统计时间"></TimeFilterDropdown>
        <Filled v-model:model-value="selectedSort" :options="sortOptions" />
      </div>
    </div>

    <InfinityScroll
      ref="infinityRef"
      :fetch-action="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-3">
          <UnitCard v-for="(i, idx) in ls" :key="idx" class="relative" @click="router.push({ name: 'manageMemberDetail', params: { id: i.PlayerId }})">
            <template #header>
              <div class="flex items-start justify-start relative">
                <div class="flex items-start space-x-2">
                  <div class="w-14 aspect-square rounded-full relative flex items-center justify-center mb-2">
                    <van-image src="./static/images/avatar.png" fit="contain" class="w-full" />
                    <div class="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 bg-primary-normal font-semibold text-[10px] text-white py-1 px-1.5 rounded-[100px] outline outline-white">
                      VIP{{ i.VipLevel ?? 0 }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="text-base font-semibold text-neutral2-basic flex items-center space-x-1">
                      <span>{{ i.LoginAccount }}</span>
                      <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" @click.stop="copyHadandler(i.LoginAccount)"/>
                    </div>
                    <div class="flex items-start text-xs text-neutral2-tertiary space-x-1">
                      <div>
                        <div>注册时间</div>
                        <div>{{ showDate(i.CreateTime) }}</div>
                      </div>

                      <div class="w-[1px] h-3 bg-neutral2-seventh" />

                      <div >
                        <div>最后登录时间</div>
                        <div>{{ showDate(i.LastTime) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <van-button round plain type="primary" size="small" class="absolute! top-0 right-0" @click.stop="handleGoToDeposit(i)">
                  <div class="space-x-1">
                    <van-icon name="add" size="14" /><span>代存</span>
                  </div>
                </van-button>
              </div>
            </template>

            <div class="flex items-start justify-between py-3">
              <div class="flex-1 flex flex-col items-center justify-center">
                <div class="text-xs text-neutral2-secondary">盈利</div>
                <ShowNumber class="text-sm font-semibold" :format-num="formatSignedMoney(i.WinLose ?? 0, 2, false)" use-color />
              </div>
              <div class="flex-1 flex flex-col items-center justify-center">
                <div class="text-xs text-neutral2-secondary">充值</div>
                <ShowNumber class="text-sm font-semibold text-neutral2-basic" :format-num="{ text: formatMoney(i.Recharged ?? 0, 2, true).toString(), color: '' }" />
              </div>
              <div class="flex-1 flex flex-col items-center justify-center">
                <div class="text-xs text-neutral2-secondary">代存</div>
                <ShowNumber class="text-sm font-semibold text-neutral2-basic" :format-num="{ text: formatMoney(i.AgentApplyGold ?? 0, 2, true).toString(), color: '' }" />
              </div>
            </div>

            <van-button round plain size="small" class="absolute! top-1/2 -right-1 shadow-[-1px_1px_6px_0px_rgba(0,0,0,0.15)] -translate-y-1/2">
              <van-icon name="arrow" class="w-3 text-neutral2-tertiary" />
            </van-button>

            <template #footer>
              <div class="flex items-center justify-start space-x-2">
                <div class="flex items-center space-x-1">
                  <van-icon :name="i.IsActiveMember ? 'checked' : 'clear'" :class="i.IsActiveMember ? 'text-success-normal' : 'text-error-normal'" />
                  <span class="text-xs text-neutral2-secondary">活跃会员</span>
                </div>
                <template v-if="userStore.playerInfoPermission.card">
                  <div class="w-[1px] h-3 bg-neutral2-seventh" />
                  <div class="flex items-center space-x-1">
                    <van-icon :name="i.BindCard === 1 ? 'checked' : 'clear'" :class="i.BindCard === 1 ? 'text-success-normal' : 'text-error-normal'" />
                    <span class="text-xs text-neutral2-secondary">银行卡绑定</span>
                  </div>
                </template>
                <template v-if="userStore.playerInfoPermission.phone">
                  <div class="w-[1px] h-3 bg-neutral2-seventh" />
                  <div class="flex items-center space-x-1">
                    <van-icon :name="i.BindPhone === 1 ? 'checked' : 'clear'" :class="i.BindPhone === 1 ? 'text-success-normal' : 'text-error-normal'" />
                    <span class="text-xs text-neutral2-secondary">手机号绑定</span>
                  </div>
                </template>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>
