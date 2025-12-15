<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const personalInfo = computed(() => userStore.accountInfo)
const isReady = ref(false)

const goPasswordEdit = () => {
  router.push({ name: 'password' })
}
const goLoginSetting = () => {
  router.push({ name: 'loginSetting' })
}
const goPrivatePassword = () => {
  router.push({ name: 'privatePassword' })
}
// const goGesturePassword = () => {
//   router.push({ name: 'gesturePassword' })
// }
// const gesturePassword = computed(() => {
//   return !!localStorage.getItem('gesturePassword')
// })

onMounted(async () => {
  await userStore.fetchAccountInfo()
})
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="安全设置" :auto-back="false" @back="router.replace({ name: 'mine' })" />
    <div class="py-3">
      <van-cell-group>
        <van-cell title="登录密码">
          <template #label>建议定期更新密码以提升账户安全</template>
          <van-button round plain size="small" type="primary" class="px-11" @click="goPasswordEdit">修改</van-button>
        </van-cell>
        <van-cell title="登录设置">
          <template #label>
            {{ personalInfo?.IsAllowOtherDeviceLogin === 1 ? '允许多设备同时登录' : '禁止多设备同时登录' }}
          </template>
          <van-button round plain size="small" type="primary" class="px-11" @click="goLoginSetting">修改</van-button>
        </van-cell>
        <van-cell title="私人密码" :class="personalInfo?.IsSetPrivatePassword === 1 ? 'success' : 'danger'">
          <template #label>
            <van-skeleton :loading="isReady" :row="1">
              {{ personalInfo?.IsSetPrivatePassword === 1 ? '已设置' : '尚未设置' }}
            </van-skeleton>
          </template>
          <van-button round :plain="personalInfo?.IsSetPrivatePassword === 1" size="small" type="primary" class="px-11" @click="goPrivatePassword">
            {{ personalInfo?.IsSetPrivatePassword === 1 ? '修改' : '设置' }}
          </van-button>
        </van-cell>
        <!-- 暫且隱藏 -->
        <!-- <van-cell title="手势密码" :class="gesturePassword ? 'success' : 'danger'">
          <template #label>
            <van-skeleton :loading="isReady" :row="1">
              {{ gesturePassword ? '已设置' : '尚未设置' }}
            </van-skeleton>
          </template>
          <van-button round :plain="gesturePassword" size="small" type="primary" class="px-11" @click="goGesturePassword">
            {{ gesturePassword ? '修改' : '设置' }}
          </van-button>
        </van-cell> -->
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.success .van-cell__label) {
  color: var(--color-success-normal);
}

:deep(.danger .van-cell__label) {
  color: var(--color-error-normal);
}
:deep(.van-button) {
  padding: 14px 11px;
}
</style>
