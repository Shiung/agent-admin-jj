<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useClipboard } from '@vueuse/core'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'
import type { GoogleValidResponseData } from '@/apis/codegen/data-contracts'
import { rulesRequired } from '@/utils/formRules'
import type { FormInstance } from 'vant'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const googleCode = ref('')
const username = ref(userStore.accountInfo?.Username || '')
const verificationCode = ref('')
const formRef = ref<FormInstance | null>(null)
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

const fetchGoogleCode = async () => {
  loading.value = true
  try {
    const res = await API.system.googleCode({ Username: username.value })
    if (res.data.Code !== 200) {
      console.error(res.data)
      showFailToast(res.data.Msg)
      return
    }
    const data = res.data.Data as GoogleValidResponseData
    googleCode.value = data.Secret
  } catch (error: any) {
    console.error('获取谷歌验证失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchGoogleCode()
})

const submit = async () => {
  formRef.value?.validate().then(async () => {
    try {
      const res = await API.admin.updateGoogleCode({
        Username: username.value,
        Code: verificationCode.value.trim(),
      })
      if (res.data.Code !== 200) {
        showFailToast(res.data.Msg)
        return
      }
      showToast('编辑成功')
      router.replace({ name: 'mineProfile' })
    } catch (error: any) {
      console.error('更新失败：', error)
      showFailToast(error?.response?.data?.Msg)
    } finally {
      loading.value = false
    }
  })

  loading.value = true
  try {
    const res = await API.admin.updateGoogleCode({
      Username: username.value,
      Code: verificationCode.value.trim(),
    })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }
    showToast('修改成功')
    router.replace({ name: 'mineProfile' })
  } catch (error: any) {
    showFailToast(error?.response?.data?.Msg)
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
        <van-image src="./static/images/common/lightBulb.png" class="mx-2" width="24" />
        <p class="text-primary-normal text-sm">可以在苹果商店搜索"Google Authenticator"，或安卓商店搜索"Google身份验证器" 下载安装</p>
      </div>
      <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
        <AppField
          v-model="googleCode"
          name="googleCode"
          label-align="top"
          label="谷歌验证器密钥"
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
        <AppField
          v-model="verificationCode"
          name="verificationCode"
          label-align="top"
          label="谷歌验证码"
          placeholder="请输入6位数验证码"
          required
          :rules="[rulesRequired()]"
          :maxlength="6"
          type="number"
        >
          <template #input>
            <input
              :value="verificationCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              class="flex-1 outline-none bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入6位数验证码"
              maxlength="6"
              @input="(e: Event) => {
                const value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
                verificationCode = value.slice(0, 6)
              }"
            />
          </template>
        </AppField>
        <div class="px-4 my-4">
          <van-button block round type="primary" :loading="loading" :disabled="!verificationCode.trim() || verificationCode.trim().length !== 6" native-type="submit">提交</van-button>
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
