<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import type { SummaryBucket } from '~/composables/useLedgerApi'

const props = defineProps<{
  buckets: SummaryBucket[]
  groupBy: 'day' | 'month'
}>()

const { formatVnd } = useFormat()

const chartHeight = 220
const padding = { top: 16, right: 8, bottom: 28, left: 8 }
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
  // bucket is YYYY-MM-DD or YYYY-MM
  const parts = bucket.split('-')
  if (props.groupBy === 'month') {
    return `T${parseInt(parts[1] || '0', 10)}`
  }
  return parts[2] || ''
}

const hoveredBucket = computed(() => {
  if (hovered.value === null) return null
  return props.buckets[hovered.value] ?? null
})
</script>

<template>
  <div class="card p-5 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <span class="label">Biểu đồ theo {{ groupBy === 'month' ? 'tháng' : 'ngày' }}</span>
      <div class="flex items-center gap-3 text-xs font-mono">
        <span class="flex items-center gap-1.5 text-[var(--color-emerald)]">
          <span class="w-2 h-2 bg-[var(--color-emerald)]" /> Thu
        </span>
        <span class="flex items-center gap-1.5 text-[var(--color-rose)]">
          <span class="w-2 h-2 bg-[var(--color-rose)]" /> Chi
        </span>
      </div>
    </div>

    <div v-if="buckets.length === 0" class="py-12 text-center text-sm text-[var(--color-fg-dim)]">
      Chưa có dữ liệu trong khoảng này.
    </div>

    <div v-else class="relative">
      <div class="overflow-x-auto -mx-2 px-2 pb-2">
        <svg
          :viewBox="`0 0 ${Math.max(buckets.length * 32, 200)} ${chartHeight}`"
          :width="Math.max(buckets.length * 32, 200)"
          :height="chartHeight"
          class="block"
          preserveAspectRatio="none"
        >
          <line
            :x1="0"
            :x2="Math.max(buckets.length * 32, 200)"
            :y1="chartHeight - padding.bottom"
            :y2="chartHeight - padding.bottom"
            stroke="rgba(26, 26, 46, 1)"
            stroke-width="1"
          />

          <g v-for="(b, i) in buckets" :key="b.bucket" :transform="`translate(${i * 32}, 0)`">
            <!-- Income bar -->
            <rect
              :x="4"
              :y="chartHeight - padding.bottom - barHeight(b.income)"
              :width="10"
              :height="barHeight(b.income)"
              fill="var(--color-emerald)"
              :opacity="hovered === i ? 1 : 0.78"
            />
            <!-- Expense bar -->
            <rect
              :x="16"
              :y="chartHeight - padding.bottom - barHeight(b.expense)"
              :width="10"
              :height="barHeight(b.expense)"
              fill="var(--color-rose)"
              :opacity="hovered === i ? 1 : 0.78"
            />
            <!-- Hover hitbox -->
            <rect
              :x="0"
              :y="0"
              :width="32"
              :height="chartHeight"
              fill="transparent"
              @mouseenter="hovered = i"
              @mouseleave="hovered = null"
            />
            <!-- Label -->
            <text
              :x="16"
              :y="chartHeight - 8"
              text-anchor="middle"
              fill="var(--color-fg-dim)"
              style="font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em;"
            >
              {{ shortLabel(b.bucket) }}
            </text>
          </g>
        </svg>
      </div>

      <div v-if="hoveredBucket" class="mt-2 text-xs font-mono">
        <span class="text-[var(--color-fg-muted)]">{{ hoveredBucket.bucket }}</span>
        <span class="ml-3 kind-income">+{{ formatVnd(hoveredBucket.income) }}</span>
        <span class="ml-3 kind-expense">−{{ formatVnd(hoveredBucket.expense) }}</span>
        <span
          class="ml-3"
          :class="hoveredBucket.net >= 0 ? 'kind-net-pos' : 'kind-net-neg'"
        >
          net {{ hoveredBucket.net >= 0 ? '+' : '−' }}{{ formatVnd(Math.abs(hoveredBucket.net)) }}
        </span>
      </div>
    </div>
  </div>
</template>
