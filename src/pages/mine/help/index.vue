<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import API from '@/apis'
import type { HelpCenterListData } from '@/apis/codegen/data-contracts'

const router = useRouter()
const loading = ref(false)
const helpCenterList = ref<HelpCenterListData[]>()

const fetchHelpCenterList = async () => {
  loading.value = true
  const res = await API.admin.getHelpList({ Page: 1, PageSize: 20 })
  if (res.data.Code !== 200) {
    return
  }
  helpCenterList.value = res.data.Data?.Items || []
  loading.value = false
}

onMounted(() => {
  fetchHelpCenterList()
})

const handleClick = (item: HelpCenterListData) => {
  sessionStorage.setItem('helpItem', JSON.stringify(item))
  router.push({ name: 'helpDetail' })
}

</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="帮助" />
    <div class="flex flex-col">
      <div
        v-for="item in helpCenterList"
        :key="item.Id"
        class="flex items-center justify-between px-3 py-[15px] bg-white rounded-2xl shadow-sm mx-3 mt-2 cursor-pointer"
        @click="handleClick(item)"
      >
        <div class="flex flex-col flex-1 min-w-0">
          <p class="text-base text-neutral-basic truncate">
            {{ item.Tag }}
          </p>
        </div>
        <van-icon name="arrow" size="16" class="text-neutral2-tertiary flex-shrink-0 ml-2" />
      </div>
    </div>
  </div>
</template>
