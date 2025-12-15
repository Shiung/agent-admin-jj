<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { rulesRequired } from '@/utils/formRules'
import { cn } from '@/utils/className'
import API from '@/apis/index'

import type { UploaderFileListItem, FormInstance } from 'vant'
import type ImageUpload from '@/components/ImageUpload/index.vue'

const userStore = useUserStore()

const showInfo = ref<boolean>(false)

const loading = ref<ReturnType<typeof showLoadingToast> | null>(null)

const loadingHandler = (type: 'open' | 'close') => {
  if (type === 'open') {
    loading.value = showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  }

  if (type === 'close') {
    loading.value?.close()
    loading.value = null
  }
}

const formDataRef = ref<FormInstance | null>(null)
const loginAccount = ref<string>('')
const selectProd = ref<number | null>(null)
const hasDropDownError_prod = ref<boolean>(false)
const bindChannelId = ref<string>('')
const hasDropDownError_channelId = ref<boolean>(false)
const guidUrl = ref<string>('')
const platform = ref<string>('')
const hasDropDownError_platform = ref<boolean>(false)
const note = ref<string>()
const imageUrls = ref<string>()
const ImageFileList = ref<UploaderFileListItem[]>([])
const ImageUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null)

const applyPlayer = ref<Awaited<ReturnType<typeof API.playerManage.getApplycheck>>['data']['Data']['Items'][number] | null>(null)
const channelLs = ref<Awaited<ReturnType<typeof API.playerManage.getPlayerchannelv2>>['data']['Data']['Items']>([])

const findMember = computed(() => !!applyPlayer.value)

const prodOptions = computed<Array<{ label: string, value: number }>>(() => {
  return userStore.productPackages.map((p) => ({
    label: p.PackageName,
    value: p.PackageId
  }))
})
const channelOptions = computed<Array<{ label: string, value: string }>>(
  () => channelLs.value.map((c) => ({ label: c.ChannelName, value: c.ChannelId })))

const platformOptions = [
  { label: 'android', value: 'android' },
  { label: 'ios', value: 'ios' },
  { label: 'h5', value: 'h5' },
  { label: 'pc', value: 'pc' },
]

const isDisableBtn = computed(() => {
  return findMember.value
    ? !loginAccount.value || !selectProd.value || !bindChannelId.value || !guidUrl.value || !platform.value
    : !loginAccount.value || !selectProd.value
})

const postApply = async () => {
  if (
    !bindChannelId.value ||
    !applyPlayer.value?.LoginAccount ||
    !applyPlayer.value?.PlayerId ||
    !selectProd.value ||
    !guidUrl.value ||
    !platform.value
  ) return
  try {
    loadingHandler('open')
    console.log('ppp =>', {
      ChannelId: bindChannelId.value,
      LoginAccount: applyPlayer.value?.LoginAccount,
      PlayerId: applyPlayer.value?.PlayerId,
      PackageId: selectProd.value,
      Url: guidUrl.value,
      Platform: platform.value,
      ...(imageUrls.value && { Image: imageUrls.value }),
      ...(note.value && { Desc: note.value })
    })
    const res = await API.playerManage.postApply({
      ChannelId: bindChannelId.value,
      LoginAccount: applyPlayer.value?.LoginAccount,
      PlayerId: applyPlayer.value?.PlayerId,
      PackageId: selectProd.value,
      Url: guidUrl.value,
      Platform: platform.value,
      ...(imageUrls.value && { Image: imageUrls.value }),
      ...(note.value && { Desc: note.value })
    })

    if (res.data.Code === 200) {
      reset()
      showSuccessToast('申请成功')
    }
    if (res.data.Code !== 200) showFailToast(res.data.Msg)
  } catch (e) {
    console.warn('[postApply error]:', e)
  } finally {
    loadingHandler('close')
  }
}

const fetchApplyChannelLs = async () => {
  if (!applyPlayer.value) return
  try {
    loadingHandler('open')
    const res = await API.playerManage.getPlayerchannelv2({ PlayerId: applyPlayer.value?.PlayerId })
    channelLs.value = res.data.Data.Items ?? []
  } catch (e) {
    console.warn('[fetchApplyChannelLs error]:', e)
  } finally {
    loadingHandler('close')
  }
}

const fetchApplyCheck = async () => {
  if (!selectProd.value || !loginAccount.value) return
  try {
    loadingHandler('open')
    const res = await API.playerManage.getApplycheck({
      LoginAccount: loginAccount.value,
      PackageId: selectProd.value
    })
    if (res.data.Code !== 200) showFailToast(res.data.Msg)
    if (res.data.Code === 200) {
      applyPlayer.value = res.data.Data.Items?.[0] ?? null
    }
  } catch (e) {
    console.warn('[fetchApplyCheck error]:', e)
  } finally {
    loadingHandler('close')
  }
}

const handleAddAccountConfirm = (p: any) => {
  if (!selectProd.value) return
  if (!findMember.value) fetchApplyCheck()
  return postApply()
}

const handleChangeImageUrls = (newVal: string[]) => {
  imageUrls.value = newVal.length === 0 ? '' : newVal.join(',')
}

const checkHandler = () => {
  if (selectProd.value === null) hasDropDownError_prod.value = true

  if (findMember.value) {
    if (!bindChannelId.value) hasDropDownError_channelId.value = true
    if (!platform.value) hasDropDownError_platform.value = true
  }
}

const reset = () => { 
  loginAccount.value = ''
  selectProd.value = null
  bindChannelId.value = ''
  guidUrl.value = ''
  applyPlayer.value = null
  ImageFileList.value = []
  ImageUploadRef.value?.cleanUrls()
  nextTick(() => {
    formDataRef.value?.resetValidation()
  })
}

watch([applyPlayer], (p) => {
  if (p) fetchApplyChannelLs()
})

watch(selectProd, (prod) => {
  if (prod) hasDropDownError_prod.value = false
})

watch(bindChannelId, (channel) => {
  if (channel) hasDropDownError_channelId.value = false
})

watch(platform, (plat) => {
  if (plat) hasDropDownError_platform.value = false
})

</script>

<template>
  <div class="space-y-2 px-4">
    <NavBar title="调线申请">
      <template #right>
        <router-link :to="{ name: 'manageMemberBelongRecord' }">
          <van-icon name="todo-list-o" size="25" color="var(--color-neutral2-secondary)" />
        </router-link>
      </template>
    </NavBar>

    <div class="flex justify-between items-center bg-bg-floor-1-2 rounded-full py-2 px-3"  @click="showInfo = true">
      <div class="flex items-center space-x-2">
        <van-image class="w-5" fit="contain" src="./static/images/manage/lightBulb.png" />
        <span class="text-sm font-semibold text-primary-normal">何谓调线申请？</span>
      </div>
      <van-icon name="arrow" color="var(--color-primary-normal)" />
    </div>

    <van-form
      ref="formDataRef"
      :validate-trigger="['onBlur', 'onChange', 'onSubmit']"
      @submit="handleAddAccountConfirm"
    >
      <app-field
        v-model="loginAccount"
        placeholder="请输入"
        label="会员账号"
        required
        :rules="[rulesRequired()]"
        :disabled="findMember ? true : false"
      >
        <template v-if="findMember" #right-icon>
          <van-icon name="checked" class="text-success-normal" />
        </template>
      </app-field>

      <div class="van-cell van-cell--borderless van-field van-field--label-top">
        <div class="van-cell__title van-field__label van-field__label--top">
          <div>产品包<span class="text-sm text-error-normal">*</span></div>
        </div>
        <Dropdown
          v-model="selectProd"
          placeholder="请选择"
          :options="prodOptions"
          :class="cn(
            '!p-3 !h-auto',
            { '!border-error-50': hasDropDownError_prod },
            { '!bg-neutral2-seventh': findMember }
          )"
        />
      </div>

      <template v-if="findMember">
        <div class="van-cell flex justify-end">
          <van-button type="primary" round plain size="small" class="px-4!" @click="reset">重置</van-button>
        </div>

        <div class="van-cell van-cell--borderless van-field van-field--label-top">
          <div class="van-cell__title van-field__label van-field__label--top">
            <div>绑定渠道号<span class="text-sm text-error-normal">*</span></div>
          </div>
          <Dropdown
            v-model="bindChannelId"
            placeholder="请选择"
            :options="channelOptions"
            :class="cn(
              '!p-3 !h-auto',
              { '!border-error-50': hasDropDownError_channelId },
            )"
          />
        </div>

        <app-field v-model="guidUrl" label="引导链接" placeholder="请输入" required :rules="[rulesRequired()]"/>

        <div class="van-cell van-cell--borderless van-field van-field--label-top">
          <div class="van-cell__title van-field__label van-field__label--top">
            <div>设备类型<span class="text-sm text-error-normal">*</span></div>
          </div>
          <Dropdown
            v-model="platform"
            placeholder="请选择"
            :options="platformOptions"
            :class="cn(
              '!p-3 !h-auto',
              { '!border-error-50': hasDropDownError_platform },
            )"
          />
        </div>

        <app-field v-model="note" type="textarea" class="cusTextArea" row="2" show-word-limit maxlength="100" label="备注" placeholder="请输入">
          
        </app-field>

        <FormField 
          v-model="imageUrls"
          name="ImageUrls" 
          label="上传凭证" 
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

      </template>

      <div class="van-cell">
        <van-button
          class="w-full"
          type="primary"
          v-bind="isDisableBtn ? { color: 'var(--color-neutral2-fifth)' }: {}"
          round
          :disabled="isDisableBtn"
          native-type="submit"
          @click="checkHandler"
        >
          {{ findMember ? '调线申请' : '会员查询' }}
        </van-button>
      </div>
    </van-form>

  </div>
  <van-popup v-model:show="showInfo" round position="bottom" closeable close-icon="close">
    <div class="p-4 flex items-center justify-center text-lg font-semibold text-neutral2-basic">何谓调线申请？</div>
    <div class="p-4 pb-20 text-sm font-normal text-neutral2-secondary">
      <p>什么是调线申请？</p>
      <p>调线的申请条件是一种找回下级会员的方法，代理可通过此功能可以找回没能顺利通过推广链接注册成为下级的会员用户。</p>
      <p class="mt-3">
        申请限制：
      </p>
      <p>只能找回三天时间内通过自身推广链接注册的下级会员</p>
    </div>
  </van-popup>
</template>

<style lang="scss" scoped>
.cusTextArea {
  :deep(.van-field__body) {
    border-radius: 16px;
  }
}
</style>
