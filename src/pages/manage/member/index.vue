<script setup lang="ts">
import { computed, defineComponent, ref, h, onMounted, watch } from 'vue'
import UnitCard from '../components/UnitCard.vue'
import { useRouter } from 'vue-router'
import type SearchBar from '@/components/SearchBar/index.vue'

import type { InfinityExposeType } from '@/components/InfinityScroll/index.vue'
import { cn } from '@/utils/className'
import API from '@/apis'
import dayjs from 'dayjs'
import { formatSignedMoney, formatNumber, formatMoney } from '@/utils/formatNumber'

const router = useRouter()
const infinityRef = ref<InfinityExposeType>()

// const itemLs = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerListv2>>['data']['Data']['Items']>([])
const totalInfo = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerListv2>>['data']['Data']['Total'] | null>(null)
const pageInfo = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerListv2>>['data']['Data']['Pagination'] | null>(null)

const info = computed(() => ([
  { title: '总会员数', amount: formatNumber(pageInfo.value?.MaxCount ?? 0) },
  { title: '总充值', amount: formatMoney(totalInfo.value?.TotalRecharged ?? 0, 0, true) },
  { title: '总代存', amount: formatMoney(totalInfo.value?.TotalAgentApplyGold ?? 0, 0, true) },
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
  const todayStart = dayjs().startOf('day').unix()
  const todayEnd = dayjs().endOf('day').unix()
  
  const query = {
    ReportTimeBegin: todayStart,
    ReportTimeEnd: todayEnd,
    PageSize: pageInfo.value?.PageSize ?? 10,
    Page: page,
    ...(searchSelected.value && { PlayerId: Number(searchSelected.value.id) })
  }

  try {
    const res = await API.playerManage.getPlayerListv2(query)
    
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

watch(searchSelected, () => {
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
        <div class="w-10 aspect-square rounded-full flex items-center justify-center outline outline-neutral2-seventh">
          <van-image src="./static/images/manage/filter.svg" fit="contain" class="w-4" />
        </div>
        <SearchBar placeholder="会员账号" class="flex-1" v-model:selected="searchSelected" :search-ls="searchLs" />
      </div>
  
      <div class="flex items-center [&>div]:text-neutral2-basic [&>div]:bg-bg-floor-1-2">
        <div>统计时间｜本月 </div>
        <div>注册时间降序</div>
      </div>
    </div>

    <InfinityScroll
      ref="infinityRef"
      :fetch-action="fetchData"
      class="flex-1 flex flex-col"
    >
      <template v-slot="{ ls }">
        <div class="space-y-2 px-3">
          <UnitCard v-for="(i, idx) in ls" :key="idx" class="relative">
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
                      <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" />
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
                <van-button round plain type="primary" size="small" class="absolute! top-0 right-0">
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
                <ShowNumber class="text-sm font-semibold text-neutral2-basic" :format-num="formatSignedMoney(i.Recharged ?? 0, 0, false)" />
              </div>
              <div class="flex-1 flex flex-col items-center justify-center">
                <div class="text-xs text-neutral2-secondary">代存</div>
                <ShowNumber class="text-sm font-semibold text-neutral2-basic" :format-num="formatSignedMoney(i.AgentApplyGold ?? 0, 0, false)" />
              </div>
            </div>

            <van-button round plain size="small" class="absolute! top-1/2 -right-1 shadow-[-1px_1px_6px_0px_rgba(0,0,0,0.15)] -translate-y-1/2"  @click="router.push({ name: 'manageMemberDetail', params: { id: i.PlayerId }})">
              <van-icon name="arrow" class="w-3 text-neutral2-tertiary" />
            </van-button>

            <template #footer>
              <div class="flex items-center justify-start space-x-2">
                <div class="flex items-center space-x-1">
                  <van-icon :name="i.IsActiveMember ? 'checked' : 'clear'" :class="i.IsActiveMember ? 'text-success-normal' : 'text-error-normal'" />
                  <span class="text-xs text-neutral2-secondary">活跃会员</span>
                </div>
                <div class="w-[1px] h-3 bg-neutral2-seventh" />
                <div class="flex items-center space-x-1">
                  <van-icon :name="i.BindCard === 1 ? 'checked' : 'clear'" :class="i.BindCard === 1 ? 'text-success-normal' : 'text-error-normal'" />
                  <span class="text-xs text-neutral2-secondary">银行卡绑定</span>
                </div>
                <div class="w-[1px] h-3 bg-neutral2-seventh" />
                <div class="flex items-center space-x-1">
                  <van-icon :name="i.BindPhone === 1 ? 'checked' : 'clear'" :class="i.BindPhone === 1 ? 'text-success-normal' : 'text-error-normal'" />
                  <span class="text-xs text-neutral2-secondary">手机号绑定</span>
                </div>
              </div>
            </template>
          </UnitCard>
        </div>
      </template>
    </InfinityScroll>
  </div>
</template>