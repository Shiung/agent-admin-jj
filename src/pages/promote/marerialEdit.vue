<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { watchOnce, useResizeObserver } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type { CarouselApi } from '@/components/carousel'

import photo from './components/photo.vue'

import { fakeMaterial } from './fake'

const emblaThumbnailApiForTab = ref<CarouselApi>()
const emblaMainApi = ref<CarouselApi>()
const selectedIndex = ref<number>(0)
const tabsEl = ref<HTMLDivElement>()
const prevCardW = '56px'
const blockW = ref<String>('0px')

const qrcodeURL = ref('https://wini-mango.ljbdev.site/')

const data = ref(fakeMaterial)

const onThumbClick = (index: number) => {
  if (!emblaMainApi.value || !emblaThumbnailApiForTab.value) return
  emblaMainApi.value.scrollTo(index)
}

const onSelect = () => {
  if (!emblaMainApi.value || !emblaThumbnailApiForTab.value) return
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  emblaThumbnailApiForTab.value.scrollTo(emblaMainApi.value.selectedScrollSnap() + 1)
}

watchOnce(emblaMainApi, (emblaMainApi) => {
  if (!emblaMainApi) return
  onSelect()
  emblaMainApi.on('select', onSelect)
  emblaMainApi.on('reInit', onSelect)
})

useResizeObserver(tabsEl, () => {
  calcuSize()
})

const qrcode = useQRCode(qrcodeURL, {
  errorCorrectionLevel: 'L',
  margin: 1,
  width: 52
})

const calcuSize = () => {
  const boxW = emblaThumbnailApiForTab.value?.rootNode().getBoundingClientRect()?.width ?? 0
  const helf = boxW / 2
  blockW.value = `${helf}px`
}

onMounted(() => {
  // const findIndex = level.value.findIndex(({ current }) => current) || 0
  onThumbClick(0)
})
</script>

<template>
  <div>
    <div class="mb-4">
      <Carousel @init-api="(val) => (emblaMainApi = val)">
        <CarouselContent class="ml-0 px-2 space-x-1">
          <CarouselItem v-for="(l, idx) in data" :key="idx" class="!pl-0 space-y-3">
            <photo :imag-src="l.ImagePath ?? ''" :qrcode-src="qrcode" />
            <div class="flex justify-center items-center space-x-2">
              <div class="border rounded-xl px-2 text-primary-normal text-xs bg-primary-normal/20">{{ l.ThemeName }}</div>
              <div class="border rounded-xl px-2 text-primary-normal text-xs bg-primary-normal/20">{{ l.SizeName }}</div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>

    <div ref="tabsEl" class="relative">
      <div data-use="shadow" class="absolute top-0 left-0 w-4 h-full z-[1] backdrop-blur-xs rounded-tr-xl rounded-br-xl" />
      <div data-use="shadow" class="absolute top-0 right-0 w-4 h-full z-[1] backdrop-blur-xs rounded-tl-xl rounded-bl-xl" />
      <Carousel class="flex-1" @init-api="(val) => (emblaThumbnailApiForTab = val)">
        <CarouselContent class="ml-0 relative w-full space-x-1 py-3">
          <div>
            <div class="preCard_block" />
          </div>
          <div v-for="(i, idx) in data" :key="idx" :data-id="idx" class="preCard shrink-0" :class="selectedIndex === idx && 'active'">
            <CarouselItem class="unit !pl-0 text-xs text-neutral_d01 font-semibold" @click="onThumbClick(idx)">
              <div class="aspect-[36/40]">
                <van-image use-error-slot use-loading-slot fit="cover" :src="i.ImagePath" class="w-full h-full" />
              </div>
            </CarouselItem>
          </div>
          <div>
            <div class="preCard_block" />
          </div>
        </CarouselContent>
      </Carousel>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.preCard {
  transition: transform .2s;
  &.active {
    transform: scale(1.2);
  }
  .unit {
    width: v-bind(prevCardW);
  }
}
.preCard_block {
  width: v-bind(blockW);
}
</style>