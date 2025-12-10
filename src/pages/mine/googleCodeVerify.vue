<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'
import { rulesRequired } from '@/utils/formRules'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const verificationCode = ref('')
const username = ref(userStore.accountInfo?.Username || '')

onMounted(() => {
  const tempData = userStore.googleSecretCode
  if (!tempData?.Secret || !tempData?.QrCode) {
    router.back()
    return
  }
  userStore.googleSecretCode = null
})

const submit = async () => {
  if (!verificationCode.value.trim()) {
    return
  }

  // 验证码6位数
  if (verificationCode.value.trim().length !== 6 || !/^\d{6}$/.test(verificationCode.value.trim())) {
    return
  }

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
  } catch (error) {
    console.error('更新失败：', error)
    showFailToast('更新失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="谷歌验证" />
    <div class="py-3">
      <AppField
        v-model="verificationCode"
        name="verificationCode"
        label-align="top"
        label="谷歌验证码*"
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
    </div>
    <div class="px-4 my-4">
      <van-button
        block
        round
        type="primary"
        :loading="loading"
        :disabled="!verificationCode.trim() || verificationCode.trim().length !== 6"
        @click="submit"
      >
        提交
      </van-button>
    </div>
  </div>
</template>

