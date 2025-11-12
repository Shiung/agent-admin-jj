<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { PromotionlinkListV2ResponseData } from '@/apis/codegen/data-contracts'
import getRemoteSourcePath from '@/utils/getRemoteSourcePath'
defineProps<{
  product: any
}>()

const router = useRouter()

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

const clickHandler = (productId: number, channel: number, device: string ) => {
  router.push({ name: 'materialPort', params: { productId }, query: { channel, device } })
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow">
    <div class="p-4">
      <div class="flex items-center mb-3 space-x-3">
        <div class="aspect-square w-16 rounded-xl overflow-hidden">
          <van-image use-error-slot use-loading-slot fit="cover" :src="getRemoteSourcePath(product.Icon)" class="w-full h-full" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-gray-800">{{ product.ChannelId }}</div>
          <div class="text-sm text-gray-500">{{ product.PackageName }}</div>
          <div class="text-xs text-gray-400">版本 {{ product.IosPackVersion }} / {{ product.AndroidPackVersion }}</div>
        </div>
        <div class="text-center bg-slate-50 p-2 w-16 aspect-square rounded-xl flex flex-col justify-center">
          <div class="text-xs text-gray-500">邀请码</div>
          <div class="font-semibold text-blue-500">{{ product.InvitationCode }}</div>
        </div>
      </div>
  
      <div class="space-y-2">
        <div
          v-for="(app, idx) in product.AppDomains"
          :key="`app-${idx}`"
          class="p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] flex-col justify-center items-start space-y-2">
          <div class="flex justify-start items-center gap-2">
            <div class="w-16 min-w-14 justify-start text-blue-950/90 text-sm font-semibold">APP{{ product.AppDomains.length > 1 ? `_${idx + 1}` : '' }}</div>
            <div class="w-px h-3 bg-blue-950/5 rounded"></div>
            <div class="flex-1 text-right justify-start text-blue-950/70 text-xs font-normal truncate">{{ app.Domain }}</div>
          </div>
          <div class="flex justify-center items-center gap-2">
            <div class="flex-1 p-1.5 rounded-[100px] border flex justify-center items-center gap-0.5">
              <div class="w-3 h-3 relative">
                <div class="w-2 h-2 left-[1.75px] top-[1.50px] absolute bg-blue-950/90"></div>
              </div>
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold">复制链接</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border flex justify-center items-center gap-0.5">
              <div class="w-3 h-3 relative">
                <div class="w-2 h-2 left-[1.50px] top-[1.50px] absolute bg-blue-950/90"></div>
              </div>
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold">二维码</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border flex justify-center items-center gap-0.5">
              <div class="w-3 h-3 relative">
                <div class="w-2 h-2 left-[1.50px] top-[1.50px] absolute bg-blue-950/90"></div>
              </div>
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold" @click="clickHandler(product.PackageId, product.ChannelId, app.Domain)">素材设置</div>
            </div>
          </div>
        </div>
  
        <div
          v-for="(h5, idx) in product.H5Domains"
          :key="`h5-${idx}`"
          class="p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] flex-col justify-center items-start space-y-2">
          <div class="flex justify-start items-center gap-2">
            <div class="w-16 min-w-14 justify-start text-blue-950/90 text-sm font-semibold">PC/H5{{ product.H5Domains.length > 1 ? `_${idx + 1}` : ''}}</div>
            <div class="w-px h-3 bg-blue-950/5 rounded"></div>
            <div class="flex-1 text-right justify-start text-blue-950/70 text-xs font-normal truncate">{{  h5.Domain }}</div>
          </div>
          <div class="flex justify-center items-center gap-2">
            <div class="flex-1 p-1.5 rounded-[100px] border flex justify-center items-center gap-0.5">
              <div class="w-3 h-3 relative">
                <div class="w-2 h-2 left-[1.75px] top-[1.50px] absolute bg-blue-950/90"></div>
              </div>
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold">复制链接</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border flex justify-center items-center gap-0.5">
              <div class="w-3 h-3 relative">
                <div class="w-2 h-2 left-[1.50px] top-[1.50px] absolute bg-blue-950/90"></div>
              </div>
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold">二维码</div>
            </div>
            <div class="flex-1 p-1.5 rounded-[100px] border flex justify-center items-center gap-0.5">
              <div class="w-3 h-3 relative">
                <div class="w-2 h-2 left-[1.50px] top-[1.50px] absolute bg-blue-950/90"></div>
              </div>
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold" @click="clickHandler(product.PackageId, product.ChannelId, h5.Domain)">素材设置</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-blue-950/5 px-4 pb-4">
      <div>{{ trasPushType(product.PushType) }}</div>
      <div>{{ product.CreateTime }}</div>
    </div>
  </div>
</template>