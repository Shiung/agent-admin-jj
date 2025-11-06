<script setup lang="ts">
import { useRouter } from 'vue-router';
defineProps<{
  product: any
}>()

const router = useRouter()

const clickHandler = () => {
  router.push({ name: 'materialPort', params: { productId: 2108 } })
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow" @click="clickHandler">
    <div class="p-4">
      <div class="flex items-center mb-3 space-x-3">
        <div class="aspect-square w-16 rounded-xl bg-[#ccc]"></div>
        <div class="flex-1">
          <div class="font-semibold text-gray-800">{{ product.name }}</div>
          <div class="text-sm text-gray-500">{{ product.desc }}</div>
          <div class="text-xs text-gray-400">版本 {{ product.version }}</div>
        </div>
        <div class="text-center bg-slate-50 p-2 w-16 aspect-square rounded-xl flex flex-col justify-center">
          <div class="text-xs text-gray-500">邀请码</div>
          <div class="font-semibold text-blue-500">{{ product.inviteCode }}</div>
        </div>
      </div>
  
      <div class="space-y-2">
        <div class="p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] flex-col justify-center items-start space-y-2">
          <div class="flex justify-start items-center gap-2">
            <div class="w-16 min-w-14 justify-start text-blue-950/90 text-sm font-semibold">APP</div>
            <div class="w-px h-3 bg-blue-950/5 rounded"></div>
            <div class="flex-1 justify-start text-blue-950/70 text-xs font-normal truncate">{{  product.appUrl }}</div>
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
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold">素材设置</div>
            </div>
          </div>
        </div>
  
        <div class="p-3 bg-white rounded-2xl shadow-[-0.5px_0.5px_3px_0px_rgba(0,0,0,0.15)] flex-col justify-center items-start space-y-2">
          <div class="flex justify-start items-center gap-2">
            <div class="w-16 min-w-14 justify-start text-blue-950/90 text-sm font-semibold">PC/H5</div>
            <div class="w-px h-3 bg-blue-950/5 rounded"></div>
            <div class="flex-1 justify-start text-blue-950/70 text-xs font-normal truncate">{{  product.webUrl }}</div>
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
              <div class="text-center justify-start text-blue-950/90 text-[10px] font-semibold">素材设置</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-blue-950/5 px-4 pb-4">
      <div>游戏-首页</div>
      <div>{{ product.date }}</div>
    </div>
  </div>
</template>