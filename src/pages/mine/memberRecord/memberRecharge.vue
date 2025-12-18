<!-- 會員充值 -->
<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMemberRechargeStore } from '@/stores/memberRecharge'
import { rulesRequired, rulesPositiveIntegerNumber } from '@/utils/formRules'
import { type CreateMemberRechargeOrderFormData } from '@/apis/codegen/data-contracts'
import Big from 'big.js'
import API from '@/apis'

import { type FormInstance, type UploaderFileListItem } from 'vant'
import type ImageUpload from '@/components/ImageUpload/index.vue'

const router = useRouter()
const userStore = useUserStore()
const useMemberRecharge = useMemberRechargeStore()

const goRecord = () => {
  router.push({ name: 'memberRechargeRecord' })
}

const formDataRef = ref<FormInstance | null>(null)
const initFormData = (): CreateMemberRechargeOrderFormData => ({
  PackageName: '',
  LoginAccount: '',
  PlayerId: 0,
  ImageUrls: '',
  NotifyRoomId: 0
})
const formData = ref<CreateMemberRechargeOrderFormData>(initFormData())
/** 上傳憑證資料 */
const ImageFileList = ref<UploaderFileListItem[]>([])

const productPackageOptions = computed(() => {
  if (!userStore.productPackages) return []
  return userStore.productPackages.map((item) => {
    return {
      label: item.PackageName,
      value: item.PackageName
    }
  })
})
watch(
  () => userStore.productPackages,
  (newVal) => {
    if (newVal && newVal[0] && formData.value.PackageName === '') {
      formData.value.PackageName = newVal[0].PackageName
    }
  },
  { deep: true, immediate: true }
)

const getWhatsAppGroupList = async () => {
  try {
    const params = {
      Page: 1,
      PageSize: 100,
      GroupType: 5,
      BotStatus: 3
    }
    await useMemberRecharge.fetchWhatsAppGroupList(params)
    if (!useMemberRecharge.whatsAppGroupList[0]) return 
    formData.value.NotifyRoomId = useMemberRecharge.whatsAppGroupList[0].Id
  } catch (err) {
    console.log("err", err)
  }
}
const notifyRoomIdOptions = computed(() => {
  if (!useMemberRecharge.whatsAppGroupList) return []
  return useMemberRecharge.whatsAppGroupList.map((item) => {
    return {
      label: item.Title,
      value: item.Id
    }
  })
})

const isCheckingLoginAccount = ref<boolean>(false)
const loginAccountPass = ref<boolean>(false)
const loginAccountError = ref<string>('')
/** 檢查帳號 */
const checkLoginAccount = async () => {
  loginAccountPass.value = false
  if (!formData.value.PackageName || !formData.value.LoginAccount) { 
    loginAccountError.value = ''
    return
  }

  isCheckingLoginAccount.value = true
  formData.value.PlayerId = 0
  try {
    const params = {
      LoginAccount: formData.value.LoginAccount,
      PackageName: formData.value.PackageName
    }
    const res = await API.memberRecharge.getPlayerByLoginAccount(params)
    if (res.data.Code !== 200) return
    loginAccountPass.value = true
    loginAccountError.value = ''
    formData.value.PlayerId = res.data.Data.PlayerId
  } catch (err) {
    loginAccountError.value = '无此会员帐号'
  } finally {
    isCheckingLoginAccount.value = false
    nextTick(() => {
      formDataRef.value?.validate('LoginAccount')
    })
  }
}

const ImageUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null)
const handleChangeImageUrls = (newVal: string[]) => {
  formData.value.ImageUrls = newVal.length === 0 ? '' : newVal.join(',')
}

const submitDisabled = computed(() => {
  return Object.values(formData.value).some((item) => {
    if (Array.isArray(item)) return item.length === 0
    return !item
  }) || !loginAccountPass.value
})
const handleMemberRechargeConfirm = () => {
  formDataRef.value?.validate().then(async () => {
    const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
    try {
      const params = {
        ...formData.value,
        Amount: new Big(formData.value.Amount ?? 0).times(100).toNumber(),
      }
      const res = await API.memberRecharge.createMemberRechargeOrder(params)
      if (res.data.Code !== 200) return
      showToast({ message: '提交成功', position: 'top' })
      formData.value = initFormData()
      ImageFileList.value = []
      ImageUploadRef.value?.cleanUrls()
    } finally {
      loading.close()
    }
  }).catch((err) => {
    console.log('validate error', err)
  })
}

onMounted(() => {
  allowMultipleToast()
  getWhatsAppGroupList()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <NavBar title="会员充值" showDetail @detailClick="goRecord" />
    <van-form ref="formDataRef" :trigger="['onBlur', 'onChange']" @submit="handleMemberRechargeConfirm">
      <FormField 
        v-model="formData.PackageName" 
        name="PackageName" 
        label="产品包" 
        required 
        :rules="[rulesRequired()]"
      >
        <template #input>
          <Dropdown 
            v-model="formData.PackageName" 
            class="dropDownCus" 
            :options="productPackageOptions" 
            :disabled="isCheckingLoginAccount" 
            @change="checkLoginAccount" 
          />
        </template>
      </FormField>
      <AppField 
        v-model="formData.LoginAccount" 
        name="LoginAccount" 
        label="会员账号" 
        clearable 
        disableSpace
        required 
        :disabled="isCheckingLoginAccount"
        :rules="[
          rulesRequired(),
          ...(loginAccountError.length > 0 ? [{ validator: () => loginAccountError }] : [])
        ]" 
        @blur="checkLoginAccount"
      >
        <template #right-icon>
          <div class="flex items-center justify-center">
            <van-image v-if="formData.LoginAccount && loginAccountPass" src="./static/images/common/success.svg" fit="contain" class="size-4.5" />
            <van-image v-if="loginAccountError" src="./static/images/common/error.svg" fit="contain" class="size-4.5" />
          </div>
        </template>
      </AppField>
      <AppField 
        v-model="formData.Amount" 
        name="Amount" 
        label="充值金额" 
        type="number"
        clearable 
        disableSpace
        required 
        :rules="[rulesRequired(), rulesPositiveIntegerNumber({ message: '请输入正确的金额' })]" 
      />
      <FormField 
        v-model="formData.ImageUrls"
        name="ImageUrls" 
        label="上传凭证" 
        required 
        :rules="[rulesRequired()]"
      >
        <template #input>
          <ImageUpload 
            v-model="ImageFileList" 
            ref="ImageUploadRef"
            :max-count="5"
            @change="handleChangeImageUrls"
          />
        </template>
      </FormField>
      <FormField 
        v-model="formData.NotifyRoomId"
        name="NotifyRoomId" 
        label="通知群组" 
        required 
        :rules="[rulesRequired()]"
      >
        <template #input>
          <Dropdown v-model="formData.NotifyRoomId" class="dropDownCus" :options="notifyRoomIdOptions" />
        </template>
      </FormField>
      <div class="mt-4 mx-4 mb-8">
        <van-button type="primary" round block native-type="submit" :disabled="submitDisabled" class="!h-12 !text-base font-semibold gray-disabled">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style lang="scss" scoped>
:deep(.dropDownCus) {
  height: calc(var(--spacing) * 12);
  padding: calc(var(--spacing) * 3);
  font-weight: 400;
  font-size: 1rem;
  box-shadow: none;
}
</style>