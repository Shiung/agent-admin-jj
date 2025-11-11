<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { formatNumberToK, formatMoneyToK } from '@/utils/formatNumber'

const props = defineProps<{
  data: { name: string, data: { ReportMonth: string, ParamName: string, ParamValue: string }[] }[]
}>()

const chartRef = ref<HTMLDivElement>()
const chart = ref<echarts.ECharts | null>(null)
const colors = ['#5DD4FA', '#007AFF', '#72C240', '#FF9999' ]

const initChart = () => {
  if (!chartRef.value) return
  
  // 如果已經有實例，先銷毀
  if (chart.value) chart.value.dispose()
  
  const myChart = echarts.init(chartRef.value)
  
  // 數據
  const money1 = props.data[0]?.data.map((item) => Number(item.ParamValue)) ?? []
  const money2 = props.data[1]?.data.map((item) => Number(item.ParamValue)) ?? []
  const count1 = props.data[2]?.data.map((item) => Number(item.ParamValue)) ?? []
  const count2 = props.data[3]?.data.map((item) => Number(item.ParamValue)) ?? []
  
  // 計算右側軸的範圍（AAA + BBB）
  const rightMax = Math.max(...money1, ...money2)
  const rightMin = Math.min(...money1, ...money2)
  
  // 計算左側軸的範圍（CCC + DDD）
  const leftMax = Math.max(...count1, ...count2)
  const leftMin = Math.min(...count1, ...count2)
  
  const yMin = Math.floor(leftMin * 0.9)
  const yMax = Math.ceil(leftMax * 1.1)
  
  // 計算分割數量和繪製橫跨整個寬度的格線
  const splitNumber = 5
  const chartWidth = chartRef.value?.offsetWidth || 0
  const chartHeight = 400
  const topPadding = 20
  const bottomPadding = 30
  const gridHeight = chartHeight - topPadding - bottomPadding
  
  const gridLines = []
  for (let i = 0; i <= splitNumber; i++) {
    const yPercent = i / splitNumber
    const yPosition = topPadding + gridHeight * (1 - yPercent)
    
    gridLines.push({
      type: 'line',
      z: 0,
      shape: {
        x1: 0,
        y1: yPosition,
        x2: chartWidth,
        y2: yPosition
      },
      style: {
        stroke: '#f0f0f0',
        lineWidth: 1
      }
    })
  }
  
  myChart.setOption({
    color: colors,
    grid: {
      left: '0',
      right: '0',
      top: '20',
      bottom: '30',
      containLabel: false
    },
    graphic: [
      ...gridLines,
      // 下方月份背景
      {
        type: 'rect',
        z: 0,
        left: '0',
        bottom: '0',
        shape: {
          width: chartWidth,
          height: 30
        },
        style: {
          fill: '#f5f5f5'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      borderRadius: 16,
      borderWidth: 0,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      // formatter: (params: any) => {
      //   const month = params[0].axisValue
      //   let result = `<div style="font-weight: bold; margin-bottom: 8px;">${month}</div>`
        
      //   params.forEach((item: any) => {
      //     const value = item.seriesType === 'line' 
      //       ? formatMoneyToK(item.value)
      //       : formatNumberToK(item.value)
      //     result += `
      //       <div style="display: flex; align-items: center; margin-top: 4px;">
      //         <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 8px;"></span>
      //         <span style="flex: 1;">${item.seriesName}</span>
      //         <span style="font-weight: bold; margin-left: 12px;">${value}</span>
      //       </div>
      //     `
      //   })
        
      //   return result
      // },
      axisPointer: {
        axis: 'x',
        label: { show: false },
        lineStyle: { color: 'rgba(0, 122, 255, 0.5)' }
      },
    },
    legend: { show: false },
    xAxis: {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666'
      },
      data: props.data[0]?.data.map((item) => `${+dayjs(item.ReportMonth).format('MM')}月`) ?? [],
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        position: 'left',
        min: yMin,
        max: yMax,
        splitNumber: splitNumber,
        axisLine: {
          show: false,
          lineStyle: { color: '#999' }
        },
        axisLabel: {
          formatter: (value: number) => {
            // 人數沒有小數點，小數點就隱藏
            if (String(value).includes('.')) return ''
            return formatNumberToK(value)
          },
          color: '#666',
          verticalAlign: 'bottom'
        },
        splitLine: { show: false }
      },
      {
        type: 'value',
        position: 'right',
        min: Math.floor(rightMin * 0.9),
        max: Math.ceil(rightMax * 1.1),
        axisLine: {
          show: false,
          lineStyle: { color: '#999' }
        },
        axisLabel: {
          formatter: (value: number) => formatMoneyToK(value),
          color: '#666',
          verticalAlign: 'bottom'
        },
        splitLine: { show: false }
      }
    ],
    series: [
      { name: props.data[0]?.name, type: 'line', yAxisIndex: 1, data: money1 },
      { name: props.data[1]?.name, type: 'line', yAxisIndex: 1, data: money2 },
      { name: props.data[2]?.name, type: 'bar', yAxisIndex: 0, data: count1 },
      { name: props.data[3]?.name, type: 'bar', yAxisIndex: 0, data: count2 }
    ]
  })
  
  chart.value = myChart
}

watch(() => props.data, () => {
  initChart()
})

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  chart.value?.dispose()
})
</script>

<template>
  <div class="bg-white w-full">
    <div ref="chartRef" style="width: 100%; height: 400px;"></div>
  </div>
</template>
