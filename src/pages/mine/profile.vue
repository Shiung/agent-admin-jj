<!-- src/pages/mine/profile.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'
import NavBar from '@/components/NavBar/index.vue'
import dayjs from 'dayjs'
import API from '@/apis'
import { formatMoney, formatNumber } from '@/utils/formatNumber'

const router = useRouter()
const userStore = useUserStore()
const globalStore = useGlobalStore()
const personalCenterInfo = computed(() => userStore.accountInfo)
const show = ref<boolean>(false)
const commissionRate = ref<number>(0)

const formatDate = (timestamp: number | string | null | undefined, format = 'YYYY-MM-DD'): string => {
  if (!timestamp) return '-'
  const timestampMs = typeof timestamp === 'string' ? Number(timestamp) : timestamp
  const ms = timestampMs > 1000000000000 ? timestampMs : timestampMs * 1000
  return dayjs(ms).format(format)
}

const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '此操作将退出当前代理账号，是否继续？',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    className: 'confirm-dialog',
  }).then(async () => {
    await userStore.logout()
    router.replace({ name: 'login' })
  })
}


// 是否为多层代理
const isSingleAgent = computed(() => userStore.isSingleAgent)
const commissionRateParseFunction = computed(() => isSingleAgent.value ? formatNumber : formatMoney)

// 是否顯示上級代理
const isShowParentAgent = computed(() => {
  // 單層代理：隱藏
  if (userStore.isSingleAgent && !userStore.hasTeam) {
    return false
  }
  // 單層團隊代理-主線：隱藏
  if (userStore.isSingleAgent && userStore.hasTeam && userStore.isMainLine) {
    return false
  }
  // 多層代理-一級：隱藏
  if (!userStore.isSingleAgent && personalCenterInfo.value?.AccountLevel === 1) {
    return false
  }
  return true
})

// 雲平台/代理列表 > 驗證設置 > 是否顯示手機號綁定
const isShowPhoneBind = computed(() => {
  return globalStore.systemConfig.PhoneBind
})

// 雲平台/代理列表 > 驗證設置 > 是否顯示郵箱綁定
const isShowEmailBind = computed(() => {
  return globalStore.systemConfig.EmailBind
})

// 雲平台/代理列表 > 驗證設置 > 是否顯示谷歌綁定
const isShowGoogleBind = computed(() => {
  return globalStore.systemConfig.GoogleBind
})

// 上級代理帳號
const parentAgentUsername = computed(() => {
  return personalCenterInfo.value?.ParentUsername || '-'
})

// 佣金比例表
const commissionRateList = computed(() => {
  const rateList = personalCenterInfo.value?.CommissionRate || []

  return rateList.map((item) => {
    const profit = formatMoney(item.SumWinLose, 2)
    // 整數不顯示 .0
    const totalProfit = profit % 1 === 0 ? profit.toString() : profit.toFixed(1)

    return {
      activeMembers: `>=${item.ActiveNum}`,
      totalProfit,
      ratio: userStore.isSingleAgent
        ? `${formatNumber(item.CommissionRate, 2)}%`
        : `${formatNumber(item.CommissionRate / 100, 2)}%` // 多层代理需要除以100
    }
  })
})

const fetchCompareCommission = async () => {
  const res = await API.admin.getCompareCommission()
  if (res.data.Code !== 200) {
    showFailToast(res.data.Msg)
    return
  }
  commissionRate.value = res.data.Data.CurrentMonth.CommissionRate
}

const initPage = async () => {
  const loadingToast = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    await Promise.all([
      userStore.fetchAccountInfo(),
      fetchCompareCommission(),
    ])
  } finally {
    loadingToast.close()
  }
}

onMounted(() => {
  initPage()
})
</script>

<template>
  <div class="flex flex-col pb-6">
    <!-- NavBar -->
    <NavBar title="个人资料" />
    <van-cell-group>
      <van-cell title="代理账号" :label="personalCenterInfo?.Username" />
      <van-cell
        title="代理昵称"
        :label="personalCenterInfo?.Name"
        @click="router.push({ name: 'mineNickname' })"
      >
        <template #right-icon>
          <van-button
            round
            :plain="!!personalCenterInfo?.Name"
            size="small"
            type="primary"
            class="px-11"
            @click.stop="router.push({ name: 'mineNickname' })"
          >
            {{ personalCenterInfo?.Name ? '修改' : '设置' }}
          </van-button>
        </template>
      </van-cell>
      <van-cell title="真实姓名" :label="personalCenterInfo?.RealName" @click="router.push({ name: 'mineRealName' })">
        <van-button v-if="!personalCenterInfo?.RealName" round size="small" type="primary" class="px-11" @click="router.push({ name: 'mineRealName' })">设置</van-button>
      </van-cell>
      <van-cell title="注册日期" :label="formatDate(personalCenterInfo?.CreateTime)" />
      <van-cell title="登录次数" :label="personalCenterInfo?.Count"/>
      <van-cell title="最近登录" :label="personalCenterInfo?.Ip + ' / ' + personalCenterInfo?.Address" @click="show = true" />
      <van-cell title="佣金比例" :label="commissionRateParseFunction(commissionRate) + '%'" @click="show = true">
        <template #right-icon>
          <van-button v-if="userStore.isSingleAgent" round size="small" type="primary" class="px-11" @click="show = true">查看</van-button>
        </template>
        <van-action-sheet v-model:show="show" title="佣金比例" teleport="body" @close="show = false">
          <div class="p-4">
            <div v-if="!commissionRateList.length">
              <empty />
            </div>
            <van-cell-group v-else class="bg-white rounded-2xl overflow-hidden border border-neutral2-seventh">
              <div class="grid grid-cols-3 items-center bg-[#F8FAFD] px-4 py-3 rounded-t-2xl gap-4">
                <div class="text-blue-950/70 text-sm text-center font-normal">活跃会员</div>
                <div class="text-blue-950/70 text-sm text-center font-normal">总盈利</div>
                <div class="text-blue-950/70 text-sm text-center font-normal">比例</div>
              </div>
              <van-cell
                v-for="(item, index) in commissionRateList"
                :key="index"
                :border="index < commissionRateList.length - 1"
                class="!p-0"
              >
                <template #title>
                  <div class="grid grid-cols-3 items-center gap-4 px-4 py-3">
                    <div class="text-base font-semibold text-blue-950/90 text-center">{{ item.activeMembers }}</div>
                    <div class="text-base font-semibold text-blue-950/90 text-center">{{ item.totalProfit }}</div>
                    <div class="text-base font-semibold text-blue-950/90 text-center">{{ item.ratio }}</div>
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </van-action-sheet>
      </van-cell>
      <van-cell title="佣金周期" :label="personalCenterInfo?.SettlementType === 1 ? '日结' : personalCenterInfo?.SettlementType === 2 ? '周结' : '月结'" />
      <!-- 上级代理显示规则：
        1. 单层代理：隐藏
        2. 单层团队代理-主线：隐藏
        3. 单层团队代理-副线：显示主线代理账号
        4. 多层代理-一级：隐藏
        5. 多层代理-非一级：显示上级代理账号
      -->
      <van-cell v-if="isShowParentAgent" title="上级代理" :label="parentAgentUsername" />
      <van-cell v-if="isShowPhoneBind" title="手机号" :class="{ 'danger': !personalCenterInfo?.Phone }">
        <template #label>
          {{ personalCenterInfo?.Phone || '尚未设置' }}
        </template>
        <template #right-icon>
          <van-button v-if="!personalCenterInfo?.Phone" round size="small" type="primary" class="px-11" @click="router.push({ name: 'minePhone' })">设置</van-button>
        </template>
      </van-cell>
      <van-cell v-if="isShowEmailBind" title="邮箱地址" :class="{ 'danger': !personalCenterInfo?.Email }" :label="personalCenterInfo?.Email || '尚未设置'" @click="router.push({ name: 'mineEmail' })">
        <van-button v-if="!personalCenterInfo?.Email" round size="small" type="primary" @click="router.push({ name: 'mineEmail' })">设置</van-button>
      </van-cell>
      <van-cell
        v-if="isShowGoogleBind"
        title="谷歌验证"
        :class="personalCenterInfo?.GoogleSecret ? 'success' : 'danger'"
        :label="personalCenterInfo?.GoogleSecret ? '已设置' : '尚未设置'"
        @click="router.push({ name: 'mineGoogleCode' })"
      >
        <van-button v-if="!personalCenterInfo?.GoogleSecret" round size="small" type="primary" @click="router.push({ name: 'mineGoogleCode' })">设置</van-button>
      </van-cell>
      <van-cell
        title="QQ号"
        :class="personalCenterInfo?.QQ ? 'success' : 'danger'"
        :label="personalCenterInfo?.QQ ? '已设置' : '尚未设置'"
        @click="router.push({ name: 'mineQQ' })"
      >
        <template #right-icon>
          <van-button
            round
            :plain="!!personalCenterInfo?.QQ"
            size="small"
            type="primary"
            class="px-11"
            @click.stop="router.push({ name: 'mineQQ' })"
          >
            {{ personalCenterInfo?.QQ ? '修改' : '设置' }}
          </van-button>
        </template>
      </van-cell>
    </van-cell-group>
    <div class="px-3 pt-3 flex-1">
      <van-button block round type="primary" @click="handleLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<style scoped>
:deep(.van-cell__title) {
  font-weight: semibold;
  font-size: 14px;
}

/* 已设置 - 绿色 */
:deep(.success .van-cell__label) {
  color: var(--color-success-normal);
}

/* 尚未设置 - 红色 */
:deep(.danger .van-cell__label) {
  color: var(--color-error-normal);
}
:deep(.van-button) {
  padding: 14px 11px;
}
:deep(.van-cell) {
  align-items: center;
}
</style>
