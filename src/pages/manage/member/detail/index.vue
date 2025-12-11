<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import UnitCard from '../../components/UnitCard.vue'
import type SwitchTab from '@/components/SwitchTab/index.vue'
import { useClipboard } from '@vueuse/core'

import dayjs from 'dayjs'
import { useWindowSize, useElementSize } from '@vueuse/core'

import useProvider from './composables/useProvider'

const heightEl = ref<HTMLDivElement>()

const activeTab = ref<number>(0)

const { height } = useWindowSize()
const { height: headerH } = useElementSize(heightEl)

const ls: InstanceType<typeof SwitchTab>['$props']['tabs'] = [
  { id: '财务信息', title: '财务信息', content: defineAsyncComponent(() => import('./components/Finance.vue')) },
  { id: '游戏记录', title: '游戏记录', content: defineAsyncComponent(() => import('./components/GameRecord.vue')) },
  { id: '充值记录', title: '充值记录', content: defineAsyncComponent(() => import('./components/Recharge.vue')) },
  { id: '提现记录', title: '提现记录', content: defineAsyncComponent(() => import('./components/Withdraw.vue')) },
  { id: '红利记录', title: '红利记录', content: defineAsyncComponent(() => import('./components/Bonus.vue')) },
  { id: '代存记录', title: '代存记录', content: defineAsyncComponent(() => import('./components/Deposit.vue')) },
]

const contentMinHeight = computed(() => {
  const windowHeight = height.value
  const headerHeight = headerH.value
  const tabHeight = 44
  const spaceGab = 8
  return `${windowHeight - headerHeight - tabHeight - spaceGab}px`
})

const showDate = (ts: number | string | null | undefined) => {
  if (!ts) return null
  const num = Number(ts)
  if (isNaN(num)) return null
  return dayjs(num > 1e12 ? num : num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const { states, playerInfoPermission } = useProvider()

const copyHadandler = (c: string) => {
  useClipboard().copy(c)
  showToast({ message: '复制成功' })
}

</script>

<template>
  <div class="space-y-2 flex-1">
    <div ref="heightEl" class="space-y-2">
      <NavBar title="会员详情"></NavBar>
  
      <div class="px-4">
        <UnitCard>
          <template #header>
            <div class="flex items-start justify-start relative">
              <div class="flex items-start space-x-2">
                <div class="w-20 aspect-square rounded-full relative">
                  <van-image src="./static/images/avatar.png" fit="contain" class="w-full scale-125" />
                  <div class="absolute left-1/2 -translate-x-1/2 bottom-1 translate-y-1/2 bg-primary-normal font-semibold text-[10px] text-white py-1 px-1.5 rounded-[100px] outline outline-white">
                    VIP{{ states.playerInfo?.PlayerInfo.VipLevel ?? 0 }}
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="text-base font-semibold text-neutral2-basic flex items-center space-x-1">
                    <span>{{ states.playerInfo?.PlayerInfo.LoginAccount }}</span>
                    <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" @click="copyHadandler(states.playerInfo?.PlayerInfo.LoginAccount ?? '')" />
                  </div>
                  <div class="text-xs text-neutral2-basic">ID: <span>{{ states.playerInfo?.PlayerInfo.PlayerId }}</span></div>
                  <div class="text-xs text-neutral2-basic">{{ states.playerInfo?.PlayerInfo.PackageName }}</div>
                  <div></div>
                  <div class="flex items-center text-xs text-neutral2-tertiary space-x-1">
                    <div>
                      <div>注册时间</div>
                      <div>{{ showDate(states.playerInfo?.PlayerInfo.CreateTime) }}</div>
                    </div>
                    
                    <div class="w-[1px] h-3 bg-neutral2-seventh" />
                    
                    <div >
                      <div>最后登录时间</div>
                      <div>{{ showDate(states.playerInfo?.PlayerInfo.LastLoginTime) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <van-button round type="primary" size="small" class="absolute! top-0 right-0">
                <div class="space-x-1">
                  <van-icon name="add" size="14" /><span>代存</span>
                </div>
              </van-button>
            </div>
          </template>
    
          <div class="flex items-center justify-start px-2 py-1 space-x-2">
            <div class="flex items-center space-x-1">
              <van-icon :name="states.playerInfo?.PlayerInfo.IsActiveMember ? 'checked' : 'clear'" :class="states.playerInfo?.PlayerInfo.IsActiveMember ? 'text-success-normal' : 'text-error-normal'" />
              <span class="text-xs text-neutral2-secondary">活跃会员</span>
            </div>
            <template v-if="playerInfoPermission.card">
              <div class="w-[1px] h-3 bg-neutral2-seventh" />
              <div class="flex items-center space-x-1">
                <van-icon :name="states.playerInfo?.PlayerInfo.BindCard === 1 ? 'checked' : 'clear'" :class="states.playerInfo?.PlayerInfo.BindCard === 1 ? 'text-success-normal' : 'text-error-normal'" />
                <span class="text-xs text-neutral2-secondary">银行卡绑定</span>
              </div>
            </template>
            <template v-if="playerInfoPermission.phone">
              <div class="w-[1px] h-3 bg-neutral2-seventh" />
              <div class="flex items-center space-x-1">
                <van-icon :name="states.playerInfo?.PlayerInfo.BindPhone === 1 ? 'checked' : 'clear'" :class="states.playerInfo?.PlayerInfo.BindPhone === 1 ? 'text-success-normal' : 'text-error-normal'" />
                <span class="text-xs text-neutral2-secondary">手机号绑定</span>
              </div>
            </template>
          </div>
        </UnitCard>
      </div>
    </div>

    <switch-tab v-model:active-tab="activeTab" :opts="{ type: 'line' }" :tabs="ls" swipeable :playerId="states.playerId" class="cusTab"  />
  </div>
</template>

<style lang="scss" scoped>
.cusTab {
  :deep(.van-tabs__nav--line) {
    padding-left: 0;
    padding-right: 0;
  }
  :deep(.van-tab__panel > div) {
    min-height: v-bind(contentMinHeight);
  }
}

</style>
