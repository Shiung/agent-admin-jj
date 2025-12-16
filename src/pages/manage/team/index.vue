<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import apis from '@/apis'
import type { GetNetcashteamInfoData, NetcashteamListV2Query, NetcashteamListV2Item, NetcashteamSearchQuery, NetcashteamSearchItem  } from '@/apis/codegen/data-contracts'
import UnitCard from '../components/UnitCard.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import DropdownFilled from '@/components/Dropdown/Filled.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 代理账号
const agentAccount = computed(() => userStore.userInfo?.Admin?.Username || '')

const teamInfo = ref<GetNetcashteamInfoData>({
  ActiveMembers: 0,
  CreateTime: 0,
  Deleted: 0,
  Deputys: 0,
  Id: 0,
  Members: 0,
  Remark: '',
  TeamName: '',
  Type: 0,
  Username: ''
})

const fetchNetcashteamInfo = async () => {
  const res = await apis.netcashteam.getNetcashteamInfo()
  if (res.data.Code !== 200) return
  teamInfo.value = res.data.Data
}

const netcashteamSearchQuery = ref<NetcashteamSearchQuery>({
  Username: '', // 代理账号
})

const netcashteamSearchItem = ref<NetcashteamSearchItem[]>([])
const netcashteamSearchItemList = computed(() => netcashteamSearchItem.value.map(item => ({ id: item.AdminId, text: item.Username })) || [])

// 選中的代理賬號
const selectedAgent = ref<{ id: number | string; text: string } | null>(null)

const fetchNetcashteamSearch = async () => {
  const res = await apis.netcashteam.getNetcashteamSearchAdmin(netcashteamSearchQuery.value).catch((e) => e)
  if (res?.data?.Code !== 200) return
  netcashteamSearchItem.value = res.data.Data.Items
}

const loading = ref(false)
const finished = ref(false)

const selectTimeRange = ref({ startTime: 0, endTime: 0 })

const netcashteamListV2Query = ref<NetcashteamListV2Query>({
  Page: 0, // 页码，頁面load會觸發@load事件
  PageSize: 20, // 每页条数
  Sort: computed(() => selectedSort.value) as unknown as string, // 排序(示例: 按照渠道正向排序 'ChannelId'，按照渠道反向排序 '-ChannelId')。如果為空，默認按照Id反向排序
  JoinTeamTimeBegin: computed(() => selectTimeRange.value.startTime) as unknown as number, // 开始时间
  JoinTeamTimeEnd: computed(() => selectTimeRange.value.endTime) as unknown as number, // 结束时间
  AdminId: 0 // 代理ID
})

// 团队列表
const teamList = ref<NetcashteamListV2Item[]>([])

const selectedSort = ref('-JoinTeamTime')
const sortOptions = ref([
  { value: '-JoinTeamTime', label: '新增时间降序' },
  { value: '+JoinTeamTime', label: '新增时间升序' },
  { value: '-Members', label: '会员数量降序' },
  { value: '+Members', label: '会员数量升序' },
  { value: '-ActiveMembers', label: '活跃会员降序' },
  { value: '+ActiveMembers', label: '活跃会员升序' },
])

const fetchNetcashteamListV2 = async () => {
  loading.value = true
  // finished.value = false

  const res = await apis.netcashteam.getNetcashteamListV2(netcashteamListV2Query.value).catch((e) => e)
  if (res?.data?.Code !== 200) return

  const items = res.data.Data.Items || []

  teamList.value = netcashteamListV2Query.value.Page === 1 ? items : [...teamList.value, ...items]
  loading.value = false

  if ((res.data.Data.Items?.length || 0) < netcashteamListV2Query.value.PageSize) finished.value = true

}

const loadNetcashteamList = () => {
  netcashteamListV2Query.value.Page += 1
  fetchNetcashteamListV2()
}

watch([selectedAgent, selectTimeRange, selectedSort], () => {
  netcashteamListV2Query.value.Page = 0
  netcashteamListV2Query.value.AdminId = selectedAgent.value ? +selectedAgent.value.id : 0
  loadNetcashteamList()
})

onMounted(() => {
  fetchNetcashteamInfo()
  fetchNetcashteamSearch()
  loadNetcashteamList()
})
</script>

<template>
  <div class="overflow-auto p-4 pb-11 max-h-screen flex flex-col flex-1">    
    <UnitCard>
      <template #header>
        <div class="flex items-center justify-start">
          <div>
            <span class="font-semibold text-sm text-neutral2-basic">团队总计</span>
          </div>
        </div>
      </template>
      <div class="flex items-center justify-around py-3">
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral2-secondary">团队代理总数</div>
          <div class="font-semibold text-sm text-neutral2-basic">{{ teamInfo.Deputys }}</div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral2-secondary">团队会员</div>
          <div class="font-semibold text-sm text-neutral2-basic">{{ teamInfo.Members }}</div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral2-secondary">团队活跃会员</div>
          <div class="font-semibold text-sm text-neutral2-basic">{{ teamInfo.ActiveMembers }}</div>
        </div>
      </div>
    </UnitCard>

    <div class="my-3 flex items-center justify-between space-x-2">
      <SearchBar v-model:selected="selectedAgent" placeholder="代理账号" class="flex-1" :search-ls="netcashteamSearchItemList" />
    </div>

    <div class="mb-3 flex items-center justify-between space-x-2">
      <div class="mb-3 flex items-center space-x-2">
        <TimeFilterDropdown v-model="selectTimeRange" title="新增时间" showAll />
        <DropdownFilled v-model="selectedSort" placeholder="排序" class="flex-1" :options="sortOptions" />
      </div>
    </div>

    <div v-if="teamList.length === 0"  class="flex-1 flex items-center">
      <empty />
    </div>
    <VanList v-else v-model:loading="loading" :finished="finished" @load="loadNetcashteamList">
      <UnitCard class="mb-3" v-for="(item, idx) in teamList" :key="idx">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="space-x-2">
              <span class="font-semibold text-sm text-neutral2-basic">{{ item.Username }}</span>
              <span v-if="item.Username === agentAccount" class="text-sm text-neutral2-secondary">主线</span>
            </div>
            <div class="flex items-center justify-end">
              <div>{{ dayjs(item.JoinTeamTime * 1000).format('YYYY-MM-DD HH:mm') }}</div>
            </div>
          </div>
        </template>
        <div class="flex items-center justify-around py-3">
          <div class="flex flex-col items-center">
            <div class="text-sm text-neutral2-secondary">会员数</div>
            <div class="font-semibold text-sm text-neutral2-basic">{{ item.Members }}</div>
          </div>
          <div class="flex flex-col items-center">
            <div class="text-sm text-neutral2-secondary">活跃会员</div>
            <div class="font-semibold text-sm text-neutral2-basic">{{ item.ActiveMembers }}</div>
          </div>
        </div>
      </UnitCard>

    </VanList>
  </div>
</template>
