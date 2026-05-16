<script setup lang="ts">
import { CATEGORY_LABELS, useFormat } from '~/composables/useFormat'
import { useEntrySheet } from '~/composables/useEntrySheet'
import type { Transaction } from '~/composables/useLedgerApi'

const props = defineProps<{
  row: Transaction
  showDate?: boolean
}>()

const sheet = useEntrySheet()
const { formatVnd, formatRelativeDate, formatTime } = useFormat()

const indicator = computed(() => (props.row.kind === 'income' ? 'income' : 'expense'))

function handleClick() {
  sheet.openEdit(props.row)
}
</script>

<template>
  <button
    type="button"
    class="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
    @click="handleClick"
  >
    <div
      class="w-1 h-10 rounded-full shrink-0"
      :class="indicator === 'income' ? 'bg-[var(--color-income)]' : 'bg-[var(--color-expense)]'"
    />
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">
        {{ row.note || CATEGORY_LABELS[row.category] || row.category }}
      </div>
      <div class="text-xs text-[var(--color-text-dim)] truncate">
        <template v-if="row.note">{{ CATEGORY_LABELS[row.category] || row.category }}</template>
        <template v-else>{{ formatTime(row.created_at) }}</template>
        <template v-if="showDate"> · {{ formatRelativeDate(row.occurred_on) }}</template>
      </div>
    </div>
    <div
      class="text-base font-semibold num shrink-0"
      :class="indicator === 'income' ? 'income' : 'expense'"
    >
      {{ row.kind === 'income' ? '+' : '−' }}{{ formatVnd(row.amount) }}
    </div>
  </button>
</template>
