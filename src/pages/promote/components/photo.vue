<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import mergeImages from 'merge-images'

const { imagSrc, qrcodeSrc} = defineProps<{
  imagSrc: string
  qrcodeSrc: string
}>()

const domEl = ref<HTMLDivElement>()
const mergeImag = ref<string>()

const _resoveImgSize = (img: HTMLImageElement, width: number, height: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL();
}

const genImg = async (img?: string) => {
  if (!img || !qrcodeSrc) return
  const { width: boxW = 0, height: boxH = 0 } = domEl.value?.getBoundingClientRect() ?? {}
  try {
    const imgObj = await new Promise<{
      width: number
      height: number
      naturalWidth: number
      naturalHeight: number
      imgIns: HTMLImageElement
    }>((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous' // 要求跨域
      image.onload = () => {
        resolve({
          width: image.width,
          height: image.height,
          naturalWidth: image.naturalWidth, // 原始（不缩放）宽度
          naturalHeight: image.naturalHeight, // 原始（不缩放）高度
          imgIns: image
        })
      }
      image.onerror = (error) => {
        reject(new Error(`无法加载图片或获取尺寸: ${error}`))
      }
      image.src = img
    })
  
    const { width, height, imgIns } = imgObj
    if (!width || !height) {
      throw new Error(`无法加载图片或获取尺寸 width or height`)
    }
    const ratio = width / height
    const isHorizontal = ratio >= 1
    const resizeW = isHorizontal ? boxW : boxH * ratio
    const resizeH = !isHorizontal ? boxH : boxW / ratio

    const resolveImg = _resoveImgSize(imgIns, resizeW, resizeH)
    const res = await mergeImages([
      resolveImg,
      { src: qrcodeSrc, x: resizeW - 4 - 52, y: resizeH - 4 - 52 }
    ], { crossOrigin: 'anonymous' })
    mergeImag.value = res
  } catch (e) {
    console.warn('[gen img error]', e)
  }
}

watchEffect(() => {
  if (!imagSrc || !qrcodeSrc) return
  genImg(imagSrc)
})

defineExpose<{
  getMergeImage: () => string | undefined
}>({
  getMergeImage: () => {
    return mergeImag.value
  }
})
</script>

<template>
  <div class="w-full aspect-square flex items-center justify-center" ref="domEl">
    <div class="relative">
      <template v-if="mergeImag">
        <van-image use-error-slot use-loading-slot :src="mergeImag" class="w-full" alt="bindImage" />
      </template>
  
      <template v-else>
        <van-image use-error-slot use-loading-slot :src="imagSrc" class="w-full" />
        <div v-if="qrcodeSrc" class="absolute right-1 bottom-1">
          <van-image use-error-slot use-loading-slot :src="qrcodeSrc" alt="qrcode"  />
        </div>
      </template>
    </div>
  </div>
</template>