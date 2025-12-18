<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'

  interface Props {
    title?: string
    onComplete?: (pattern: number[]) => void
    onError?: () => void
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '设置手势密码',
  })

  const emit = defineEmits<{
    complete: [pattern: number[]]
    error: []
  }>()

  // 3x3
  const points = Array.from({ length: 9 }, (_, i) => i)
  const selectedPoints = ref<number[]>([])
  const isDrawing = ref(false)
  const currentPoint = ref<number | null>(null)

  const containerRef = ref<HTMLDivElement>()
  const pointPositions = ref<Array<{ x: number; y: number }>>([])

  const items = computed(() => {
    return points.map((_, index) => ({
      active: isPointSelected(index),
    }))
  })

  const currentMousePos = ref<{ x: number; y: number } | null>(null)

  const currentLine = computed(() => {
    if (!isDrawing.value || selectedPoints.value.length === 0 || pointPositions.value.length === 0) {
      return null
    }
    const lastPoint = selectedPoints.value[selectedPoints.value.length - 1]
    if (lastPoint === undefined) return null

    const lastPos = pointPositions.value[lastPoint]
    if (!lastPos) return null

    if (currentMousePos.value) {
      return {
        from: lastPos,
        to: currentMousePos.value,
      }
    }

    if (currentPoint.value !== null && currentPoint.value !== undefined) {
      const toPos = pointPositions.value[currentPoint.value]
      if (!toPos) return null
      return {
        from: lastPos,
        to: toPos,
      }
    }

    return null
  })

  const isPointSelected = (index: number) => {
    return selectedPoints.value.includes(index)
  }


  const getPointPosition = (index: number) => {
    if (!containerRef.value) return { x: 0, y: 0 }
    const containerRect = containerRef.value.getBoundingClientRect()

    // 找到對應點的 DOM
    const pointsContainer = containerRef.value.querySelector('.points')
    if (!pointsContainer) {
      const gap = 32
      const itemSize = 60
      const row = Math.floor(index / 3)
      const col = index % 3
      const x = gap + col * (itemSize + gap) + itemSize / 2
      const y = gap + row * (itemSize + gap) + itemSize / 2
      return { x, y }
    }

    const items = pointsContainer.querySelectorAll('.item')
    const item = items[index] as HTMLElement
    if (!item) {
      const gap = 32
      const itemSize = 60
      const row = Math.floor(index / 3)
      const col = index % 3
      const x = gap + col * (itemSize + gap) + itemSize / 2
      const y = gap + row * (itemSize + gap) + itemSize / 2
      return { x, y }
    }

    const itemRect = item.getBoundingClientRect()
    const x = itemRect.left - containerRect.left + itemRect.width / 2
    const y = itemRect.top - containerRect.top + itemRect.height / 2

    return { x, y }
  }

  const initPointPositions = () => {
    if (!containerRef.value) return
    setTimeout(() => {
      pointPositions.value = points.map((_, index) => getPointPosition(index))
    }, 0)
  }

  const getTouchPosition = (e: TouchEvent | MouseEvent): { x: number; y: number } | null => {
    if (!containerRef.value) return null
    const rect = containerRef.value.getBoundingClientRect()
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0]
      if (!touch) return null
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    return null
  }

  const findNearestPoint = (x: number, y: number): number | null => {
    if (pointPositions.value.length === 0) return null

    let minDistance = Infinity
    let nearestIndex: number | null = null

    pointPositions.value.forEach((pos, index) => {
      if (!pos) return
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))
      if (distance < minDistance && distance < 50) {
        minDistance = distance
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  const startDraw = (e: TouchEvent | MouseEvent) => {
    e.preventDefault()
    isDrawing.value = true
    selectedPoints.value = []
    currentPoint.value = null

    const pos = getTouchPosition(e)
    if (!pos) return

    const nearest = findNearestPoint(pos.x, pos.y)
    if (nearest !== null) {
      selectedPoints.value.push(nearest)
      currentPoint.value = nearest
    }
  }

  const draw = (e: TouchEvent | MouseEvent) => {
    if (!isDrawing.value) return
    e.preventDefault()

    const pos = getTouchPosition(e)
    if (!pos) return

    currentMousePos.value = pos

    const nearest = findNearestPoint(pos.x, pos.y)
    if (nearest !== null && nearest !== currentPoint.value) {
      if (!selectedPoints.value.includes(nearest)) {
        selectedPoints.value.push(nearest)
        currentPoint.value = nearest
      }
    } else if (nearest === null) {
      currentPoint.value = null
    }
  }

  const endDraw = () => {
    if (!isDrawing.value) return
    isDrawing.value = false
    currentMousePos.value = null

    if (selectedPoints.value.length >= 4) {
      // 至少需要4個點
      emit('complete', [...selectedPoints.value])
      props.onComplete?.(selectedPoints.value)
    } else {
      emit('error')
      props.onError?.()
      setTimeout(() => {
        selectedPoints.value = []
        currentPoint.value = null
      }, 500)
    }
  }

  const lineSegment = computed(() => {
    const segments: Array<{ top: number; left: number; width: number; angle: number }> = []
    const lineHeight = 4 // 线条高度

    for (let i = 0; i < selectedPoints.value.length - 1; i++) {
      const from = selectedPoints.value[i]
      const to = selectedPoints.value[i + 1]
      if (from === undefined || to === undefined) continue

      const fromPos = pointPositions.value[from]
      const toPos = pointPositions.value[to]
      if (!fromPos || !toPos) continue

      const dx = toPos.x - fromPos.x
      const dy = toPos.y - fromPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      segments.push({
        top: fromPos.y - lineHeight / 2, // 线条垂直中心对齐小圆中心
        left: fromPos.x, // 起点 x（小圆中心）
        width: distance, // 两点之间的距离
        angle, // 旋转角度
      })
    }

    // 當前正在繪製的線條段
    if (currentLine.value && currentLine.value.from && currentLine.value.to) {
      const { from, to } = currentLine.value
      const dx = to.x - from.x
      const dy = to.y - from.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      segments.push({
        top: from.y - lineHeight / 2, // 线条垂直中心对齐小圆中心
        left: from.x, // 起点 x（小圆中心）
        width: distance, // 两点之间的距离
        angle, // 旋转角度
      })
    }

    return segments
  })

  const reset = () => {
    selectedPoints.value = []
    currentPoint.value = null
    currentMousePos.value = null
    isDrawing.value = false
  }

  defineExpose({
    reset,
  })

  onMounted(() => {
    initPointPositions()
    window.addEventListener('resize', initPointPositions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', initPointPositions)
  })
  </script>

  <template>
    <div class="flex flex-col items-center">
      <p class="text-center text-base text-neutral-basic mb-8">{{ title }}</p>

      <div
        ref="containerRef"
        class="relative touch-none select-none gesture-box"
        @touchstart="startDraw"
        @touchmove="draw"
        @touchend="endDraw"
        @mousedown="startDraw"
        @mousemove="draw"
        @mouseup="endDraw"
        @mouseleave="endDraw"
      >
        <!-- 點點區塊 -->
        <div class="points grid grid-cols-3 gap-9 h-full w-full">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="item flex items-center justify-center"
            :class="{ active: item.active }"
            style="width: 60px; height: 60px;"
          >
            <div class="relative rounded-full border-2 transition-all"
              :class="{
                'bg-blue-600/5 border-blue-600/5': item.active,
                'border-blue-950/10': !item.active,
              }"
              style="width: 60px; height: 60px;"
            >
              <div
                v-if="item.active"
                class="absolute rounded-full bg-primary-normal w-6 h-6"
                style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
              />
            </div>
          </div>
        </div>

        <div
          v-for="(line, index) in lineSegment"
          :key="`line-${index}`"
          class="line-segment absolute pointer-events-none"
          :style="{
            top: line.top + 'px',
            left: line.left + 'px',
            width: line.width + 'px',
            transform: 'rotate(' + line.angle + 'deg)',
            height: '3px',
            backgroundColor: '#007aff',
            'transform-origin': '0 50%',
            borderRadius: '2px',
          }"
        />
      </div>
    </div>
  </template>

