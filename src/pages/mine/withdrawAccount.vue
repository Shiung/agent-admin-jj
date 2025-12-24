<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { type WithdrawAccountData } from '@/apis/codegen/data-contracts'
import { useGlobalStore } from '@/stores/global'
import API from '@/apis'

const { copy } = useClipboard()
const globalStore = useGlobalStore()

const list = ref<WithdrawAccountData[]>([])
const refreshing = ref<boolean>(false)
const noData = ref<boolean>(false)

const fetchWithdrawAccount = async () => {
  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await API.admin.getWithdrawAccount()
    if (res.data.Code !== 200) return
    list.value = res.data.Data
    if (refreshing.value) refreshing.value = false
  } finally {
    loading.close()
    if (list.value.length === 0) noData.value = true
  }
}

const handleCopy = (text: string) => {
  if (!text) return
  copy(text)
  showToast({ message: '复制成功', position: 'top' })
}

const getBankName = (bankCode: string) => {
  return globalStore.bankMapping?.[bankCode]?.BankName ?? ''
}

onMounted(() => {
  fetchWithdrawAccount()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar title="提现账号" />
    <div class="listContainer px-3 py-2">
      <van-pull-refresh v-model="refreshing" :style="[list.length === 0 && { height: '100%' }]" @refresh="fetchWithdrawAccount">
        <div v-if="list.length > 0" class="flex flex-col pb-2 gap-2">
          <div v-for="(item, index) in list" :key="index" class="flex flex-col p-3 rounded-2xl bg-bg-floor-1-2">
            <div class="text-sm font-semibold leading-6 text-neutral2-basic">{{ item.Name }}</div>
            <div class="mt-2 px-3 bg-white rounded-2xl">
              <div class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic">
                <div class="font-normal">提现账号</div>
                <div class="flex items-center justify-center font-semibold">
                  {{ item.AccountNum }}
                  <van-image src="./static/images/promote/copy_lite.png" class="ml-1 w-3 h-3" fit="contain" @click="handleCopy(item.AccountNum)" />
                </div>
              </div>

              <div v-if="item.Protocol !== '-'" class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="font-normal">虚拟币协议</div>
                <div class="flex items-center justify-center font-semibold">
                  {{ item.Protocol }}
                </div>
              </div>

              <div v-if="item.BankCode !== '-'" class="flex justify-between py-2 leading-5 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
                <div class="font-normal">所属机构</div>
                <div class="flex items-center justify-center font-semibold">
                  {{ getBankName(item.BankCode) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <empty v-if="list.length === 0" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.listContainer {
  height: calc(100vh - calc(var(--van-nav-bar-height)));
}
</style>
