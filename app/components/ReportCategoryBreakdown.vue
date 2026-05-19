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
  const radius = 44
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
      color: cats.colorFor(props.kind, row.category),
      arc: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi1} ${yi1} Z`,
    })
  }
  return result
})

const hovered = ref<string | null>(null)
const hoveredSlice = computed(() => slices.value.find((s) => s.category === hovered.value))
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4 px-0.5">
      <h3 class="eyebrow">{{ title }}</h3>
      <span class="label-dim num">{{ rows.length }} loại</span>
    </div>

    <div v-if="rows.length === 0" class="py-10 text-center text-sm text-[var(--color-text-dim)]">
      Chưa có khoản {{ kind === 'income' ? 'thu' : 'chi' }} nào.
    </div>

    <div v-else class="grid grid-cols-[136px_1fr] md:grid-cols-[160px_1fr] gap-5 items-center">
      <!-- Donut with center total -->
      <div class="relative aspect-square">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <path
            v-for="s in slices"
            :key="s.category"
            :d="s.arc"
            :fill="s.color"
            :opacity="hovered === null || hovered === s.category ? 1 : 0.3"
            stroke="var(--color-bg)"
            stroke-width="1.2"
            class="transition-opacity duration-150 cursor-pointer"
            @mouseenter="hovered = s.category"
            @mouseleave="hovered = null"
          />
        </svg>
        <!-- Center label — total or hovered amount -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
            {{ hoveredSlice ? `${(hoveredSlice.pct * 100).toFixed(0)}%` : 'Tổng' }}
          </span>
          <span class="num text-sm font-semibold mt-0.5"
                :class="kind === 'income' ? 'income' : 'expense'">
            {{ formatVnd(hoveredSlice ? hoveredSlice.amount : total) }}
          </span>
        </div>
      </div>

      <ul class="space-y-1.5 text-sm">
        <li
          v-for="s in slices"
          :key="s.category"
          class="flex items-center gap-2.5 px-2 py-1 rounded-md cursor-default transition-colors"
          :class="hovered === s.category ? 'bg-[var(--color-surface-2)]' : ''"
          @mouseenter="hovered = s.category"
          @mouseleave="hovered = null"
        >
          <span class="dot shrink-0" :style="{ background: s.color }" />
          <span class="flex-1 truncate text-[var(--color-text)]">
            {{ cats.labelFor(props.kind, s.category) }}
          </span>
          <span class="num text-[var(--color-text)] text-xs">{{ formatVnd(s.amount) }}</span>
          <span class="num text-[var(--color-text-dim)] text-xs w-9 text-right">
            {{ (s.pct * 100).toFixed(0) }}%
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
