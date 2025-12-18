<script setup lang="ts">
import { onMounted, ref, defineComponent, computed, h, watch } from 'vue'
import API from '@/apis/index'
import { cn } from '@/utils/className'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

import type SearchBar from '@/components/SearchBar/index.vue'
import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'
import type TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'

const userStore = useUserStore()

const totalApproved = ref<number>(0)
const searchLsLoading = ref<boolean>(false)
const searchSelected = ref<InstanceType<typeof SearchBar>['$props']['selected']>(null)
const searchLs = ref<Array<{ id: number, text: string }>>([])

const infinityRef = ref<InfinityExposeType>()

const selectTime = ref<InstanceType<typeof TimeFilterDropdown>['modelValue']>({
  startTime: dayjs().startOf('month').unix(),
  endTime: dayjs().endOf('month').unix()
})

const selectProduct = ref<number | null>(null)

const selectProductLs = computed<Array<{ label: string; value: null | number}>>(() => {
  const prodLs = (userStore?.productPackages ?? []).map((p) => ({
    label: p.PackageName,
    value: p.PackageId
  }))
  return [
    { label: '全部产品', value: null },
    ...prodLs
  ]
})

const statusLs = [
  { label: '全部状态', value: 0 },
  { label: '申请中', value: 1 },
  { label: '同意', value: 2 },
  { label: '拒绝', value: 3 },
]

const selectStatus = ref<number>(statusLs?.[0]?.value ?? 0)

const showDate = (ts: number | string | null | undefined) => {
  if (!ts) return null
  const num = Number(ts)
  if (isNaN(num)) return null
  return dayjs.unix(num).format('YYYY-MM-DD HH:mm:ss')
}

const StatusComp = defineComponent(
  (props: {
    status: Awaited<ReturnType<typeof API.playerManage.getApplylistv2>>['data']['Data']['Items'][number]['Status']
  }, {
    attrs
  }) => {
    const returnVal = computed(() => {
      let text, color
      switch (props.status) {
        case 1: {
          text = '申请中'
          color = 'text-neutral2-secondary border-neutral2-secondary/50 bg-neutral2-secondary/10'
          break
        }
        case 2: {
          text = '同意'
          color = 'text-success-normal border-success-normal/50 bg-success-normal/10'
          break
        }
        case 3: {
          text = '拒绝'
          color = 'text-error-normal border-error-normal/50 bg-error-normal/10'
          break
        }
        default: {
          text = props.status
        }
      }
      return { text, color }
    })

    return () => h('div', { class: cn(attrs.class ?? '', returnVal.value.color) }, returnVal.value.text)
  },
  {
    props: ['status'],
    inheritAttrs: false
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
    const res = await API.playerManage.getApplylistv2({
      ApplyTimeBegin: selectTime.value.startTime,
      ApplyTimeEnd: selectTime.value.endTime,
      ...(selectProduct.value && { PackageId: selectProduct.value }),
      ...(searchSelected.value && { PlayerId: Number(searchSelected.value.id) }),
      Status: selectStatus.value,
      Page: page,
      PageSize: 20,
    })
    totalApproved.value = res.data.Data?.Total?.TotalApproved ?? 0
    return {
      data: res.data.Data.Items,
      paging: res.data.Data.Pagination
    }
  } catch(e) {
    console.warn('fetchData outside [error]: ', e)
    return { data: [], paging: null }
  }
} 

watch([selectTime, selectProduct, selectStatus, searchSelected], () => {
  infinityRef.value?.fetchData()
})

onMounted(() => {
  searchPlayerLs()
})

</script>

<template>
  <div class="space-y-4 flex-1 flex flex-col">
    <NavBar title="调线记录"></NavBar>
    <div class="px-4 space-y-4">
      <div class="shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] rounded-2xl flex justify-between items-center pl-3">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-semibold text-neutral2-basic ">调线人数</span>
          <span class="text-xl text-primary-normal">{{ totalApproved }}</span>
        </div>
        <van-image fit="contain" src="./static/images/manage/belong_bg.png" class="w-1/3" />
      </div>
  
      <SearchBar placeholder="会员账号" v-model:selected="searchSelected" :search-ls="searchLs" />
    </div>

    <div class="flex items-center px-4 overflow-x-auto space-x-2">
      <TimeFilterDropdown v-model="selectTime" title="申请时间" />
      <Filled v-model:model-value="selectProduct" :options="selectProductLs" />
      <Filled v-model:model-value="selectStatus" :options="statusLs" />
    </div>

    <InfinityScroll
      ref="infinityRef"
      :fetch-action="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-4">
          <div v-for="l in ls" :key="l.Id" class="rounded-2xl bg-bg-floor-1-2 px-3 pt-2 pb-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="space-x-1 text-">
                <span class="text-neutral2-basic text-sm font-semibold">{{ l.LoginAccount }}</span>
                <span class="text-xs text-neutral2-secondary">VIP{{ l.VipLevel }}</span>
              </div>
              <StatusComp class="text-xs border leading-5 rounded-[100px] px-2" :status="l.Status" />
            </div>
            <div class="rounded-2xl bg-white px-3 [&>div:not(:first-of-type)]:border-t [&>div:not(:first-of-type)]:border-neutral2-sixth">
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">产品包</div>
                <div class="font-semibold text-right">{{ l.PackageName }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">绑定渠道号</div>
                <div class="font-semibold text-right">{{ l.BindChannelId }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">引导链接</div>
                <div class="font-semibold text-right">{{ l.GuideUrl }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">设备类型</div>
                <div class="font-semibold text-right">{{ l.ApplyPlatform }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">备注</div>
                <div class="font-semibold text-right">{{ l.Desc }}</div>
              </div>
              <div class="flex items-center justify-between py-2 text-xs text-neutral2-basic">
                <div class="font-normal flex-[0_0_30%]">申请时间</div>
                <div class="font-semibold text-right">{{ showDate(l.ApplyTime) }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>