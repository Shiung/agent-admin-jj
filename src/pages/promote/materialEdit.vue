<script setup lang="ts">
import { ref, onMounted, inject, computed, watchEffect, watch } from 'vue'
import { useRoute } from 'vue-router'
import { watchOnce, useResizeObserver } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type { CarouselApi } from '@/components/carousel'
import { PromoteStateSymbol, PromoteComputeSymbol, PromoteActionSymbol } from './composables/provideStore'
import getRemoteSourcePath from '@/utils/getRemoteSourcePath'
import { useClipboard } from '@vueuse/core'

import photo from './components/photo.vue'

import useImage from './composables/useImage'

import { showFailToast, showSuccessToast } from 'vant'

const { downLoadImage, shareBase64Image } = useImage()
const { copy } = useClipboard()

const seletorKeySplit = '*mark*'

const photoRefs = ref<Record<string | number, InstanceType<typeof photo>>>({})

const setUnitPhotoRef = (el: InstanceType<typeof photo> | null, key: string | number) => {
  if (el) photoRefs.value[key] = el
  else delete photoRefs.value[key]
}

const getCurrentChildExposedImageBase64 = () => {
  const currentPos = emblaMainApi.value?.selectedScrollSnap()
  const renderLs = renderData.value
  const photoRefLs = photoRefs.value

  let returnImage = ''
  if (currentPos !== undefined) {
    const currentPhoto = renderLs[currentPos]
    if (currentPhoto) {
      if (currentPhoto.Id in photoRefLs) {
        const res = photoRefLs?.[currentPhoto.Id]?.getMergeImage() ?? ''
        if (res) returnImage = res
      }
    }
  }

  return returnImage
}

const route = useRoute()
const pId = route.params?.productId
const state = inject(PromoteStateSymbol)!
const { packageIdGroupByLs, materialLsSelectByPid } = inject(PromoteComputeSymbol)!
const { fetchMaterialLs } = inject(PromoteActionSymbol)!

const emblaThumbnailApiForTab = ref<CarouselApi>()
const emblaMainApi = ref<CarouselApi>()
const selectedIndex = ref<number>(0)
const tabsEl = ref<HTMLDivElement>()
const prevCardW = '56px'
const blockW = ref<String>('0px')

const qrcodeURL = ref<string>('')

const initDone = ref<boolean>(false)
const deviceAutoFromChannel = ref<boolean>(false)

const data = computed(() => materialLsSelectByPid.value(Number(pId)) ?? [])

const dataBind = computed(() => packageIdGroupByLs.value(Number(pId)) ?? [])

const selectChannelId = ref<number | string | null>(null)
const selectDevice = ref<number | string | null>(null)
const selectTheme = ref<number | string | null>(null)
const selectSize = ref<number | string | null>(null)
const channelOptions = computed(() => dataBind.value.map((d) => ({ label: d.ChannelId, value: d.ChannelId })))

const deviceOptions = computed<Array<{ label: string, value: string }>>(() => {
  const hasExistChannel = dataBind.value.find((bind) => bind.ChannelId === selectChannelId.value)
  if (!hasExistChannel) return []
  const ls = new Map()
  const { AppDomains = [], H5Domains = [] } = hasExistChannel
  const AppLsMulti = AppDomains.length > 1
  const H5DomainsMulti = H5Domains.length > 1
  AppDomains.forEach((d, idx) => {
    const key = AppLsMulti ? `APP_${idx + 1}` : 'APP'
    if (!ls.has(key)) {
      const prefixName = d.NetCashDomainType === 0 ? '代理' : '专属'
      ls.set(key, { label: `${key}(${prefixName})`, value: d.Domain + `${seletorKeySplit}${key}` })
    }
  })

  H5Domains.forEach((d, idx) => {
    const key = H5DomainsMulti ? `PC/H5_${idx + 1}` : 'PC/H5'
    if (!ls.has(key)) {
      const prefixName = d.NetCashDomainType === 0 ? '代理' : '专属'
      ls.set(key, { label: `${key}(${prefixName})`, value: d.Domain + `${seletorKeySplit}${key}` })
    }
  })
  return [...ls.values()]
})

const themeOptions = computed(() => {
  const ls = new Map()
  data.value.forEach((d) => {
    if (!ls.has(d.ThemeId)) {
      ls.set(d.ThemeId, { label: d.ThemeName, value: d.ThemeId })
    }
  })
  return [{ label: '全部主题', value: null }, ...ls.values()]
})

const sizeOptions = computed(() => {
  const ls = new Map()
  data.value.forEach((d) => {
    if (!ls.has(d.SizeId)) {
      ls.set(d.SizeId, { label: d.SizeName, value: d.SizeId })
    }
  })

  return [{ label: '全部尺寸', value: null }, ...ls.values()]
})

const renderData = computed(() => {
  const hasSelectTheme = selectTheme.value
  const hasSelectSize = selectSize.value
  return data.value.filter((d) => {
    if (hasSelectTheme && hasSelectSize) {
      return d.ThemeId === hasSelectTheme && d.SizeId === hasSelectSize
    }
    if (hasSelectTheme) {
      return d.ThemeId === hasSelectTheme
    }
    if (hasSelectSize) {
      return d.SizeId === hasSelectSize
    }
    return d
  })
})

watch(
  () => deviceOptions.value,
  (options) => {
    if (!deviceAutoFromChannel.value) return
    if (options.length > 0) {
      if (options[0]?.value) selectDevice.value = options[0]?.value
      deviceAutoFromChannel.value = false
    }
  }
)

watch(
  () => selectDevice.value,
  (selectD) => {
    qrcodeURL.value = selectD ? selectD.toString().split(seletorKeySplit)[0] ?? '' : ''
  }
)

const onThumbClick = (index: number) => {
  if (!emblaMainApi.value || !emblaThumbnailApiForTab.value) return
  emblaMainApi.value.scrollTo(index)
}

const onSelect = () => {
  if (!emblaMainApi.value || !emblaThumbnailApiForTab.value) return
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  emblaThumbnailApiForTab.value.scrollTo(emblaMainApi.value.selectedScrollSnap() + 1)
}

watchOnce(emblaMainApi, (emblaMainApi: CarouselApi) => {
  if (!emblaMainApi) return
  onSelect()
  emblaMainApi.on('select', onSelect)
  emblaMainApi.on('reInit', onSelect)
})

useResizeObserver(tabsEl, () => {
  calcuSize()
})

watchEffect(() => {
  if (state.materialLs.length === 0) {
    fetchMaterialLs({})
  }
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

const bottomSheetConf: Array<{ id: string, name: string, img: string, action: () => void }> = [
  {
    id: 'copy',
    name: '复制链接',
    img: './static/images/promote/copySheet.png',
    action: () => {
      if (qrcodeURL.value) {
        copy(qrcodeURL.value)
        showSuccessToast({ message: '复制成功' })
        return
      }
      showFailToast({ message: '请先配置渠道号和装置' })
    }
  },
  {
    id: 'downLoad',
    name: '保存图片',
    img: './static/images/promote/downLoadSheet.png',
    action: () => {
      const imageBase64 = getCurrentChildExposedImageBase64()
      if (imageBase64) downLoadImage(imageBase64)
      else showFailToast({ message: '请先配置渠道号和装置' })
    }
  },
  {
    id: 'share',
    name: '分享APP',
    img: './static/images/promote/shareSheet.png',
    action: () => {
      const imageBase64 = getCurrentChildExposedImageBase64()
      if (!imageBase64) showFailToast({ message: '请先配置渠道号和装置' })
      shareBase64Image(imageBase64)
    }
  }
]

/** 初始化圖片位置 */
watchEffect(() => {
  if (initDone.value) return
  const data = renderData.value
  const queryId = route.query?.mId
  const findIndex = data.findIndex((d) => d.Id === Number(queryId))
  if (findIndex === -1) return
  setTimeout(() => {
    initDone.value = true
    onThumbClick(findIndex)
  }, 15)
})

/** 初始化裝置設置 */
onMounted(() => {
  const { channel, tId } = route.query
  if (channel) selectChannelId.value = channel.toString()
  if (tId) selectTheme.value = Number(tId)
})
/** 初始化裝置設置 [device] */
watchOnce(deviceOptions, (v) => {
  const { device } = route.query
  if (device) selectDevice.value = v.find((key) => key.value.split(seletorKeySplit)[0] === device.toString())?.value ?? null
})
</script>

<template>
  <div class="space-y-2 flex-1 flex flex-col">
    <NavBar title="素材设置" />
    <div class="grid grid-cols-4 gap-1 px-1">
      <Dropdown v-model="selectChannelId" :options="channelOptions" class="dropDownCus" placeholder="渠道号"
        @change="deviceAutoFromChannel = true" />
      <Dropdown v-model="selectDevice" :options="deviceOptions" class="dropDownCus" placeholder="装置" />
      <Dropdown v-model="selectTheme" :options="themeOptions" class="dropDownCus" placeholder="全部主题" />
      <Dropdown v-model="selectSize" :options="sizeOptions" class="dropDownCus" placeholder="全部尺寸" />
    </div>

    <div v-if="renderData.length === 0"  class="flex-1 flex items-center">
      <empty />
    </div>

    <template v-else>
      <div class="flex-1"></div>
  
      <div class="mb-4">
        <Carousel @init-api="(val: CarouselApi) => (emblaMainApi = val)">
          <CarouselContent class="ml-0 px-2 space-x-1">
            <CarouselItem v-for="(l, idx) in renderData" :key="idx" class="pl-0! space-y-3">
              <photo :ref="el => setUnitPhotoRef(el as any, l.Id)" :imag-src="getRemoteSourcePath(l.ImagePath ?? '')"
                :qrcode-src="qrcode" />
              <div class="flex justify-center items-center space-x-2">
                <div class="border rounded-xl px-2 text-primary-normal text-xs bg-primary-normal/20">{{ l.ThemeName }}
                </div>
                <div class="border rounded-xl px-2 text-primary-normal text-xs bg-primary-normal/20">{{ l.SizeName }}
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
  
      <div ref="tabsEl" class="relative">
        <div data-use="shadow"
          class="absolute top-0 left-0 w-4 h-full z-1 backdrop-blur-xs rounded-tr-xl rounded-br-xl" />
        <div data-use="shadow"
          class="absolute top-0 right-0 w-4 h-full z-1 backdrop-blur-xs rounded-tl-xl rounded-bl-xl" />
        <Carousel class="flex-1" @init-api="(val: CarouselApi) => (emblaThumbnailApiForTab = val)">
          <CarouselContent class="ml-0 relative w-full space-x-1 py-3">
            <div>
              <div class="preCard_block" />
            </div>
            <div v-for="(i, idx) in renderData" :key="idx" :data-id="idx" class="preCard shrink-0"
              :class="selectedIndex === idx && 'active'">
              <CarouselItem class="unit pl-0! text-xs text-neutral_d01 font-semibold" @click="onThumbClick(idx)">
                <div class="aspect-36/40">
                  <van-image use-error-slot use-loading-slot fit="cover" :src="getRemoteSourcePath(i.ImagePath)"
                    class="w-full h-full" />
                </div>
              </CarouselItem>
            </div>
            <div>
              <div class="preCard_block" />
            </div>
          </CarouselContent>
        </Carousel>
      </div>
  
      <div class="flex-1"></div>
    </template>

    <div
      class="sticky bottom-0 z-1 shadow-[-1px_1px_6px_0px_rgba(0,0,0,0.15)] bg-white h-32 rounded-tl-3xl rounded-tr-3xl flex justify-between items-center pr-11 pl-11">
      <div v-for="s in bottomSheetConf" :key="s.id" class="flex flex-col items-center space-y-1" @click="s.action">
        <div class="bg-primary-normal/5 rounded-full flex items-center justify-center w-12 aspect-square">
          <van-image :src="s.img" class="w-8" fit="contain" />
        </div>
        <div class="text-sm">{{ s.name }}</div>
      </div>
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

.dropDownCus {
  :deep(>button) {

    // padding: 0.75rem 0.5rem;
    .dropdown-text {
      display: inline-block;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  :deep(.dropdown-menu) {
    width: calc(100vw - 24px);
    position: fixed;
    top: unset;
    left: 12px;
  }
}
</style>
