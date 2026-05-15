<script setup lang="ts">
import { CATEGORY_LABELS, useFormat } from '~/composables/useFormat'
import type { Transaction } from '~/composables/useLedgerApi'

const props = defineProps<{
  rows: Transaction[]
  emptyHint?: string
  showDate?: boolean
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const { formatVnd, formatRelativeDate, formatTime } = useFormat()

function handleDelete(row: Transaction) {
  const preview = row.note || CATEGORY_LABELS[row.category] || row.category
  if (confirm(`Xoá giao dịch "${preview}" — ${formatVnd(row.amount)}?`)) {
    emit('delete', row.id)
  }
}
</script>

<template>
  <div v-if="rows.length === 0" class="card p-6 text-center text-sm text-[var(--color-fg-dim)]">
    {{ emptyHint || 'Chưa có giao dịch nào trong khoảng này.' }}
  </div>
  <ul v-else class="space-y-1.5">
    <li
      v-for="row in rows"
      :key="row.id"
      class="card group flex items-center gap-3 px-4 py-3 hover:border-[var(--color-cyan)]/40 transition-colors"
    >
      <div
        class="w-1 h-10 rounded-full"
        :class="row.kind === 'income' ? 'bg-[var(--color-emerald)]' : 'bg-[var(--color-rose)]'"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-fg-muted)]">
          <span>{{ CATEGORY_LABELS[row.category] || row.category }}</span>
          <span v-if="showDate" class="text-[var(--color-fg-dim)]">· {{ formatRelativeDate(row.occurred_on) }}</span>
          <span class="text-[var(--color-fg-dim)] hidden sm:inline">· {{ formatTime(row.created_at) }}</span>
        </div>
        <div v-if="row.note" class="text-sm text-[var(--color-fg)] truncate mt-0.5">{{ row.note }}</div>
      </div>
      <div
        class="text-right font-display text-lg tracking-wide tabular-nums"
        :class="row.kind === 'income' ? 'kind-income' : 'kind-expense'"
      >
        {{ row.kind === 'income' ? '+' : '−' }}{{ formatVnd(row.amount) }}
      </div>
      <button
        class="opacity-0 group-hover:opacity-100 text-[var(--color-fg-dim)] hover:text-[var(--color-rose)] text-xs font-mono transition-opacity"
        :title="`Xoá giao dịch ${row.id}`"
        @click="handleDelete(row)"
      >
        ✕
      </button>
    </li>
  </ul>
</template>
