<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'

const props = defineProps<{
  income: number
  expense: number
  net: number
  count?: number
  label?: string
}>()

const { formatVnd, formatSignedVnd } = useFormat()
</script>

<template>
  <div class="card card-glow p-5 sm:p-6">
    <div class="flex items-baseline justify-between mb-4">
      <span class="label">{{ label || 'Tổng kết' }}</span>
      <span v-if="count !== undefined" class="text-xs text-[var(--color-fg-dim)] font-mono">{{ count }} giao dịch</span>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-baseline justify-between">
        <span class="text-xs font-mono uppercase tracking-wider text-[var(--color-fg-dim)]">Thu</span>
        <span class="text-lg font-display tabular-nums kind-income">+{{ formatVnd(income) }}</span>
      </div>
      <div class="flex items-baseline justify-between">
        <span class="text-xs font-mono uppercase tracking-wider text-[var(--color-fg-dim)]">Chi</span>
        <span class="text-lg font-display tabular-nums kind-expense">−{{ formatVnd(expense) }}</span>
      </div>
      <div class="h-px bg-[var(--color-border)] my-3" />
      <div class="flex items-baseline justify-between">
        <span class="text-xs font-mono uppercase tracking-wider text-[var(--color-fg-muted)]">Net</span>
        <span
          class="text-2xl font-display tabular-nums"
          :class="net >= 0 ? 'kind-net-pos' : 'kind-net-neg'"
        >
          {{ formatSignedVnd(net) }}
        </span>
      </div>
    </div>
  </div>
</template>
