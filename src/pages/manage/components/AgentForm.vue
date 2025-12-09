<script setup lang="ts">
import { ref, watch } from 'vue'
import Big from 'big.js'
import type { NetcashmultiListItem } from '@/apis/codegen/data-contracts'
import NavBar from '@/components/NavBar/index.vue'
import { formatMoney } from '@/utils/formatNumber'

interface AgentFormData {
  AdminId?: number
  Username?: string
  Password: string
  ConfirmPassword: string
  Name: string
  CommissionRate: string | number
  Remark: string
}

interface Props {
  isEdit?: boolean
  selectedAgentItem?: NetcashmultiListItem | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'submit', values: AgentFormData): void
  (e: 'close'): void
}>()

const formRef = ref<any>(null) // AppForm instance

const formData = ref<AgentFormData>({
  AdminId: 0,
  Username: '',
  Password: '',
  ConfirmPassword: '',
  Name: '',
  CommissionRate: '',
  Remark: ''
})

// Password visibility toggles
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Initialize data
watch(() => props.selectedAgentItem, (val) => {
  console.log('#####', val)
  formData.value = {
    AdminId: val?.AdminId || 0,
    Username: val?.Username || '',
    Password: '',
    ConfirmPassword: '',
    Name: val?.Name || '',
    CommissionRate: formatMoney(val?.CommissionRate || 0),
    Remark: val?.Remark || ''
  }
}, { immediate: true })

// Validators
const validateRate = (val: string) => {
  const num = parseFloat(val)
  return !isNaN(num) && num >= 0 && num <= 55
}

const validateConfirmPassword = (val: string) => {
  return val === formData.value.Password
}

const onSubmit = () => {
  emit('submit', { ...formData.value, CommissionRate: new Big(formData.value.CommissionRate).times(100).toFixed(0) })
}

</script>

<template>
  <div class="agent-form-page">
    <NavBar
      :title="isEdit ? '编辑代理' : '新增代理'"
      :auto-back="false"
      @back="emit('close')"
    />
    <div class="agent-form-content">
    <AppForm ref="formRef" @submit="onSubmit">
      <!-- 代理帳號 -->
      <AppField
        v-model="formData.Username"
        name="Username"
        :label="isEdit ? '代理账号' : '代理账号'"
        :required="!isEdit"
        :disabled="isEdit"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入代理账号' }]"
      />

      <!-- 密碼 -->
      <AppField
        v-model="formData.Password"
        name="Password"
        :label="isEdit ? '变更密码' : '账号密码'"
        required
        :type="showPassword ? 'text' : 'password'"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入密码' }]"
      >
        <template #right-icon>
          <van-icon
            :name="showPassword ? 'eye-o' : 'closed-eye'"
            @click="showPassword = !showPassword"
          />
        </template>
      </AppField>

      <!-- 確認密碼 -->
      <AppField
        v-model="formData.ConfirmPassword"
        name="ConfirmPassword"
        label="确认密码"
        required
        :type="showConfirmPassword ? 'text' : 'password'"
        placeholder="请输入"
        :rules="[
          { required: true, message: '请输入确认密码' },
          { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
        ]"
      >
        <template #right-icon>
          <van-icon
            :name="showConfirmPassword ? 'eye-o' : 'closed-eye'"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </AppField>

      <!-- 佣金比例 -->
      <AppField
        v-model="formData.CommissionRate"
        name="CommissionRate"
        label="佣金比例%"
        required
        type="number"
        placeholder="请输入"
        :rules="[
          { required: true, message: '请输入佣金比例' },
          { validator: validateRate, message: '请输入0%~55%' }
        ]"
      >
        <template #extra>
          <span class="text-neutral-400">%</span>
        </template>
      </AppField>
      <div class="field-tip">请输入0%~55%</div>

      <!-- 備註 -->
      <AppField
        v-model="formData.Remark"
        name="Remark"
        label="备注"
        type="textarea"
        placeholder="请输入"
        maxlength="100"
        show-word-limit
        :autosize="{ minRows: 3, maxRows: 5 }"
        class="remark-field"
      />

      <!-- 按鈕 -->
      <div class="form-actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          color="var(--color-primary-50)"
        >
          确认
        </van-button>
      </div>
    </AppForm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.agent-form-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.agent-form-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;

  .field-tip {
    font-size: 12px;
    color: #3B82F6; // Blue color from image
    margin-top: 4px;
    margin-bottom: 16px;
    padding-left: 4px;
  }

  .remark-field {
    margin-bottom: 32px;
    &.app-field {
      :deep(.van-field__body) {
        border-radius: 1rem;
      }
    }
  }

  .form-actions {
    margin-top: 24px;
  }
}
</style>
