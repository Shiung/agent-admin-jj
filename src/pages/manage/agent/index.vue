<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import Big from 'big.js'
import apis from '@/apis'
import type { GetNetcashmultiInfoV2Data, NetcashmultiListQuery, NetcashmultiListItem, NetcashmultiSearchAdminQuery, NetcashmultiSearchAdminItem } from '@/apis/codegen/data-contracts'
import { useUserStore } from '@/stores/user'
import { formatMoney } from '@/utils/formatNumber'
import UnitCard from '../components/UnitCard.vue'
import AgentForm from '../components/AgentForm.vue'
import SearchBar from '@/components/SearchBar/index.vue'
import TimeFilterDropdown from '@/components/TimeFilter/TimeFilterDropdown.vue'
import DropdownFilled from '@/components/Dropdown/Filled.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userStore = useUserStore()

const showAgentForm = ref(false)
const isEdit = ref(false)

const selectedAgentItem = ref<NetcashmultiListItem | null>(null)

// 代理账号
const agentAccount = computed(() => userStore.userInfo?.Admin?.Username || '代理用户')
// 代理佣金比例

const levelMap: Record<number, string> = {
  1: '一级代理',
  2: '二级代理',
  3: '三级代理',
  4: '四级代理',
  5: '五级代理',
}

const selectedLevel = ref(0)
const levelOptions = ref([
  { value: 0, label: '全部层级' },
  { value: 1, label: '一级代理' },
  { value: 2, label: '二级代理' },
  { value: 3, label: '三级代理' },
  { value: 4, label: '四级代理' },
  { value: 5, label: '五级代理' },
])

const selectedSort = ref('-AccountLevel')
const sortOptions = ref([
  { value: '-AccountLevel', label: '代理层级降序' },
  { value: '+AccountLevel', label: '代理层级升序' },
  { value: '-CreateTime', label: '新增时间降序' },
  { value: '+CreateTime', label: '新增时间升序' },
  { value: '-Members', label: '会员数量降序' },
  { value: '+Members', label: '会员数量升序' },
])

const agentInfo = ref<GetNetcashmultiInfoV2Data>({
  AccountLevel: 0,
  CommissionRate: '',
  DownLineAgents: 0,
  DownLineMembers: 0,
  Username: ''
})

const selectTimeRange = ref({ startTime: 0, endTime: 0 })

// 代理層級
const agentLevel = computed(() => levelMap[agentInfo.value.AccountLevel] || '')

const handleAddAgent = () => {
  selectedAgentItem.value = null
  isEdit.value = false
  showAgentForm.value = true
}

const handleEditAgent = (item: NetcashmultiListItem) => {
  selectedAgentItem.value = item
  isEdit.value = true
  showAgentForm.value = true
}

const handleSubmit = (values: any) => {
  if (isEdit.value) handleEditSubmit(values)
  else handleAddSubmit(values)
}

const handleEditSubmit = async (data: any) => {
  const res = await apis.netcashmulti.putNetcashmulti(data)
  if (res.data.Code !== 200) return
  showAgentForm.value = false
  fetchNetcashmultiList()
}

const handleAddSubmit = async (data: any) => {
  const res = await apis.netcashmulti.postNetcashmulti(data)
  if (res.data.Code !== 200) return
  showAgentForm.value = false
  fetchNetcashmultiList()
}

const handleClose = () => {
  showAgentForm.value = false
}

const fetchNetcashmultiInfoV2 = async () => {
  const res = await apis.netcashmulti.getNetcashmultiInfoV2()
  if (res.data.Code !== 200) return
  agentInfo.value = res.data.Data
}

const netcashmultiSearchAdminQuery = ref<NetcashmultiSearchAdminQuery>({
  Username: '', // 代理账号
  AccountLevel: 0 // 代理層級
})

const netcashmultiSearchAdminItem = ref<NetcashmultiSearchAdminItem[]>([])
const netcashmultiSearchAdminItemList = computed(() => netcashmultiSearchAdminItem.value.map(item => ({ id: item.AdminId, text: item.Username })) || [])

// 選中的代理賬號
const selectedAgent = ref<{ id: number | string; text: string } | null>(null)

const fetchNetcashmultiSearchAdmin = async () => {
  const res = await apis.netcashmulti.getNetcashmultiSearchAdmin(netcashmultiSearchAdminQuery.value).catch((e) => e)
  if (res?.data?.Code !== 200) return
  netcashmultiSearchAdminItem.value = res.data.Data.Items
}

const loading = ref(false)
const finished = ref(false)

const netcashmultiListQuery = ref<NetcashmultiListQuery>({
  Page: 0, // 页码，頁面load會觸發@load事件
  PageSize: 20, // 每页条数
  Sort: computed(() => selectedSort.value) as unknown as string, // 排序 前面帶正負號代表排序方式。ex: -CreateTime, +Members,支援參數: AccountLevel, CreateTime, Members
  Username: selectedAgent.value?.text || '', // 代理账号
  AccountLevel: computed(() => selectedLevel.value) as unknown as number, // 代理層級
  AdminId: 0, // 代理ID
  CreateTimeBegin: computed(() => selectTimeRange.value.startTime) as unknown as number, // 创建时间开始
  CreateTimeEnd: computed(() => selectTimeRange.value.endTime) as unknown as number, // 创建时间结束
})

// 代理列表
const agentList = ref<NetcashmultiListItem[]>([])

// 偵測 Remark 是否被截斷
const remarkRefs = ref<(HTMLElement | null)[]>([])
const isRemarkTruncated = ref<boolean[]>([])

const checkTruncation = () => {
  nextTick(() => {
    isRemarkTruncated.value = remarkRefs.value.map(el => {
      if (!el) return false
      return el.scrollWidth > el.clientWidth
    })
  })
}
const fetchNetcashmultiList = async () => {
  loading.value = true
  // finished.value = false

  const res = await apis.netcashmulti.getNetcashmultiList(netcashmultiListQuery.value).catch((e) => e)
  if (res?.data?.Code !== 200) return

  const items = res.data.Data.Items || []

  agentList.value = netcashmultiListQuery.value.Page === 1 ? items : [...agentList.value, ...items]
  loading.value = false
  checkTruncation()

  if ((res.data.Data.Items?.length || 0) < netcashmultiListQuery.value.PageSize) finished.value = true

}

const loadNetcashmultiList = () => {
  netcashmultiListQuery.value.Page += 1
  fetchNetcashmultiList()
}

const handleOrgChartClick = () => {
  router.push({ name: 'agentOrgChart' })
}

watch([selectedAgent, selectTimeRange, selectedLevel, selectedSort], () => {
  netcashmultiListQuery.value.Page = 0
  netcashmultiListQuery.value.Username = selectedAgent.value ? selectedAgent.value.text : ''
  loadNetcashmultiList()
})

onMounted(() => {
  fetchNetcashmultiInfoV2()
  fetchNetcashmultiSearchAdmin()
  loadNetcashmultiList()
})
</script>

<template>
  <div class="overflow-auto p-4 pb-11 max-h-screen flex flex-col flex-1">    
    <UnitCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <span class="font-semibold text-sm text-neutral2-basic">{{ agentAccount }}</span>
            <span class="text-sm text-neutral2-secondary">{{ agentLevel }}</span>
          </div>
          <div class="flex items-center justify-end">
            <div class="mr-2"><VanButton round type="primary" size="small" @click="handleOrgChartClick">组织图</VanButton></div>
            <div><VanButton round plain type="primary" size="small" @click="handleAddAgent">新增</VanButton></div>
          </div>
        </div>
      </template>
      <div class="flex items-center justify-around py-3">
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral2-secondary">下级代理总数</div>
          <div class="font-semibold text-sm text-neutral2-basic">{{ agentInfo.DownLineAgents }}</div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral2-secondary">下级会员总数</div>
          <div class="font-semibold text-sm text-neutral2-basic">{{ agentInfo.DownLineMembers }}</div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-sm text-neutral2-secondary">佣金比例</div>
          <div class="font-semibold text-sm text-neutral2-basic">{{ formatMoney(agentInfo.CommissionRate) }}%</div>
        </div>
      </div>
    </UnitCard>

    <div class="my-3 flex items-center justify-between space-x-2">
      <SearchBar v-model:selected="selectedAgent" placeholder="代理账号" class="flex-1" :search-ls="netcashmultiSearchAdminItemList" />
    </div>

    <div class="mb-3 flex items-center space-x-2">
      <TimeFilterDropdown v-model="selectTimeRange" title="新增时间" showAll />
      <DropdownFilled v-model="selectedLevel" placeholder="代理层级" class="flex-1" :options="levelOptions" />
      <DropdownFilled v-model="selectedSort" placeholder="排序" class="flex-1" :options="sortOptions" />
    </div>

    <div v-if="agentList.length === 0"  class="flex-1 flex items-center">
      <empty />
    </div>
    <VanList v-else v-model:loading="loading" :finished="finished" @load="loadNetcashmultiList">
      <UnitCard class="mb-3" v-for="(item, idx) in agentList" :key="idx">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="space-x-2">
              <span class="font-semibold text-sm text-neutral2-basic">{{ item.Username }}</span>
              <span class="text-sm text-neutral2-secondary">{{ levelMap[item.AccountLevel] }}</span>
            </div>
            <div class="flex items-center justify-end">
              <div><VanButton round plain type="primary" size="small" @click="handleEditAgent(item)">编辑</VanButton></div>
            </div>
          </div>
        </template>
        <div class="flex items-center justify-around py-3">
          <div class="flex flex-col items-center">
            <div class="text-sm text-neutral2-secondary">会员数</div>
            <div class="font-semibold text-sm text-neutral2-basic">{{ item.Members }}</div>
          </div>
          <div class="flex flex-col items-center">
            <div class="text-sm text-neutral2-secondary">佣金比例</div>
            <div class="font-semibold text-sm text-neutral2-basic">{{ formatMoney(item.CommissionRate) }}%</div>
          </div>
        </div>
        <template #footer>
          <div class="flex items-center justify-between gap-2">
            <div class="remark-container flex-1 min-w-0 flex items-center gap-1">
              <span 
                :ref="(el) => remarkRefs[idx] = el as HTMLElement"
                class="remark-text font-semibold text-sm text-neutral2-basic whitespace-nowrap overflow-hidden text-ellipsis"
              >{{ item.Remark }}</span>
              <AppTooltip content-side="top" v-if="isRemarkTruncated[idx]">
                <van-icon name="info" class="text-primary-normal" />
                <template #content>
                  <span>{{ item.Remark }}</span>
                </template>
              </AppTooltip>
            </div>
            <div class="whitespace-nowrap flex-shrink-0">
              <span class="text-sm text-neutral2-secondary">{{ dayjs(item.CreateTime).format('YYYY-MM-DD HH:mm') }}</span>
            </div>
          </div>
        </template>
      </UnitCard>

    </VanList>

    <!-- Agent Form Popup -->
    <van-popup
      v-model:show="showAgentForm"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <AgentForm
        v-if="showAgentForm"
        :is-edit="isEdit"
        :selectedAgentItem="selectedAgentItem"
        @close="handleClose"
        @submit="handleSubmit"
      />
    </van-popup>
  </div>
</template>
