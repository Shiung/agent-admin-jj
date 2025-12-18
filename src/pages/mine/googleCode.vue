<script setup lang="ts">
import { ref, watch, watchEffect, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useClipboard } from '@vueuse/core'
import { rulesRequired, rulesVerifyCode } from '@/utils/formRules'
import type { GoogleValidResponseData } from '@/apis/codegen/data-contracts'
import type { FormInstance } from 'vant'
import API from '@/apis'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'

const router = useRouter()
const userStore = useUserStore()
const isFetching = ref<boolean>(false)
const isLoading = ref<boolean>(false)

const username = computed(() => userStore.accountInfo?.Username || '')
const googleCode = ref<string>('')
const verificationCode = ref<string>('')
const formRef = ref<FormInstance | null>(null)
const { copy, copied } = useClipboard()

// 暫存，以防頁面重刷，導致重新獲取谷歌驗證碼
const getStorageKey = () => `googleCode_${username.value}`

watchEffect(() => {
  if (copied.value) {
    showToast({ message: '复制成功' })
  }
})

const fetchGoogleCode = async () => {
  if (!username.value || googleCode.value || isFetching.value) return

  const storageKey = getStorageKey()
  const cachedCode = sessionStorage.getItem(storageKey)
  if (cachedCode) {
    googleCode.value = cachedCode
    return
  }

  isFetching.value = true
  try {
    const res = await API.system.googleCode({ Username: username.value })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }

    const data = res.data.Data as GoogleValidResponseData
    googleCode.value = data.Secret
    sessionStorage.setItem(storageKey, data.Secret)
  } catch (error: any) {
    console.error('获取谷歌验证失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    isFetching.value = false
  }
}

watch(username, (newVal) => {
  if (newVal && !googleCode.value && !isFetching.value) {
    fetchGoogleCode()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  // 離開頁面清除暫存
  const storageKey = getStorageKey()
  sessionStorage.removeItem(storageKey)
})

const handleVerificationCodeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')
  verificationCode.value = value.slice(0, 6)
}

const submit = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    await formRef.value?.validate()

    const res = await API.admin.updateGoogleCode({
      Username: username.value,
      Code: verificationCode.value.trim(),
    })

    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }

    showSuccessToast('编辑成功')
    const storageKey = getStorageKey()
    sessionStorage.removeItem(storageKey)
    router.replace({ name: 'mineProfile' })
  } catch (error: any) {
    console.error('更新失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <div class="flex flex-col pb-6">
    <NavBar title="谷歌验证器密钥" />
    <div class="py-3">
      <div class="mx-3 my-2 px-3 py-2 bg-bg-floor-1-2 rounded-lg flex items-center">
        <van-image src="./static/images/common/lightBulb.png" width="32" class="mr-2" />
        <p class="text-primary-normal text-sm">可以在苹果商店搜索"Google Authenticator"，或安卓商店搜索"Google身份验证器" 下载安装</p>
      </div>
      <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
        <AppField v-model="googleCode" name="googleCode" label-align="top" label="谷歌验证器密钥">
          <template #input>
            <div class="flex items-center w-full gap-2">
              <input readonly :value="googleCode" type="text" class="flex-1 min-w-0 outline-none truncate" />
            </div>
          </template>
          <template #right-icon>
            <div class="flex items-center h-full">
              <van-image src="./static/images/promote/copy_lite.png" width="15" height="15" @click="copy(googleCode.trim())" />
            </div>
          </template>
        </AppField>
        <AppField
          v-model="verificationCode"
          name="verificationCode"
          label-align="top"
          label="谷歌验证码"
          placeholder="请输入6位数验证码"
          required
          :rules="[rulesRequired(), rulesVerifyCode()]"
          maxlength="6"
          type="number"
          @input="handleVerificationCodeInput"
        />
        <div class="px-4 my-4">
          <van-button
            block
            round
            type="primary"
            class="gray-disabled"
            native-type="submit"
            :disabled="!verificationCode.trim() || verificationCode.trim().length !== 6" :loading="isLoading"
          >
            提交
          </van-button>
          <span class="block text-xs font-normal my-4" style="color: #6b7190;">
            打开谷歌身份验证器，点选右下角的"+"，选择手动输入密钥，填入任意账户和上述密钥绑定
          </span>
        </div>
      </van-form>
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
