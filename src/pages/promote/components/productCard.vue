<script setup lang="ts">
import { watchEffect, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PromotionlinkListV2ResponseData } from '@/apis/codegen/data-contracts'
import getRemoteSourcePath from '@/utils/getRemoteSourcePath'
import { showToast, showFailToast } from 'vant'
import { useClipboard, useDateFormat } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'

import useImage from '../composables/useImage'
defineProps<{
  product: any
}>()

const router = useRouter()
const { copyIng, downLoadImage, copyImageToClipboard } = useImage()

const trasPushType = (type: PromotionlinkListV2ResponseData['PushType']) => {
  switch (type) {
    case 0: return '游戏-首页'
    case 1: return '游戏-直播页'
    case 2: return '纯直播'
    case 3: return '首页（无直播'
    case 4: return '纯直播（登录后游戏-直播页'
    case 5: return '游戏-杯赛页'
    default: return type
  }
}
const qrcodeURL = ref<string>('')
const showQrcode = ref<boolean>(false)
const { copy, copied } = useClipboard()
const qrcode = useQRCode(qrcodeURL, { width: 200, margin: 0, errorCorrectionLevel: 'L' })

const showDate = (ts: number | string | null) => {
  if (!ts) return null
  const num = Number(ts)
  if (isNaN(num)) return null
  return useDateFormat(num > 1e12 ? num : num * 1000, 'YYYY-MM-DD').value
}


watchEffect(() => {
  if (copied.value) showToast({ message: '复制成功' })
})

const clickQrcodeDialog = (domain: string) => {
  qrcodeURL.value = domain
  showQrcode.value = true
}

const clickHandler = (productId: number, channel: number, device: string) => {
  router.push({ name: 'promoteMaterialPort', params: { productId }, query: { channel, device } })
}

const clickDownLoad = () => {
  downLoadImage(qrcode.value)
}

const clickCopy = async () => {
  const res = await copyImageToClipboard(qrcode.value)
  if (res) {
    showToast({ message: '图片已复制' })
  } else {
    showFailToast({ message: '图片复制失败', className: '!bg-[var(--van-danger-color)]' })
  }
}

</script>

<template>
  <div class="bg-white rounded-2xl shadow">
    <div class="p-4">
      <div class="flex items-center mb-3 space-x-3">
        <div class="aspect-square w-16 rounded-xl overflow-hidden">
          <van-image use-error-slot use-loading-slot fit="cover" :src="getRemoteSourcePath(product.Icon)"
            class="w-full h-full" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-gray-800">{{ product.ChannelId }}</div>
          <div class="text-sm text-gray-500">{{ product.PackageName }}</div>
          <div class="text-gray-400 flex items-center space-x-1">
            <van-image src="./static/images/promote/apple.png" fit="contain" class="h-4" />
            <div class="text-xs/normal">{{ product.IosPackVersion }}</div>
            <van-image src="./static/images/promote/andriod.png" fit="contain" class="h-4 ml-3" />
            <div class="text-xs/normal">{{ product.AndroidPackVersion }}</div>
          </div>
        </div>
        <div class="text-center bg-slate-50 p-2 aspect-square min-w-16 rounded-xl flex flex-col justify-center">
          <div class="text-xs text-gray-500">邀请码</div>
          <div class="font-semibold text-neutral-basic flex items-center space-x-1" @click="copy(product.InvitationCode)">
            <div>{{ product.InvitationCode }}</div>
            <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="(app, idx) in product.AppDomains" :key="`app-${idx}`"
          class="p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] flex-col justify-center items-start space-y-2">
          <div class="flex justify-start items-center gap-2">
            <div class="w-16 min-w-14 justify-start text-blue-950/90 text-sm font-semibold">APP{{
              product.AppDomains.length > 1 ? `_${idx + 1}` : '' }}</div>
            <div class="w-px h-3 bg-blue-950/5 rounded"></div>
            <div class="flex-1 text-right justify-start text-blue-950/70 text-xs font-normal truncate">{{ app.Domain }}
            </div>
          </div>
          <div class="flex justify-center items-center gap-2">
            <div class="flex-1 p-1.5 rounded-[100px] border border-neutral-basic flex justify-center items-center space-x-1">
              <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" />
              <div class="text-center justify-start text-neutral-basic text-[10px] font-semibold"
                @click="copy(app.Domain)">复制链接</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border border-neutral-basic flex justify-center items-center space-x-1">
              <van-image src="./static/images/promote/qrcode_lite.png" fit="contain" class="w-3" />
              <div class="text-center justify-start text-neutral-basic text-[10px] font-semibold"
                @click="clickQrcodeDialog(app.Domain)">二维码</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border border-neutral-basic flex justify-center items-center space-x-1">
              <van-image src="./static/images/promote/share_lite.png" fit="contain" class="w-3" />
              <div class="text-center justify-start text-neutral-basic text-[10px] font-semibold"
                @click="clickHandler(product.PackageId, product.ChannelId, app.Domain)">素材设置</div>
            </div>
          </div>
        </div>

        <div v-for="(h5, idx) in product.H5Domains" :key="`h5-${idx}`"
          class="p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] flex-col justify-center items-start space-y-2">
          <div class="flex justify-start items-center gap-2">
            <div class="w-16 min-w-14 justify-start text-blue-950/90 text-sm font-semibold">PC/H5{{
              product.H5Domains.length > 1 ? `_${idx + 1}` : ''}}</div>
            <div class="w-px h-3 bg-blue-950/5 rounded"></div>
            <div class="flex-1 text-right justify-start text-blue-950/70 text-xs font-normal truncate">{{ h5.Domain }}
            </div>
          </div>
          <div class="flex justify-center items-center gap-2">
            <div class="flex-1 p-1.5 rounded-[100px] border border-neutral-basic flex justify-center items-center space-x-1">
              <van-image src="./static/images/promote/copy_lite.png" fit="contain" class="w-3" />
              <div class="text-center justify-start text-neutral-basic text-[10px] font-semibold"
                @click="copy(h5.Domain)">复制链接</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border border-neutral-basic flex justify-center items-center space-x-1">
              <van-image src="./static/images/promote/qrcode_lite.png" fit="contain" class="w-3" />
              <div class="text-center justify-start text-neutral-basic text-[10px] font-semibold"
                @click="clickQrcodeDialog(h5.Domain)">二维码</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border border-neutral-basic flex justify-center items-center space-x-1">
              <van-image src="./static/images/promote/share_lite.png" fit="contain" class="w-3" />
              <div class="text-center justify-start text-neutral-basic text-[10px] font-semibold"
                @click="clickHandler(product.PackageId, product.ChannelId, h5.Domain)">素材设置</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-blue-950/5 px-4 pb-4">
      <div>{{ trasPushType(product.PushType) }}</div>
      <div>{{ showDate(product.CreateTime) }}</div>
    </div>
  </div>
  <van-dialog v-model:show="showQrcode" title="二维码" theme="round-button" close-on-click-overlay>
    <div class="flex justify-center items-center py-4">
      <van-image fit="cover" :src="qrcode" />
    </div>
    <template #footer>
      <div class="py-4 flex items-center justify-center space-x-3!">
        <van-button :loading="copyIng" round plain type="primary" class="w-[100px]" @click="clickCopy">复制图片</van-button>
        <van-button round type="primary" class="w-[100px]" @click="clickDownLoad">下载图片</van-button>
      </div>
    </template>
  </van-dialog>
</template>
