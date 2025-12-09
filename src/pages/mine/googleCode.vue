<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useClipboard } from '@vueuse/core'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'
import type { GoogleValidResponseData } from '@/apis/codegen/data-contracts'
import { rulesRequired } from '@/utils/formRules'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const googleCode = ref('')
const username = ref(userStore.accountInfo?.Username || '')
const { copy, copied } = useClipboard()

watchEffect(() => {
  if (copied.value) {
    showToast({ message: '复制成功' })
  }
})

// 复制密钥
const copySecret = (item: string) => {
  if (!item) return
  copy(item)
}

const nextStep = async () => {
  if (!googleCode.value.trim()) {
    return
  }

  loading.value = true
  try {
    const res = await API.system.googleCode({ Username: username.value })
    if (res.data.Code !== 200) {
      console.error(res.data)
      return
    }
    const data = res.data.Data as GoogleValidResponseData
    userStore.googleSecretCode = {
      Secret: data.Secret,
      QrCode: data.QrCode
    }
    router.push({ name: 'mineGoogleCodeVerify' })
  } catch (error) {
    console.error('获取谷歌验证失败：', error)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="flex flex-col pb-6">
    <NavBar title="谷歌验证器密钥" />
    <div class="py-3">
      <div class="mx-3 my-2 px-3 py-2 bg-bg-floor-1-2 rounded-lg flex items-center">
        <p class="mr-2">💡</p>
        <p class="text-primary-normal text-sm">可以在苹果商店搜索"Google Authenticator"，或安卓商店搜索"Google身份验证器" 下载安装</p>
      </div>
      <AppField
        v-model="googleCode"
        name="googleCode"
        label-align="top"
        label="谷歌验证器密钥"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :value="googleCode"
              type="text"
              class="flex-1 min-w-0 outline-none pl-2.5 truncate"
              @input="(e: Event) => { googleCode = (e.target as HTMLInputElement).value }"
            />
          </div>
        </template>
        <template #right-icon>
          <van-image src="./static/images/promote/copy_lite.png" width="15" height="15" @click="copySecret(googleCode.trim())" />
        </template>
      </AppField>
    </div>
    <div class="px-4">
      <van-button block round type="primary" :loading="loading" :disabled="!googleCode" @click="nextStep">下一步</van-button>
      <span class="block text-xs font-normal my-4" style="color: #6b7190;">
        打开谷歌身份验证器，点选右下角的"+"，选择手动输入密钥，填入任意账户和上述密钥绑定
      </span>
    </div>
  </div>
</template>

<style scoped>
:deep(.van-field__control) {
  display: flex;
  align-items: center;
}

:deep(.van-field__control > div) {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

:deep(.van-field__control input) {
  flex: 1;
  min-width: 0;
}
</style>
