<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import type { SummaryBucket } from '~/composables/useLedgerApi'

const props = defineProps<{
  buckets: SummaryBucket[]
  groupBy: 'day' | 'month'
}>()

const { formatVnd } = useFormat()

const chartHeight = 280
const padding = { top: 16, right: 8, bottom: 32, left: 8 }
const innerHeight = chartHeight - padding.top - padding.bottom

const maxBar = computed(() => {
  const peak = props.buckets.reduce((m, b) => Math.max(m, b.income, b.expense), 0)
  return peak === 0 ? 1 : peak
})

const hovered = ref<number | null>(null)

function barHeight(value: number): number {
  return Math.max(2, (value / maxBar.value) * innerHeight)
}

function shortLabel(bucket: string): string {
  const parts = bucket.split('-')
  if (props.groupBy === 'month') {
    return `T${parseInt(parts[1] || '0', 10)}`
  }
  return parts[2] || ''
}

const barColWidth = 36
const barColGap = 4

const hoveredBucket = computed(() => {
  if (hovered.value === null) return null
  return props.buckets[hovered.value] ?? null
})

const chartWidth = computed(() =>
  Math.max(props.buckets.length * barColWidth + barColGap, 240),
)
</script>

<template>
  <div class="card p-4 md:p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold">Theo {{ groupBy === 'month' ? 'tháng' : 'ngày' }}</h3>
      <div class="flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-[var(--color-income)]" /> Thu</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-[var(--color-expense)]" /> Chi</span>
      </div>
    </div>

    <div v-if="buckets.length === 0" class="py-12 text-center text-sm text-[var(--color-text-dim)]">
      Không có dữ liệu trong khoảng này.
    </div>

    <div v-else>
      <div class="overflow-x-auto -mx-2 px-2">
        <svg
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          :width="chartWidth"
          :height="chartHeight"
          class="block"
        >
          <!-- Baseline -->
          <line
            :x1="0"
            :x2="chartWidth"
            :y1="chartHeight - padding.bottom"
            :y2="chartHeight - padding.bottom"
            stroke="var(--color-border)"
            stroke-width="1"
          />

          <g v-for="(b, i) in buckets" :key="b.bucket" :transform="`translate(${i * barColWidth}, 0)`">
            <rect
              :x="6"
              :y="chartHeight - padding.bottom - barHeight(b.income)"
              :width="11"
              :height="barHeight(b.income)"
              fill="var(--color-income)"
              :opacity="hovered === null || hovered === i ? 0.95 : 0.45"
              rx="2"
            />
            <rect
              :x="19"
              :y="chartHeight - padding.bottom - barHeight(b.expense)"
              :width="11"
              :height="barHeight(b.expense)"
              fill="var(--color-expense)"
              :opacity="hovered === null || hovered === i ? 0.95 : 0.45"
              rx="2"
            />
            <rect
              :x="0"
              :y="0"
              :width="barColWidth"
              :height="chartHeight"
              fill="transparent"
              @mouseenter="hovered = i"
              @mouseleave="hovered = null"
              @touchstart.passive="hovered = i"
            />
            <text
              :x="barColWidth / 2"
              :y="chartHeight - 10"
              text-anchor="middle"
              fill="var(--color-text-dim)"
              style="font-size: 10px; font-family: var(--font-sans)"
            >
              {{ shortLabel(b.bucket) }}
            </text>
          </g>
        </svg>
      </div>

      <div v-if="hoveredBucket" class="mt-2 flex items-center gap-3 text-xs num">
        <span class="text-[var(--color-text-muted)]">{{ hoveredBucket.bucket }}</span>
        <span class="income">+{{ formatVnd(hoveredBucket.income) }}</span>
        <span class="expense">−{{ formatVnd(hoveredBucket.expense) }}</span>
      </div>
    </div>
  </div>
</template>
