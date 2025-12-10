<script setup lang="ts">
import { computed, useAttrs, type VNode, type Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TabsType } from 'vant'
import { cn } from '@/utils/className'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const activeTab = defineModel<number>('activeTab', { required: true })


type Options = {
  color: string
  titleActiveColor: string
  titleInactiveColor: string
  type: TabsType
}

const _defaultOpt: Options = {
  color: '--color-primary-normal',
  titleActiveColor: '--color-white',
  titleInactiveColor: '--color-neutral-secondary',
  type: 'card'
}

const { opts, tabs } = defineProps<{
  tabs: Array<{ id: number | string, title: string, to?: RouteLocationRaw, content?: string | VNode | Component }>
  opts?: Partial<Options>
}>()

const options = computed(() => {
  const isLine = opts?.type === 'line'
  return {
    ..._defaultOpt,
    ...(isLine && { titleActiveColor: '--color-primary-normal' }),
    ...opts
  }
})

</script>

<template>
  <div :class="cn(options.type === 'card' && 'tabCard', attrs?.class ?? '')">
    <van-tabs
      v-model:active="activeTab"
      :color="`var(${options.color})`"
      :title-active-color="`var(${options.titleActiveColor})`"
      :title-inactive-color="`var(${options.titleInactiveColor})`"
      :type="options.type"
      v-bind="{ swipeable: attrs.swipeable !== undefined }"
    >
      <van-tab v-for="tab in tabs" :key="tab.id" :title="tab.title" v-bind="tab.to ? { to: tab.to } : {}">
        <template v-if="tab.content && (typeof tab.content === 'string')" >{{ tab.content  }}</template>
        <component v-else-if="tab.content" :is="tab.content" v-bind="attrs.playerId ? { playerId: attrs.playerId } : {}" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<style lang="scss" scoped>
.tabCard {
  /* 自定义 van-tabs 样式 */
  :deep(.van-tabs) {
      --van-tabs-card-height: 3rem;
      --van-padding-md: 0rem;
      --van-radius-sm: 6.25rem;
      .van-tabs__nav.van-tabs__nav--card {
        padding: .25rem;
        border-color: var(--color-neutral2-seventh) !important;
      }
      .van-tab--card {
        border-right: none;
      }
      .van-tab.van-tab--card.van-tab--active {
        border-radius: var(--van-radius-sm);
      }
    }
    
    :deep(.van-tab) {
      font-size: 15px;
      font-weight: 400;
    }
}
</style>
