<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import type { SummaryBucket } from '~/composables/useLedgerApi'

const props = defineProps<{
  buckets: SummaryBucket[]
  groupBy: 'day' | 'month'
}>()

const { formatVnd } = useFormat()

const chartHeight = 240
const padding = { top: 12, right: 8, bottom: 30, left: 8 }
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

const hoveredBucket = computed(() => {
  if (hovered.value === null) return null
  return props.buckets[hovered.value] ?? null
})

const chartWidth = computed(() =>
  Math.max(props.buckets.length * barColWidth, 240),
)
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4 px-0.5">
      <h3 class="eyebrow">Theo {{ groupBy === 'month' ? 'tháng' : 'ngày' }}</h3>
      <div class="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span class="flex items-center gap-1.5">
          <span class="dot bg-[var(--color-income)]" />
          Thu
        </span>
        <span class="flex items-center gap-1.5">
          <span class="dot bg-[var(--color-expense)]" />
          Chi
        </span>
      </div>
    </div>

    <div v-if="buckets.length === 0" class="py-14 text-center text-sm text-[var(--color-text-dim)]">
      Không có dữ liệu trong khoảng này.
    </div>

    <div v-else>
      <div class="overflow-x-auto -mx-2 px-2">
        <svg
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          :width="chartWidth"
          :height="chartHeight"
          class="block"
          role="img"
          aria-label="Biểu đồ thu chi"
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
              :opacity="hovered === null || hovered === i ? 1 : 0.35"
              rx="3"
              class="transition-opacity duration-150"
            />
            <rect
              :x="19"
              :y="chartHeight - padding.bottom - barHeight(b.expense)"
              :width="11"
              :height="barHeight(b.expense)"
              fill="var(--color-expense)"
              :opacity="hovered === null || hovered === i ? 1 : 0.35"
              rx="3"
              class="transition-opacity duration-150"
            />
            <!-- Hit area + hover highlight -->
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
            <rect
              v-if="hovered === i"
              :x="2"
              :y="padding.top"
              :width="barColWidth - 4"
              :height="innerHeight"
              fill="var(--color-surface-2)"
              opacity="0.4"
              rx="4"
            />
            <text
              :x="barColWidth / 2"
              :y="chartHeight - 10"
              text-anchor="middle"
              fill="var(--color-text-dim)"
              style="font-size: 10px; font-family: var(--font-mono); letter-spacing: -0.02em;"
            >
              {{ shortLabel(b.bucket) }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Tooltip-style hover detail -->
      <div
        class="mt-3 px-3 py-2.5 surface-2 border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs min-h-[2.75rem] transition-opacity duration-150"
        :class="hoveredBucket ? 'opacity-100' : 'opacity-50'"
      >
        <span class="num text-[var(--color-text-muted)]">
          {{ hoveredBucket?.bucket ?? '— di chuyển chuột lên cột —' }}
        </span>
        <div v-if="hoveredBucket" class="flex items-center gap-4 num">
          <span class="income">+{{ formatVnd(hoveredBucket.income) }}</span>
          <span class="expense">−{{ formatVnd(hoveredBucket.expense) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
