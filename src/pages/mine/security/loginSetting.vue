<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import { rulesRequired } from '@/utils/formRules'
import { useUserStore } from '@/stores/user'
import API from '@/apis'

const router = useRouter()
const userStore = useUserStore()
const personalInfo = computed(() => userStore.accountInfo)

const allowOtherDeviceLoginOptions = [
  { label: '允许', value: 1 },
  { label: '禁止', value: 0 }
]

const isAllowOtherDeviceLogin = ref(personalInfo.value?.IsAllowOtherDeviceLogin ?? 1)
const privatePassword = ref('')
const loading = ref(false)

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const submit = async () => {
  loading.value = true
  try {
    const res = await API.admin.updateLoginSetting({
      LoginType: 1,
      PrivatePassword: privatePassword.value,
      IsAllowOtherDeviceLogin: isAllowOtherDeviceLogin.value,
      TimeFreeVerification: 0,
    })
    if (res.data.Code !== 200) {
      showFailToast(res.data.Msg)
      return
    }
    showToast('修改成功')
    router.push({ name: 'security' })
  } catch (error: any) {
    console.error('更新失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="登录设置" />
    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <AppField required name="isAllowOtherDeviceLogin" label-align="top" label="多设备同时登录" class="radio-field">
        <template #input>
          <div class="radio-group">
            <label
              v-for="option in allowOtherDeviceLoginOptions"
              :key="option.value"
              class="radio-item"
            >
              <input
                v-model="isAllowOtherDeviceLogin"
                type="radio"
                :value="option.value"
                class="radio-input"
              />
              <span class="ml-2">{{ option.label }}</span>
            </label>
          </div>
        </template>
      </AppField>
      <AppField
        v-model="privatePassword"
        name="PrivatePassword"
        label-align="top"
        label="私人密码"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword ? 'text' : 'password'"
              :value="privatePassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="请输入"
              @input="(e: Event) => { privatePassword = (e.target as HTMLInputElement).value }"
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
        <van-button
          block
          round
          type="primary"
          :loading="loading"
          native-type="submit"
          :disabled="!privatePassword"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped lang="scss">
:deep(.radio-field .van-field__body) {
  border: none;
  padding: 0;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 50px;
  width: 100%;
  padding: 12px 0;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.radio-input {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  background-color: transparent;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:checked {
    border-width: 2px;
    border-color: var(--color-primary-normal);

    &::after {
      background-color: var(--color-primary-normal);
      opacity: 1;
      width: 9px;
      height: 9px;
    }
  }

  &:not(:checked)::after {
    opacity: 0;
  }
}

:deep(.app-field .van-field__control) {
  padding: 0;
}
:deep(.app-field .van-field__body) {
  padding: 8px !important;
}
</style>
