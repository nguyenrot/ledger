<script setup lang="ts">
import { CATEGORY_COLORS, CATEGORY_LABELS, useFormat } from '~/composables/useFormat'
import type { SummaryCategoryRow } from '~/composables/useLedgerApi'

const props = defineProps<{
  rows: SummaryCategoryRow[]
  title: string
  kind: 'income' | 'expense'
}>()

const { formatVnd } = useFormat()

const total = computed(() => props.rows.reduce((s, r) => s + r.amount, 0))

interface Slice {
  category: string
  amount: number
  pct: number
  color: string
  arc: string  // SVG path d="..."
}

const slices = computed<Slice[]>(() => {
  if (total.value === 0) return []
  const cx = 60
  const cy = 60
  const radius = 50
  const innerRadius = 30
  let cumulative = 0

  const result: Slice[] = []
  for (const row of props.rows) {
    const pct = row.amount / total.value
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += pct
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const largeArc = pct > 0.5 ? 1 : 0

    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)
    const xi2 = cx + innerRadius * Math.cos(endAngle)
    const yi2 = cy + innerRadius * Math.sin(endAngle)
    const xi1 = cx + innerRadius * Math.cos(startAngle)
    const yi1 = cy + innerRadius * Math.sin(startAngle)

    result.push({
      category: row.category,
      amount: row.amount,
      pct,
      color: CATEGORY_COLORS[row.category] || '#94a3b8',
      arc: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi1} ${yi1} Z`,
    })
  }
  return result
})

const hovered = ref<string | null>(null)
</script>

<template>
  <div class="card p-5 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <span class="label">{{ title }}</span>
      <span class="text-xs font-mono text-[var(--color-fg-dim)]">{{ rows.length }} loại</span>
    </div>

    <div v-if="rows.length === 0" class="py-8 text-center text-sm text-[var(--color-fg-dim)]">
      Chưa có {{ kind === 'income' ? 'khoản thu' : 'khoản chi' }} nào.
    </div>

    <div v-else class="grid sm:grid-cols-2 gap-4 items-center">
      <div class="flex justify-center">
        <svg viewBox="0 0 120 120" width="160" height="160">
          <path
            v-for="s in slices"
            :key="s.category"
            :d="s.arc"
            :fill="s.color"
            :opacity="hovered === null || hovered === s.category ? 0.9 : 0.35"
            stroke="var(--color-bg)"
            stroke-width="1"
            class="transition-opacity"
            @mouseenter="hovered = s.category"
            @mouseleave="hovered = null"
          />
        </svg>
      </div>

      <ul class="space-y-1.5 text-sm">
        <li
          v-for="s in slices"
          :key="s.category"
          class="flex items-center gap-2 px-2 py-1 rounded-md cursor-default transition-colors"
          :class="hovered === s.category ? 'bg-[rgba(0,245,255,0.05)]' : ''"
          @mouseenter="hovered = s.category"
          @mouseleave="hovered = null"
        >
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: s.color }" />
          <span class="flex-1 truncate font-mono text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
            {{ CATEGORY_LABELS[s.category] || s.category }}
          </span>
          <span class="tabular-nums text-xs font-mono text-[var(--color-fg)]">{{ formatVnd(s.amount) }}</span>
          <span class="tabular-nums text-xs font-mono text-[var(--color-fg-dim)] w-12 text-right">
            {{ (s.pct * 100).toFixed(0) }}%
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
