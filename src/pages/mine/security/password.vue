<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import { useUserStore } from '@/stores/user'
import API from '@/apis'
import { rulesRequired } from '@/utils/formRules'
import type { FormInstance } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance | null>(null)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = {
  old: ref(false),
  new: ref(false),
  confirm: ref(false)
}
const togglePassword = (type: 'old' | 'new' | 'confirm') => {
  showPassword[type].value = !showPassword[type].value
}
const loading = ref(false)

const submit = async () => {
  loading.value = true
  formRef.value?.validate().then(async () => {
    try {
      const res = await API.admin.updateLoginPassword({
        OldPassword: oldPassword.value?.trim(),
        NewPassword: newPassword.value?.trim(),
        ConfirmPassword: confirmPassword.value?.trim(),
      })
      if (res.data.Code !== 200) {
        showFailToast(res.data.Msg)
        return
      }
      showToast('修改成功，请重新登录')
      userStore.logout()
      router.replace({ name: 'login' })
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
    <NavBar title="登录密码" />
    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField
        v-model="oldPassword"
        name="oldPassword"
        label-align="top"
        label="原密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword.old.value ? 'text' : 'password'"
              :value="oldPassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { oldPassword = (e.target as HTMLInputElement).value }"
            />
            <van-icon
              :name="showPassword.old.value ? 'eye-o' : 'closed-eye'"
              class="cursor-pointer"
              @click.stop="togglePassword('old')"
            />
          </div>
        </template>
      </AppField>
      <AppField
        v-model="newPassword"
        name="newPassword"
        label-align="top"
        label="新密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword.new.value ? 'text' : 'password'"
              :value="newPassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { newPassword = (e.target as HTMLInputElement).value }"
            />
            <van-icon
              :name="showPassword.new.value ? 'eye-o' : 'closed-eye'"
              class="cursor-pointer"
              @click.stop="togglePassword('new')"
            />
          </div>
        </template>
      </AppField>
      <AppField
        v-model="confirmPassword"
        name="confirmPassword"
        label-align="top"
        label="确认密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword.confirm.value ? 'text' : 'password'"
              :value="confirmPassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { confirmPassword = (e.target as HTMLInputElement).value }"
            />
            <van-icon
              :name="showPassword.confirm.value ? 'eye-o' : 'closed-eye'"
              class="cursor-pointer"
              @click.stop="togglePassword('confirm')"
            />
          </div>
        </template>
      </AppField>
      <div class="px-4 my-4">
        <van-button block round type="primary" :loading="loading" :disabled="!oldPassword || !newPassword || !confirmPassword" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>
