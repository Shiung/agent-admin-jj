<script setup lang="ts">
import SummaryCard from '@/components/SummaryCard/index.vue'

interface Props {
  total: number
}

const props = defineProps<Props>()
</script>

<template>
  <SummaryCard
    label="总盈利"
    :value="props.total"
    icon="/static/images/common/creditWalletIcon.png"
    color-type="signed"
  />
</template>
