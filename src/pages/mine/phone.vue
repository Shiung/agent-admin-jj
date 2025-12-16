<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showFailToast } from 'vant'
import NavBar from '@/components/NavBar/index.vue'
import AppField from '@/components/AppField/index.vue'
import Dropdown from '@/components/Dropdown/index.vue'
import API from '@/apis'
import getDeviceId from '@/utils/getDeviceId'
import { rulesRequired } from '@/utils/formRules'

const router = useRouter()
const userStore = useUserStore()
const accountInfo = computed(() => userStore.accountInfo)

const countryCodeOptions = [
  { label: '+86', value: '+86' },
  { label: '+1', value: '+1' },
  { label: '+60', value: '+60' },
  { label: '+65', value: '+65' },
  { label: '+66', value: '+66' },
  { label: '+81', value: '+81' },
  { label: '+82', value: '+82' },
  { label: '+84', value: '+84' },
  { label: '+852', value: '+852' },
  { label: '+853', value: '+853' },
  { label: '+855', value: '+855' },
  { label: '+856', value: '+856' },
  { label: '+886', value: '+886' },
]

// 需要再編輯的話需 parse (api: 86_xxxx)
// const parsePhone = (phone?: string): { countryCode: string; mobile: string } => {
//   if (!phone) return { countryCode: '+86', mobile: '' }
//   const parts = phone.split('_')
//   if (parts.length === 2 && parts[0] && parts[1]) {
//     return {
//       countryCode: `+${parts[0]}`,
//       mobile: parts[1]
//     }
//   }
//   return { countryCode: '+86', mobile: phone }
// }

// const parsedPhone = computed(() => parsePhone(accountInfo.value?.Phone))
// const countryCode = ref<string>(parsedPhone.value.countryCode)
// const mobile = ref<string>(parsedPhone.value.mobile)
const countryCode = ref('+86')
const mobile = ref(accountInfo.value?.Phone || '')
const verificationCode = ref('')
const loading = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)

const canSubmit = computed(() => {
  return mobile.value.trim() && verificationCode.value.trim()
})

// 获取验证码
const getVerificationCode = async () => {
  if (!mobile.value.trim()) {
    return
  }

  if (countdown.value > 0) {
    return
  }

  codeLoading.value = true
  try {
    const res = await API.system.phoneVerify(
      {
        Number: `${countryCode.value.replace('+', '')}_${mobile.value.trim()}`,
        DeviceId: getDeviceId() ?? '',
        OpType: 12
      }
    )
    if (res.data.Code !== 200) {
      console.error(res.data)
      showFailToast(res.data.Msg)
      return
    }

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('获取验证码失败：', error)
    showFailToast(error?.response?.data?.Msg)
  } finally {
    codeLoading.value = false
  }
}

const submit = async () => {
  if (!canSubmit.value) {
    return
  }

  loading.value = true
  try {
    const phoneNumber = `${countryCode.value.replace('+', '')}_${mobile.value.trim()}`
    const res = await API.admin.updatePhone({
      Phone: phoneNumber,
      VerifyCode: verificationCode.value.trim(),
      AreaCode: countryCode.value.replace('+', '')
    })
    if (res.data.Code !== 200) return
    showToast('编辑成功')
    router.replace({ name: 'mineProfile' })
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
    <NavBar title="手机号" />

    <van-form ref="formRef" :trigger="['onBlur', 'onChange']" @submit="submit">
      <!-- 手机号输入 -->
      <AppField
        v-model="mobile"
        name="mobile"
        label-align="top"
        label="手机号"
        placeholder="请输入"
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <div class="flex items-center">
              <Dropdown
                v-model="countryCode"
                :options="countryCodeOptions"
                class="mobile-country-code"
              />
            </div>
            <input
              :value="mobile"
              type="tel"
              class="flex-1 outline-none pl-2.5"
              placeholder="请输入"
              @input="(e: Event) => { mobile = (e.target as HTMLInputElement).value }"
            />
          </div>
        </template>
      </AppField>

      <!-- 验证码输入 -->
      <AppField
        v-model="verificationCode"
        name="verificationCode"
        label-align="top"
        label="验证码"
        placeholder="请输入"
        required
        autocomplete="off"
      >
        <template #input>
          <div class="flex items-center w-full gap-2">
            <input
              :value="verificationCode"
              type="text"
              class="flex-1 outline-none bg-transparent text-base text-neutral-basic placeholder:text-neutral2-fourth"
              placeholder="请输入"
              @input="(e: Event) => { verificationCode = (e.target as HTMLInputElement).value }"
            />
            <van-button
              :loading="codeLoading"
              :disabled="!mobile.trim() || countdown > 0"
              size="small"
              type="primary"
              round
              class="verificationBtn"
              @click.stop="getVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
            </van-button>
          </div>
        </template>
      </AppField>
      <div class="px-4 my-4">
        <van-button
          block
          round
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          @click="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
:deep(.app-field .van-field__control) {
  padding: 0;
}
:deep(.app-field .van-field__body) {
  padding: 8px !important;
}

/* 国家代码选择器样式 */
.mobile-country-code :deep(.dropdown-button) {
  height: auto !important;
  padding: 8px !important;
  border: none !important;
  background: #f8fafd !important;
  min-width: 3.5rem;
}

.mobile-country-code :deep(.dropdown-button:hover),
.mobile-country-code :deep(.dropdown-button[data-state="open"]) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.verificationBtn {
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
