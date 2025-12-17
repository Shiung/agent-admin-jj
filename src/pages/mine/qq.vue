<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { rulesRequired } from '@/utils/formRules'
import type { FormInstance } from 'vant'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import API from '@/apis'

const router = useRouter()
const userStore = useUserStore()
const qq = ref(userStore.accountInfo?.QQ || '')
const loading = ref(false)
const formRef = ref<FormInstance | null>(null)

const validateQQ = {
  validator: (value: string) => {
    // 开头不能0，不能为全0，字数最多11位
    if (!/^\d+$/.test(value) || value.startsWith('0') || /^0+$/.test(value) || value.length > 11) {
      return '请输入有效的QQ号码'
    }
    return true
  }
}

const submit = async () => {
  loading.value = true
  formRef.value?.validate().then(async () => {
    try {
    const res = await API.admin.updateQQ({ QQ: qq.value?.trim() })
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
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="QQ号码" />
    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField
        v-model="qq"
        name="qq"
        label-align="top"
        label="QQ号码"
        placeholder="请输入"
        required
        :rules="[rulesRequired(), validateQQ]"
        maxlength="11"
        type="number"
      />
      <div class="px-4 my-4">
        <van-button
          block round type="primary"
          class="gray-disabled"
          :loading="loading"
          :disabled="!qq"
          native-type="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>
