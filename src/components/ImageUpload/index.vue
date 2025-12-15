<script setup lang="ts">
import { useAttrs, ref, watch } from 'vue'
import type { UploaderProps, UploaderFileListItem } from 'vant'
import API from '@/apis'

const attrs = useAttrs()

/** v-model van-uploader的v-model檔案陣列 */
const model = defineModel<UploaderFileListItem[]>('modelValue', { required: true })

const props = withDefaults(
  defineProps<{
    /** 檔案限制大小 */
    fileMax?: number
    /** 檔案限制大小單位 */
    fileMaxUnits?: 'kb' | 'mb'
    
    /** 檔案最大數量 */
    maxCount?: UploaderProps['maxCount']

    [key: string]: any
  }>(),
  {
    maxCount: 1,
    fileMax: 15,
    fileMaxUnits: 'mb'
  }
)

const emit = defineEmits<{
  'change': [value: string[]]
}>()

/** 上傳後拿到的檔案路徑陣列 */
const urls = ref<string[]>([])
watch(urls, (newVal) => {
  emit('change', newVal)
}, { deep: true })
/** 清空urls */
const cleanUrls = () => {
  urls.value = []
}

const ALLOW_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const getFileMaxBytes = () => {
  if (props.fileMaxUnits === 'kb') return props.fileMax * 1024
  if (props.fileMaxUnits === 'mb') return props.fileMax * 1024 * 1024
  return props.fileMax
}
const getFileMaxUnits = () => {
  if (props.fileMaxUnits === 'kb') return 'KB'
  if (props.fileMaxUnits === 'mb') return 'M'
  return props.fileMaxUnits
}
/** 上傳前判斷 */
const beforeRead = (file: File | File[]) => {
  const files = Array.isArray(file) ? file : [file]

  for (const f of files) {
    if (!ALLOW_TYPES.includes(f.type)) {
      showToast({
        message: '图片只能是 PNG, JPG, JPEG 格式', 
        position: 'top'
      })
      return false
    }
  }

  return true
}

/** 上傳判斷 */
const afterRead = async (file: any) => {
  file.status = 'uploading'
  file.message = '上传中...'
  try {
    const res = await API.system.uploadImageMd5({ upfile: file.file })
    if (res.data.Code === 200) {
      file.status = 'done'
      file.message = '上传成功'
      urls.value = [...urls.value, res.data.Data.url]
    } else {
      removeFile(file)
    }
  } catch (err) {
    console.log('err', err)
    removeFile(file)
  }
}

/** 上傳失敗直接移除 */
const removeFile = (file: UploaderFileListItem) => {
  const index = model.value.indexOf(file)
  if (index !== -1) {
    model.value.splice(index, 1)
    urls.value.splice(index, 1)
  }
}

/** 刪除前判斷 */
const beforeDelete = (file: UploaderFileListItem, detail: { index: number }) => {
  // model.value.splice(detail.index, 1)
  urls.value.splice(detail.index, 1)
  return true
}

/** 超過檔案大小提示 */
const onOversize = (file: File) => {
  const unitLabel = getFileMaxUnits()
  showToast({
    message: `文件大小不能超过 ${props.fileMax}${unitLabel}`, 
    position: 'top'
  })
}

defineExpose({
  cleanUrls
})
</script>

<template>
  <div>
    <van-uploader 
      v-model="model" 
      :max-count="props.maxCount"
      v-bind="attrs" 
      :max-size="getFileMaxBytes()"
      :before-read="beforeRead"
      :after-read="afterRead" 
      :before-delete="beforeDelete"
      image-fit="contain"
      @oversize="onOversize"
    >
      <van-image src="./static/images/common/uploadImage.png" fit="contain" class="size-20" />
    </van-uploader>
    <div class="w-full text-xs font-normal leading-5 text-neutral2-tertiary">
      图片格式为jpeg、jpg、png 且大小不超过{{ props.fileMax }}{{ getFileMaxUnits() }}
    </div>
  </div>
</template>
