<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'
import { getWithdrawAccountName, hidePhoneNumber, hideEmail } from '@/utils/finance'
import { rulesRequired, rulesTRC20, rulesERC20, rulesEBPay, rulesBankCard, rulesTelephoneOrMail, rulesVerifyCode } from '@/utils/formRules'
import getDeviceId from '@/utils/getDeviceId'
import { opTypeConf } from '@/consts/constant'
import API from '@/apis'

import { type FormInstance } from 'vant'
import { type ListItem } from '../components/payTypeList.vue'
import SelectBox from './selectBox.vue'

const globalStore = useGlobalStore()
const userStore = useUserStore()

interface Props {
  show: boolean
  selectPayTypeItem: ListItem
  currencyNameMap: Record<string, { [key: string]: any }[]>
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  currencyNameMap: () => ({})
})

const emit = defineEmits<{
  'update:show': [value: boolean],
  'reloadAccountList': []
}>()

const formDataRef = ref<FormInstance | null>(null)
interface FormData {
  /** 銀行/支付寶賬號 */
  BankCardNum?: string
  /** 持卡人 */
  RealName?: string
  /** 銀行代碼 */
  BankCode?: string
  /** 銀行名稱 */
  Name?: string

  /** 別名 */
  DigitalAlias?: string
  /** 虛擬幣地址 */
  DigitalAddress?: string
  /** 虛擬幣協議 */
  CryptoCurrencyConfigId?: number | null

  /** 驗證方式 */
  ValidType: number | null
  /** 驗證碼 */
  Code: string
}
const initFormData = (): FormData => ({
  BankCardNum: '',
  RealName: '',
  BankCode: '',
  Name: '',
  DigitalAlias: '',
  DigitalAddress: '',
  CryptoCurrencyConfigId: null,
  ValidType: null,
  Code: ''
})
const formData = ref<FormData>(initFormData())

const adminInfo = computed(() => {
  return userStore.userInfo?.Admin || {}
})

watch(
  () => props.show,
  newValue => {
    if (!newValue) return
    formData.value = initFormData()

    if (!formData.value.CryptoCurrencyConfigId) {
      formData.value.CryptoCurrencyConfigId = cryptoCurrencyConfigList?.value[0]
    }

    if (!formData.value.ValidType && verifyList.value[0]) {
      formData.value.ValidType = verifyList.value[0]?.value
    }

    nextTick(() => {
      formDataRef.value?.resetValidation()
    })
  }
)

const cryptoCurrencyConfigList = computed(() => {
  if (!props.selectPayTypeItem.ProtocolType) return []
  const ProtocolType = props.selectPayTypeItem.ProtocolType.split(',').map((item: string) => Number(item))
  return ProtocolType
})
const protocolTypeMap = computed(() => {
  const map = props.currencyNameMap[props.selectPayTypeItem.CurrencyName]
  return map?.reduce((acc, cur) => {
    acc[cur.Id] = cur
    return acc  
  }, {})
})
const handleChangeCryptoCurrencyConfigId = (_id: number) => {
  if (formData.value.DigitalAddress) {
    nextTick(() => {
      formDataRef.value?.validate('DigitalAddress')
    })
  }
}

const bankCodeOptions = computed(() => {
  const list = globalStore.configInfo?.BankList
  if (!list) return []
  return list.map(it => {
    return {
      label: it.BankName,
      value: it.BankCode
    }
  })
})
const bankCodeMap = computed(() => {
  return bankCodeOptions.value.reduce((acc, cur) => {
    acc[cur.value] = cur
    return acc
  }, {} as {[key: string]: { label: string, value: string }})
})
const handleChangeBankCode = (value: any) => {
  if (!bankCodeMap.value[value]) return
  formData.value.Name = bankCodeMap.value[value].label
}

interface VerifyItem {
  text: string
  value: number
}
const verifyList = computed((): VerifyItem[] => {
  if (!globalStore.systemConfig) return []
  const list = []
  if (globalStore.systemConfig?.PhoneVerify) list.push({ text: '手机', value: 0 })
  if (globalStore.systemConfig?.EmailVerify) list.push({ text: '邮箱', value: 1 })
  if (globalStore.systemConfig?.GoogleVerify) list.push({ text: '谷歌', value: 2 })
  return list
})
const verifyMapping = computed(() => {
  return verifyList.value.reduce((acc: Record<any, VerifyItem>, cur) => {
    acc[cur.value] = cur
    return acc
  }, {})
})
watch(
  () => formData.value.ValidType,
  newValue => {
    if (newValue === null) return
    switch(newValue) {
      case 0:
        setVerifyCodeInterval(true, STORAGE_KEYS.phone)
        break
      case 1:
        setVerifyCodeInterval(true, STORAGE_KEYS.email)
        break
    }
  },
  { immediate: true }
)

const codeText = ref<string>('获取验证码')
const codeDisabled = ref<boolean>(false)
/** 獲取驗證碼倒計時 */
const verifyCodeInterval = ref<ReturnType<typeof setInterval> | null>(null)
/** 等待驗證碼結束時間戳 */
const verifyTimeEnd = ref<number | null>(null)
const COUNTDOWN = 60 * 1000
const STORAGE_KEYS = {
  phone: 'verifyPhoneTimeEnd',
  email: 'verifyEmailTimeEnd',
} as const
const handleSendVerifyCode = async () => {
  if (formData.value.ValidType === null) return

  if (formData.value.ValidType === 0 && !adminInfo.value.Mobile) 
    return showToast({ message: '尚未绑定手机号', position: 'top' })
  if (formData.value.ValidType === 1 && !adminInfo.value.Email) 
    return showToast({ message: '尚未绑定邮箱地址', position: 'top' })

  const baseParams = {
    DeviceId: getDeviceId() ?? '',
    OpType: opTypeConf.PAYMENT_VALID,
  }
  
  const fetchValidCode = {
    0: () => API.system.sendPhoneVerifyCode({ ...baseParams, Number: adminInfo.value.Mobile }),
    1: () => API.system.sendEmailVerifyCode({ ...baseParams, Email: adminInfo.value.Email }),
  }[formData.value.ValidType]
  if (!fetchValidCode) return

  const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  try {
    const res = await fetchValidCode()
    if (res.data.Code !== 200) return
    showToast({ message: '验证码已发送,请注意查收!', position: 'top' })

    const checkStorageKey = 
      (formData.value.ValidType === 0 && STORAGE_KEYS.phone) || 
      (formData.value.ValidType === 1 && STORAGE_KEYS.email)
    if (!checkStorageKey) return
    localStorage.removeItem(checkStorageKey)
    setVerifyCodeInterval(false, checkStorageKey)
  } finally {
    loading.close()
  }
}
const getStorageTimeEnd = (key: string) => {
  const storageTimeEnd = localStorage.getItem(key)
  if (!storageTimeEnd) return null
  if (Number(storageTimeEnd) < Date.now()) {
    localStorage.removeItem(key)
    return null
  }
  return Number(storageTimeEnd)
}
const setVerifyCodeInterval = (onlyCheck = false, key?: string) => {
  verifyCodeInterval.value && clearInterval(verifyCodeInterval.value)
  const storageTimeEnd = key ? getStorageTimeEnd(key) : null
  if (storageTimeEnd) {
    // storage有紀錄
    verifyTimeEnd.value = storageTimeEnd
  } else {
    // storage沒紀錄且只檢查, 重置狀態
    if (onlyCheck) {
      codeText.value = '获取验证码'
      codeDisabled.value = false
      return
    }
    // storage沒紀錄, 寫入紀錄
    verifyTimeEnd.value = Date.now() + COUNTDOWN
    key && localStorage.setItem(key, verifyTimeEnd.value.toString())
  }

  const updateState = () => {
    const now = Date.now()
    if (!verifyTimeEnd.value || verifyTimeEnd.value <= now) {
      // 過期
      verifyCodeInterval.value && clearInterval(verifyCodeInterval.value)
      codeText.value = '获取验证码'
      codeDisabled.value = false
    } else {
      const sec = Math.max(0, Math.floor((verifyTimeEnd.value - now) / 1000))
      codeText.value = `${sec} S 后获取`
      codeDisabled.value = true
    }
  }
  updateState()
  verifyCodeInterval.value = setInterval(updateState, 1000)
}

const isConfirmDisabled = computed(() => {
  return props.selectPayTypeItem.IsCrypto 
    ? (
      !formData.value.DigitalAlias || 
      !formData.value.DigitalAddress || 
      formData.value.ValidType === null || 
      !formData.value.Code
    ) : (
      !formData.value.BankCardNum || 
      !formData.value.RealName || 
      (props.selectPayTypeItem.PayType === 1001 && !formData.value.BankCode) || 
      formData.value.ValidType === null || 
      !formData.value.Code
    )
})

const handleAddAccountCancel = () => {
  emit('update:show', false)
}
const handleAddAccountConfirm = async () => {
  formDataRef.value?.validate().then(async () => {
    const loading = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
    try {
      let res
      if (props.selectPayTypeItem.IsCrypto) {
        const params = {
          DigitalAlias: formData.value.DigitalAlias!,
          DigitalAddress: formData.value.DigitalAddress!,
          CryptoCurrencyConfigId: formData.value.CryptoCurrencyConfigId!,
          ValidType: formData.value.ValidType!,
          Code: formData.value.Code,
        }
        res = await API.finance.addCryptoAccount(params)
      } else {
        const params = {
          Type: props.selectPayTypeItem!.PayType! === 1001 ? 0 : 1,
          BankCardNum: formData.value.BankCardNum!,
          ...(props.selectPayTypeItem!.PayType! === 1001 && { BankCode: formData.value.BankCode! }),
          ...(props.selectPayTypeItem!.PayType! === 1001 && { Name: formData.value.Name! }),
          RealName: formData.value.RealName!,
          ValidType: formData.value.ValidType!,
          Code: formData.value.Code,
        }
        res = await API.finance.addBankCardAccount(params)
      }
      if (res.data.Code !== 200) return
      showToast({ message: '新增成功', position: 'top' })
      emit('reloadAccountList')
      emit('update:show', false)
    } finally {
      loading.close()
    }
  }).catch((err) => {
    console.log('validate error', err)
  })
}

onMounted(() => {
  setVerifyCodeInterval(true)
})
onUnmounted(() => {
  verifyCodeInterval.value && clearInterval(verifyCodeInterval.value)
})
</script>

<template>
  <BottomPopup 
    :show="show" 
    :title="`添加${getWithdrawAccountName(selectPayTypeItem.PayType ?? 0)}账号`"
    confirmText="绑定"
    :confirmDisabled="isConfirmDisabled"
    @cancel="handleAddAccountCancel"
    @confirm="handleAddAccountConfirm"
  >
    <van-form ref="formDataRef" :trigger="['onBlur', 'onChange']" @submit="handleAddAccountConfirm">
      <!-- 虛擬幣 -->
      <template v-if="props.selectPayTypeItem.IsCrypto">
        <AppField 
          v-model="formData.DigitalAlias" 
          name="DigitalAlias" 
          label="别名" 
          placeholder="请输入" 
          maxlength="40"
          clearable 
          required 
          :rules="[rulesRequired()]" 
        />
        <AppField 
          v-model="formData.DigitalAddress" 
          name="DigitalAddress" 
          label="虚拟币地址" 
          placeholder="请输入" 
          clearable 
          required 
          :rules="[
            rulesRequired(),
            ...(formData.CryptoCurrencyConfigId === 1 ? [rulesTRC20()] : []),
            ...(formData.CryptoCurrencyConfigId === 2 ? [rulesERC20()] : []),
            ...(formData.CryptoCurrencyConfigId === 4 ? [rulesEBPay()] : []),
          ]" 
        />
        <FormField label="虚拟币种类" required>
          <template #input>
            <SelectBox class="justify-center" checked>
              <div class="text-xs line-clamp-2">{{ selectPayTypeItem.CurrencyName }}</div>
            </SelectBox>
          </template>
        </FormField>
        <FormField 
          v-model="formData.CryptoCurrencyConfigId" 
          name="CryptoCurrencyConfigId" 
          label="虚拟币协议" 
          required
          :rules="[rulesRequired()]"
        >
          <template #input>
            <van-radio-group v-model="formData.CryptoCurrencyConfigId" class="gap-2" direction="horizontal" @change="handleChangeCryptoCurrencyConfigId">
              <SelectBox
                v-for="item in cryptoCurrencyConfigList"
                :key="`CryptoCurrency${item}`"
                class="justify-center"
                :name="item"
              >
                <div class="text-xs line-clamp-2">{{ protocolTypeMap?.[item].I18nKey }}</div>
              </SelectBox>
            </van-radio-group>
          </template>
        </FormField>
      </template>
      <!-- 銀行卡/支付寶 -->
      <template v-else>
        <AppField 
          v-model="formData.BankCardNum" 
          name="BankCardNum" 
          :label="props.selectPayTypeItem!.PayType === 1001 ? '银行卡号' : '支付宝账号'" 
          placeholder="请输入" 
          clearable 
          required 
          :rules="[
            rulesRequired(),
            ...(props.selectPayTypeItem!.PayType === 1001 ? [rulesBankCard()] : []),
            ...(props.selectPayTypeItem!.PayType === 1002 ? [rulesTelephoneOrMail()] : []),
          ]" 
        />
        <AppField 
          v-model="formData.RealName" 
          name="RealName" 
          :label="props.selectPayTypeItem!.PayType === 1001 ? '持卡人' : '账户名称'" 
          placeholder="请输入" 
          clearable 
          required 
          :rules="[rulesRequired()]" 
        />
        <FormField
          v-if="props.selectPayTypeItem!.PayType === 1001"
          v-model="formData.BankCode" 
          name="BankCode" 
          label="银行名称" 
          required
          :rules="[rulesRequired()]"
          @change="handleChangeBankCode"
        >
          <template #input>
            <Dropdown v-model="formData.BankCode!" class="dropDownCus" menuClass="!max-h-72" :options="bankCodeOptions" />
          </template>
        </FormField>
      </template>
      <FormField 
        v-model="formData.ValidType" 
        name="ValidType" 
        label="验证方式" 
        required
        :rules="[rulesRequired()]"
      >
        <template #input>
          <van-radio-group v-model="formData.ValidType" class="gap-2" direction="horizontal">
            <SelectBox
              v-for="item in verifyList"
              :key="`Verify${item.value}`"
              class="justify-center"
              :name="item.value"
            >
              <div class="text-xs line-clamp-2">{{ item.text }}</div>
            </SelectBox>
          </van-radio-group>
        </template> 
      </FormField>
      <AppField 
        v-if="formData.ValidType === 0"
        name="Mobile" 
        label="手机号码" 
        placeholder="请输入" 
        required 
        disabled 
      >
        <template #input>
          {{ hidePhoneNumber(adminInfo.Mobile) }}
        </template>
      </AppField>
      <AppField 
        v-if="formData.ValidType === 1"
        name="Email" 
        label="邮箱地址" 
        placeholder="请输入" 
        required 
        disabled 
      >
        <template #input>
          {{ hideEmail(adminInfo.Email) }}
        </template>
      </AppField>
      <AppField 
        v-model="formData.Code" 
        name="Code"  
        placeholder="请输入" 
        type="password"
        maxlength="24"
        clearable 
        required 
        :rules="[rulesRequired(), rulesVerifyCode()]" 
      >
        <template #label>
          {{ formData.ValidType !== null ? verifyMapping[formData.ValidType]?.text : '' }}验证码
        </template>
        <template #button>
          <van-button 
            v-if="formData.ValidType === 0 || formData.ValidType === 1" 
            :disabled="codeDisabled" 
            :class="{'w-22': codeDisabled}"
            type="primary" 
            round 
            size="small" 
            @click.stop="handleSendVerifyCode"
          >
            {{ codeText }}
          </van-button>
        </template>
      </AppField>
    </van-form>
  </BottomPopup>
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