<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fakeMaterial } from '../fake'

const route = useRoute()
const router = useRouter()
const pId = route.params?.productId
const isProduct = !!pId

const data = ref<Array<any>>(fakeMaterial)

// const dataGroupBy = computed<{ [key in number]: { [key in number]: Array<any> } }>(() => {
//   return data.value.reduce((sum, cur) => {
//     const productId = cur.PackageId
//     const themeId = cur.ThemeId
//     const hasProductLs = sum?.[productId]
//     const hasExistThemeLs = sum?.[productId]?.[themeId]

//     if (!hasProductLs) {
//       return {
//         ...sum,
//         [productId]: {
//           [themeId]: [].concat(cur)
//         }
//       }
//     }

//     if (!hasExistThemeLs) {
//       return {
//         ...sum,
//         [productId]: {
//           ...hasProductLs,
//           [themeId]: [].concat(cur)
//         }
//       }
//     }

//     return {
//       ...sum,
//       [productId]: {
//         ...hasProductLs,
//         [themeId]: hasExistThemeLs.concat(cur)
//       }
//     }
//   }, {})
// })

const dataGroupBy = computed<{
  [key in number]: {
    title: string,
    group: {
      [key in number]: {
        title: string
        group: Array<any>
      }
    }
    }
}>(() => {
  return data.value.reduce((sum, cur) => {
    const productId = cur.PackageId
    const themeId = cur.ThemeId
    const hasProductLs = sum?.[productId]
    const hasExistThemeLs = sum?.[productId]?.group?.[themeId]

    /** 產品id 存在狀態 */
    if (pId && pId.toString() !== productId.toString()) {
      return sum
    }

    if (!hasProductLs) {
      return {
        ...sum,
        [productId]: {
          title: cur.PackageName,
          group: {
            [themeId]: {
              title: cur.ThemeName,
              group: [].concat(cur)
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
              group: [].concat(cur)
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

const clickHandler = (pId: string ) => {
  router.push({ name: 'materialEdit', params: { productId: pId }})
}

watchEffect(() => {
  console.log('ls', dataGroupBy.value)
})

onMounted(() => {
  console.log('isProduct', isProduct, pId)
})
</script>

<template>
  <div>
    <!-- 素材
    <div>drop down zone</div> -->

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
            <div v-for="(dVal, dKey) in tVal.group" :key="dKey" class="rounded-sm aspect-[121/156] shadow-sm flex justify-center items-center overflow-hidden relative" @click="clickHandler(dVal?.PackageId?.toString())">
              <!-- {{ dVal.Id }} -->
              <!-- <img :src="dVal.ImagePath" class="" /> -->
              <van-image use-error-slot use-loading-slot fit="cover" :src="dVal.ImagePath" class="w-full h-full"></van-image>
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