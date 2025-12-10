<!-- src/pages/mine/profile.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar/index.vue'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const personalCenterInfo = computed(() => userStore.accountInfo)
const isLoading = ref(false)
const isReady = computed(() => isLoading.value || !personalCenterInfo.value)

const formatDate = (timestamp: number | string | null | undefined, format = 'YYYY-MM-DD'): string => {
  if (!timestamp) return '-'
  const timestampMs = typeof timestamp === 'string' ? Number(timestamp) : timestamp
  const ms = timestampMs > 1000000000000 ? timestampMs : timestampMs * 1000
  return dayjs(ms).format(format)
}

const handleLogout = () => {
  userStore.logout()
  router.replace({ name: 'login' })
}

const goToNicknameEdit = () => {
  router.push({ name: 'mineNickname' })
}

onMounted(async () => {
  await userStore.fetchAccountInfo()
})
</script>

<template>
  <div class="flex flex-col pb-6">
    <!-- NavBar -->
    <NavBar title="个人资料" />
    <van-cell-group>
      <van-cell title="代理账号">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.Username }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell
        title="代理昵称"
        @click="goToNicknameEdit"
      >
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.Name }}
          </van-skeleton>
        </template>
        <template #right-icon>
          <van-button
            round
            :plain="!!personalCenterInfo?.Name"
            size="small"
            type="primary"
            class="px-11"
            @click.stop="goToNicknameEdit"
          >
            {{ personalCenterInfo?.Name ? '修改' : '设置' }}
          </van-button>
        </template>
      </van-cell>
      <van-cell title="真实姓名">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.RealName }}
          </van-skeleton>
        </template>
        <van-button v-if="!personalCenterInfo?.RealName" round size="small" type="primary" class="px-11" @click="router.push({ name: 'mineRealName' })">设置</van-button>
      </van-cell>
      <van-cell title="注册日期">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ formatDate(personalCenterInfo?.CreateTime) }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell title="登录次数">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.Count }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell title="最近登录">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.Ip }} / {{ personalCenterInfo?.Address }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell title="佣金比例">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ ((Number(personalCenterInfo?.CommissionRateStr) || 0) / 100) + '%' }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell title="佣金周期">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.SettlementType === 1 ? '日结' : personalCenterInfo?.SettlementType === 2 ? '周结' : '月结' }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell title="上级代理">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.ParentUsername || '-' }}
          </van-skeleton>
        </template>
      </van-cell>
      <van-cell title="手机号">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.Phone || '尚未设置' }}
          </van-skeleton>
        </template>
        <template #right-icon>
          <van-button v-if="!personalCenterInfo?.Phone" round size="small" type="primary" class="px-11" @click="router.push({ name: 'minePhone' })">设置</van-button>
        </template>
      </van-cell>
      <van-cell title="邮箱地址">
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.Email || '尚未设置' }}
          </van-skeleton>
        </template>
        <van-button v-if="!personalCenterInfo?.Email" round size="small" type="primary" @click="router.push({ name: 'mineEmail' })">设置</van-button>
      </van-cell>
      <van-cell
        title="谷歌验证"
        :class="personalCenterInfo?.GoogleSecret ? 'success' : 'danger'"
      >
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.GoogleSecret ? '已设置' : '尚未设置' }}
          </van-skeleton>
        </template>
        <van-button v-if="!personalCenterInfo?.GoogleSecret" round size="small" type="primary" @click="router.push({ name: 'mineGoogleCode', query: { Username: personalCenterInfo?.Username } })">设置</van-button>
      </van-cell>
      <van-cell
        title="QQ号"
        :class="personalCenterInfo?.QQ ? 'success' : 'danger'"
      >
        <template #label>
          <van-skeleton :loading="isReady" :row="1">
            {{ personalCenterInfo?.QQ ? '已设置' : '尚未设置' }}
          </van-skeleton>
        </template>
        <template #right-icon>
          <van-button v-if="!personalCenterInfo?.QQ" round size="small" type="primary" @click="router.push({ name: 'mineQQ' })">设置</van-button>
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
</style>
