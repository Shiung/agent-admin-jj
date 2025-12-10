<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'
import { rulesRequired } from '@/utils/formRules'

const router = useRouter()

const userStore = useUserStore()
const nickname = ref(userStore.accountInfo?.Name || '')
const loading = ref(false)

const submit = async () => {
  loading.value = true
  try {
    const res = await API.admin.updateName({ Name: nickname.value?.trim() })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }
    showToast('修改成功')
    router.replace({ name: 'mineProfile' })
  } catch (error) {
    console.error('更新失败：', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="代理昵称" />

    <div class="py-3">
      <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
        <AppField
          v-model="nickname"
          name="nickname"
          label-align="top"
          label="代理昵称"
          placeholder="请输入"
          required
          :rules="[rulesRequired()]"
        >
        </AppField>
      </van-form>
    </div>
    <div class="px-4 my-4">
      <van-button block round type="primary" :loading="loading" :disabled="!nickname" @click="submit">提交</van-button>
    </div>
  </div>
</template>

