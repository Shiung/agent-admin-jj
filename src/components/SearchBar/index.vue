<script setup lang="ts">
import { ref, computed, useAttrs, watch } from 'vue'
import { cn } from '@/utils/className' 
import type { SearchShape } from 'vant'

type CusStyle = {
  'van-search-input-height': number
  'van-search-padding': number
  'van-search-content-background': string
}

type SearchType = {
  id: number | string
  text: string
}

type Options = {
  placeholder: string
  shape: SearchShape
  searchLs: Array<SearchType>
  cusStyle: Partial<CusStyle>
}

const _defaultStyle: CusStyle = {
  'van-search-input-height': 40,
  'van-search-padding': 0,
  'van-search-content-background': '#fff'
}

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const selectedVal = defineModel<SearchType | null>('selected', { required: true })

const { placeholder = '请输入', shape = 'round', cusStyle, searchLs = [] } = defineProps<Partial<Options>>()

const value = ref<string>('')
const inputFocus = ref<boolean>(false)

const styleVal = computed(() => {
  const styleObj = {
    ..._defaultStyle,
    ...cusStyle
  }
  return {
    inputHeight: `${styleObj['van-search-input-height']}px`,
    searchPadding: `${styleObj['van-search-padding']}px`,
    contentBackground: styleObj['van-search-content-background']
  }
})

const outlineColor = computed(() => inputFocus.value ? `var(--color-primary-50)`: `var(--color-neutral2-seventh)`)

const showSearchList = computed(() => {
  return searchLs.filter((l) => l.text.includes(value.value))
})

const onBlur = () => {
  inputFocus.value = false
  if (selectedVal.value) {
    value.value = selectedVal.value.text
    return
  }
  if (value.value) {
    value.value = ''
    return
  }
}

const onSearch = (v: string) => {
  const hasRes = searchLs.find((s) => s.text === v)
  if (hasRes) selectedVal.value = hasRes
  onBlur()
}

watch(selectedVal, () => {
  onBlur()
})

</script>

<template>
  <div :class="cn('relative searchBar', attrs.class ?? '')" v-click-outside="onBlur">
    <van-search
      v-model:model-value="value"
      left-icon=""
      :placeholder="placeholder"
      :shape="shape"
      class="relative"
      @focus="inputFocus = true"
      @clear="selectedVal = null"
      @search="onSearch"
      >
      <template #right-icon>
        <van-icon name="search" />
      </template>
    </van-search>
    <div
      v-if="inputFocus && showSearchList.length > 0"
      class="absolute -bottom-1 z-10 translate-y-full border w-full max-h-[50svh] bg-white rounded-2xl shadow-[-1px_1px_6px_0px_rgba(0,0,0,0.15)] overflow-y-auto"
      >
      <div v-for="l in showSearchList" :key="l.id" @click="selectedVal = l" class="p-2 text-sm text-neutral2-basic">
        <HighLightText :word="l.text" :key-word="value" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.searchBar {
  --van-search-input-height: v-bind(styleVal.inputHeight);
  --van-search-padding: v-bind(styleVal.searchPadding);
  --van-search-content-background: v-bind(styleVal.contentBackground);
  :deep(.van-search__content) {
    outline: 1px solid;
    outline-color: v-bind(outlineColor);
  }
}

</style>
