<!-- 會員充值 - 會員充值記錄 - 訂單狀態 - 對話紀錄 -->
<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface Props {
  show: boolean
  data: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const list = computed(() => {
  if (!props.data) return []
  return JSON.parse(props.data)
})

const formatTime = (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
</script>

<template>
  <BottomPopup 
    :show="show" 
    title="对话记录"
    :showButton="false"
    @close="emit('update:show', false)"
  >
    <div v-if="list.length > 0" class="flex flex-col gap-2 px-4 py-3">
      <div v-for="(item, index) in list" :key="index" class="flex flex-col p-3 rounded-2xl text-xs font-normal leading-5 bg-bg-floor-1-2">
        <div class="px-3 bg-white rounded-2xl">
          <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic">
            <div class="min-w-20">回覆人员</div>
            <div class="text-right break-all font-semibold">{{ item.reply_user }}</div>
          </div>

          <div class="flex justify-between py-2 leading-5 gap-3 text-xs text-neutral2-basic border-t border-t-neutral2-sixth">
            <div class="min-w-20">讯息内容</div>
            <div class="text-right font-semibold">{{ item.reply_text }}</div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-2">
          <div>回覆时间</div>
          <div>{{ formatTime(item.update_time * 1000) }}</div>
        </div>
      </div>
    </div>
    
    <empty v-if="list.length === 0" />
  </BottomPopup>
</template>