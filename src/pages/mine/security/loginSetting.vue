<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const personalInfo = computed(() => userStore.accountInfo)

const loginTypeOptions = [
  { label: '允许', value: 1 },
  { label: '禁止', value: 0 }
]

const loginType = ref(1)
const privatePassword = ref('')
const loading = ref(false)

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
onMounted(() => {
  if (personalInfo.value) {
    loginType.value = personalInfo.value.LoginType || 1
  }
})

const submit = async () => {
  console.log(loginType.value, privatePassword.value)
}
</script>

<template>
  <div class="flex flex-col pb-6">
    <NavBar title="登录设置" />
    <div class="py-3">
      <AppField required name="LoginType" label-align="top" label="多设备同时登录" class="radio-field">
        <template #input>
          <div class="radio-group">
            <label
              v-for="option in loginTypeOptions"
              :key="option.value"
              class="radio-item"
            >
              <input
                type="radio"
                :value="option.value"
                v-model="loginType"
                class="radio-input"
              />
              <span class="radio-label">{{ option.label }}</span>
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
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :type="showPassword ? 'text' : 'password'"
              :value="privatePassword"
              class="flex-1 outline-none pl-2.5 bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
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
    </div>
    <div class="px-4">
      <van-button
        block
        round
        type="primary"
        :loading="loading"
        :disabled="!loginType || !privatePassword"
        @click="submit"
      >
        提交
      </van-button>
    </div>
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
  border: 1.5px solid rgba(0, 0, 0, 0.2);
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
    border-color: var(--color-primary-normal);

    &::after {
      background-color: var(--color-primary-normal);
      opacity: 1;
      width: 12px;
      height: 12px;
    }
  }

  &:not(:checked)::after {
    opacity: 1;
    width: 8px;
    height: 8px;
  }
}

.radio-label {
  margin-left: 8px;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-neutral-basic);
  line-height: 24px;
}

:deep(.app-field .van-field__control) {
  padding: 0;
}
:deep(.app-field .van-field__body) {
  padding: 8px !important;
}
</style>
