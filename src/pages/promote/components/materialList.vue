<script setup lang="ts">
import { computed, onMounted, ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import getRemoteSourcePath from '@/utils/getRemoteSourcePath'

import { PromoteStateSymbol, PromoteComputeSymbol, PromoteActionSymbol } from '../composables/provideStore'

const route = useRoute()
const router = useRouter()
const pId = route.params?.productId
const isProduct = !!pId

const state = inject(PromoteStateSymbol)!
const { materialLsSelectByPid } = inject(PromoteComputeSymbol)!
const { fetchMaterialLs } = inject(PromoteActionSymbol)!

const selectProd = ref<number | string>('')
const selectTheme = ref<number | string>('')
const selectSize = ref<number | string>('')

const prodOptions = computed(() => {
  const ls = new Map()
  state.materialLs.forEach((m) => {
    if (!ls.has(m.PackageId)) {
      ls.set(m.PackageId, { label: m.PackageName, value: m.PackageId })
    }
  })
  return [{ label: '全部产品', value: '' }, ...ls.values()]
})

const themeOptions = computed(() => {
  const ls = new Map()
  const prodLs = [... prodOptions.value]
  // 移除第一筆預設值
  prodLs.shift()
  prodLs.forEach((prod: any) => {
    materialLsSelectByPid.value(prod.value).forEach((m) => {
      if (!ls.has(m.ThemeId)) {
        ls.set(m.ThemeId, { label: m.ThemeName, value: m.ThemeId })
      }
    })
  })

  return [{ label: '全部主题', value: '' }, ...ls.values()]
})

const sizeOptions = computed(() => {
  const ls = new Map()
  const prodLs = [... prodOptions.value]
  // 移除第一筆預設值
  prodLs.shift()
  prodLs.forEach((prod: any) => {
    materialLsSelectByPid.value(prod.value).forEach((m) => {
      if (!ls.has(m.SizeId)) {
        ls.set(m.SizeId, { label: m.SizeName, value: m.SizeId })
      }
    })
  })

  return [{ label: '全部尺寸', value: '' }, ...ls.values()]
})

const dataGroupBy = computed(() => {
  const data = state.materialLs
  return data.reduce<{
    [key in number]: {
    title: string,
    group: {
      [key in number]: {
        title: string
        group: Array<any>
      }
    }
    }
  }>((sum, cur) => {
    const productId = cur.PackageId
    const themeId = cur.ThemeId
    const sizeId = cur.SizeId
    const hasProductLs = sum?.[productId]
    const hasExistThemeLs = sum?.[productId]?.group?.[themeId]

    /** 產品id 存在狀態 */
    if (pId && pId.toString() !== productId.toString()) {
      return sum
    }

    /** 下拉選單選擇prod */
    if (selectProd.value !== '' && selectProd.value !== productId) return sum
    /** 下拉選單選擇theme */
    if (selectTheme.value !== '' && selectTheme.value !== themeId) return sum
    /** 下拉選單選擇size */
    if (selectSize.value !== '' && selectSize.value !== sizeId) return sum

    if (!hasProductLs) {
      return {
        ...sum,
        [productId]: {
          title: cur.PackageName,
          group: {
            [themeId]: {
              title: cur.ThemeName,
              group: [].concat(cur as any)
            }
          }
        }
      }
    }

    if (!hasExistThemeLs) {
      return {
        ...sum,
        [productId]: {
          ...hasProductLs,
          group: {
            ...hasProductLs.group,
            [themeId]: {
              title: cur.ThemeName,
              group: [].concat(cur as any)
            }
          }
        }
      }
    }

    return {
      ...sum,
      [productId]: {
        ...hasProductLs,
        group: {
          ...hasProductLs.group,
          [themeId]: {
            ...hasExistThemeLs,
            group: hasExistThemeLs.group.concat(cur)
          }
        }
      }
    }
  }, {})
})

const clickHandler = (pId: string, mId: number) => {
  const routeQuery = route.query
  router.push({ name: 'materialEdit', params: { productId: pId }, query: { ...routeQuery, mId }})
}

onMounted(() => {
  if (typeof fetchMaterialLs === 'function') {
    fetchMaterialLs({})
  }
})
</script>

<template>
  <div class="space-y-2">
    <div class="grid gap-1 px-1" :class="isProduct ? ' grid-cols-2': 'grid-cols-3'" >
      <Dropdown v-if="!isProduct" v-model="selectProd" class="dropDownCus" :options="prodOptions" placeholder="全部产品" />
      <Dropdown v-model="selectTheme" class="dropDownCus" :options="themeOptions" placeholder="全部主题" />
      <Dropdown v-model="selectSize" class="dropDownCus" :options="sizeOptions" placeholder="全部尺寸" />
    </div>

    <div :class="['space-y-4', !isProduct && '-mx-2']"> 
      <div v-for="(val, key) in dataGroupBy" :key="key" >
        <div v-for="(tVal, tKey) in val.group" :key="tKey">
          <div class="flex justify-between items-center p-2">
            <div v-if="!isProduct" class="text-xs flex items-center">
              <div class="w-0.5 h-2 rounded-md bg-primary-normal mr-1" />
              {{ val.title }}
            </div>
            <div class="border rounded-xl px-2 text-primary-normal text-xs bg-primary-normal/20">{{ tVal.title }}</div>
          </div>
  
          <div class="grid grid-cols-3 gap-1">
            <div
              v-for="(dVal, dKey) in tVal.group"
              :key="dKey"
              class="rounded-sm aspect-[121/156] shadow-sm flex justify-center items-center overflow-hidden relative"
              @click="clickHandler(dVal?.PackageId?.toString(), dVal.Id)
            ">
              <van-image use-error-slot use-loading-slot fit="cover" :src="getRemoteSourcePath(dVal.ImagePath)" class="w-full h-full"></van-image>
              <div class="absolute px-1 right-2 top-2 bg-black/50 rounded">
                <van-icon name="arrow" size="1rem" color="white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>

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