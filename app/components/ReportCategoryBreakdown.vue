<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import { useCategories } from '~/composables/useCategories'
import type { SummaryCategoryRow } from '~/composables/useLedgerApi'

const props = defineProps<{
  rows: SummaryCategoryRow[]
  title: string
  kind: 'income' | 'expense'
}>()

const cats = useCategories()
onMounted(cats.ensureLoaded)

const { formatVnd } = useFormat()

const total = computed(() => props.rows.reduce((s, r) => s + r.amount, 0))

interface Slice {
  category: string
  amount: number
  pct: number
  color: string
  arc: string
}

const slices = computed<Slice[]>(() => {
  if (total.value === 0) return []
  const cx = 50
  const cy = 50
  const radius = 42
  const innerRadius = 26
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
      color: cats.colorFor(props.kind, row.category),
      arc: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi1} ${yi1} Z`,
    })
  }
  return result
})

const hovered = ref<string | null>(null)
</script>

<template>
  <div class="card p-4 md:p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold">{{ title }}</h3>
      <span class="label-dim">{{ rows.length }} loại</span>
    </div>

    <div v-if="rows.length === 0" class="py-6 text-center text-sm text-[var(--color-text-dim)]">
      Chưa có khoản {{ kind === 'income' ? 'thu' : 'chi' }} nào.
    </div>

    <div v-else class="grid grid-cols-[112px_1fr] gap-4 items-center">
      <svg viewBox="0 0 100 100" class="w-28 h-28">
        <path
          v-for="s in slices"
          :key="s.category"
          :d="s.arc"
          :fill="s.color"
          :opacity="hovered === null || hovered === s.category ? 0.95 : 0.4"
          stroke="var(--color-bg)"
          stroke-width="1"
          class="transition-opacity"
          @mouseenter="hovered = s.category"
          @mouseleave="hovered = null"
        />
      </svg>

      <ul class="space-y-1 text-sm">
        <li
          v-for="s in slices"
          :key="s.category"
          class="flex items-center gap-2 cursor-default"
          @mouseenter="hovered = s.category"
          @mouseleave="hovered = null"
        >
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: s.color }" />
          <span class="flex-1 truncate text-[var(--color-text-muted)]">
            {{ cats.labelFor(props.kind, s.category) }}
          </span>
          <span class="num text-[var(--color-text)] text-xs">{{ formatVnd(s.amount) }}</span>
          <span class="num text-[var(--color-text-dim)] text-xs w-9 text-right">
            {{ (s.pct * 100).toFixed(0) }}%
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
