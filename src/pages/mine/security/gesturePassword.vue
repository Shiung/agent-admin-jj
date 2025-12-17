<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import { rulesRequired } from '@/utils/formRules'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loginPassword = ref('')
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
const submit = async () => {
  router.push({ name: 'gesture' })
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="手势密码" />
    <router-view v-if="route.name === 'gesture'" />
    <div v-else>
      <div class="mx-3 my-2 px-3 py-2 bg-bg-floor-1-2 rounded-lg flex items-center">
        <van-image src="./static/images/common/lightBulb.png" class="mx-2" width="24" />
        <p class="text-primary-normal text-sm">请输入登录密码进行验证</p>
      </div>
      <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
        <AppField
          v-model="loginPassword"
          name="loginPassword"
          label="登入密码"
          label-align="top"
          placeholder="请输入"
          required
          :rules="[rulesRequired()]"
        >
          <template #input>
            <div class="flex items-center w-full gap-2">
              <input
                :value="loginPassword"
                :type="showPassword ? 'text' : 'password'"
                class="flex-1 min-w-0 outline-none truncate"
                placeholder="请输入"
                @input="(e: Event) => { loginPassword = (e.target as HTMLInputElement).value }"
              />
              <van-icon
                :name="showPassword ? 'eye-o' : 'closed-eye'"
                class="cursor-pointer"
                @click.stop="togglePassword"
              />
            </div>
          </template>
        </AppField>
        <div class="px-4 my-4">
          <van-button block round type="primary" :disabled="!loginPassword" class="gray-disabled" native-type="submit">提交</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
