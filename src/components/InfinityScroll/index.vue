<script setup lang="ts" generic="T extends Array<any>">
import { computed, useAttrs, ref, onUnmounted } from 'vue'
import { cn } from '@/utils/className'
import type { Pagination } from '@/apis/codegen/common'
import { watchOnce } from '@vueuse/core'

export interface InfinityPropsType<D extends Array<any>> {
  isFinished?: boolean
  fetchAction: (page: number) => Promise<{
    data: D,
    paging: Pagination | null
  }>
}

export type InfinityExposeType = {
  fetchData: () => void
}

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const refreshing = ref<boolean>(false)
const initFetchDone = ref<boolean>(false)
const loading = ref<boolean>(false)
const isError = ref<boolean>(false)
const ls = ref<T>([] as any)
const pagingObj = ref<Pagination | null>(null)

const { isFinished, fetchAction } = defineProps<InfinityPropsType<T>>()

const finished = computed(() => {
  if (isFinished) return isFinished
  return !pagingObj.value ? false : pagingObj.value?.CurrPage >= pagingObj.value?.MaxPageCount
})

const isReadMore = computed(() => {
  return isError.value ? false : (loading.value || !initFetchDone.value) ? true : ls.value.length !== 0
})

const fetchData = async () => {
  try {
    loading.value = true
    isError.value = false
    if (typeof fetchAction !== 'function') return
    const curPage = pagingObj.value?.CurrPage ?? 0
    const { data, paging } = await fetchAction(curPage + 1)
    if (data) {
      ls.value = ls.value.concat(data)
    }
    pagingObj.value = paging
  } catch (e) {
    isError.value = true
    console.warn('[infinity scroll fetch error]:', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onLoad = () => {
  initFetchDone.value = true
  fetchData()
  // emit('load')
}

const onRefresh = () => {
  pagingObj.value = null
  ls.value = []
  initFetchDone.value = false
  // emit('reFresh')
  onLoad()
}

defineExpose<InfinityExposeType>({
  fetchData: onRefresh
})

/**
 * van-pull-refresh 需要指定容器高度才能計算pull refresh 
 * 但因為此模組改為瀏覽器自適應高度長內容，會因為scroll行為與touch event 錯亂導致觸發pull-refresh
 * 所以加入監聽器暫停touch 執行reload 行爲
 */
const domEl = ref<HTMLDivElement>()
const touchEventCB = (e: TouchEvent) => {
  const scrollY = window.scrollY || document.documentElement.scrollTop
  if (scrollY > 0) {
    e.stopPropagation()
  }
}

watchOnce(domEl, () => {
  domEl.value?.addEventListener('touchmove', touchEventCB, { passive: true })
})

onUnmounted(() => {
  if (domEl.value) {
    domEl.value?.removeEventListener('touchmove', touchEventCB)
  }
})

</script>

<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :class="cn('cusVanPull', attrs?.class ?? '')">
    <div ref="domEl" class="flex-1 flex flex-col">
      <slot v-if="ls.length > 0" :ls='ls' />
      <empty v-else-if="initFetchDone && !loading" class="flex-1" />
      <ReadMore v-if="isReadMore" v-model:finished="finished" :loading="loading" @on-load="onLoad" />
    </div>
  </van-pull-refresh>
</template>

<style lang="scss" scoped>
.cusVanPull {
  :deep(.van-pull-refresh__track) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>