<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const personalInfo = computed(() => userStore.accountInfo)

const goPasswordEdit = () => {
  router.push({ name: 'password' })
}
const goLoginSetting = () => {
  router.push({ name: 'loginSetting' })
}
const goPrivatePassword = () => {
  router.push({ name: 'privatePassword' })
}
const goGesturePassword = () => {
  router.push({ name: 'gesturePassword' })
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="安全设置" />
    <div class="py-3">
      <van-cell-group>
        <van-cell title="登录密码">
          <template #label>
            上次修改日期
          </template>
          <van-button round plain size="small" type="primary" class="px-11" @click="goPasswordEdit">修改</van-button>
        </van-cell>
        <van-cell title="登录设置">
          <template #label>
            {{ personalInfo?.LoginType === 1 ? '允许多设备同时登录' : '禁止多设备同时登录' }}
          </template>
          <van-button round plain size="small" type="primary" class="px-11" @click="goLoginSetting">修改</van-button>
        </van-cell>
        <van-cell title="私人密码">
          <template #label>
            {{ personalInfo?.IsSetPrivatePassword === 1 ? '已设置' : '未设置' }}
          </template>
          <van-button round plain size="small" type="primary" class="px-11" @click="goPrivatePassword">
            {{ personalInfo?.IsSetPrivatePassword === 1 ? '修改' : '设置' }}
          </van-button>
        </van-cell>
        <van-cell title="手势密码">
          <template #label>
            {{ '未设置' }}
          </template>
          <van-button round size="small" type="primary" class="px-11" @click="goGesturePassword">设置</van-button>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>
