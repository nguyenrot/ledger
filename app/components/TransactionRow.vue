<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import { useEntrySheet } from '~/composables/useEntrySheet'
import { useCategories } from '~/composables/useCategories'
import type { Transaction } from '~/composables/useLedgerApi'

const props = defineProps<{
  row: Transaction
  showDate?: boolean
  index?: number
}>()

const sheet = useEntrySheet()
const cats = useCategories()
const { formatVnd, formatRelativeDate, formatTime } = useFormat()

const categoryLabel = computed(() => cats.labelFor(props.row.kind, props.row.category))
const categoryColor = computed(() => cats.colorFor(props.row.kind, props.row.category))

function handleClick() {
  sheet.openEdit(props.row)
}
</script>

<template>
  <button
    type="button"
    class="w-full flex items-center gap-3 px-1 py-3.5 text-left rounded-md
           hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)]
           transition-colors stagger-fade-up"
    :style="{ '--stagger-index': index ?? 0 }"
    @click="handleClick"
  >
    <!-- Category-tinted strip; doubles as kind indicator via vertical thickness -->
    <span class="relative shrink-0 flex items-center justify-center w-2">
      <span
        class="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[3px] rounded-full"
        :style="{ background: categoryColor }"
      />
    </span>

    <div class="flex-1 min-w-0">
      <div class="text-[15px] font-medium truncate leading-snug">
        {{ row.note || categoryLabel }}
      </div>
      <div class="text-xs text-[var(--color-text-dim)] truncate mt-0.5 flex items-center gap-1.5">
        <span class="dot opacity-70" :style="{ background: categoryColor }" />
        <template v-if="row.note">{{ categoryLabel }}</template>
        <template v-else>{{ formatTime(row.created_at) }}</template>
        <template v-if="showDate">
          <span class="text-[var(--color-text-dim)]/60">·</span>
          {{ formatRelativeDate(row.occurred_on) }}
        </template>
      </div>
    </div>

    <div
      class="text-base font-semibold num shrink-0"
      :class="row.kind === 'income' ? 'income' : 'expense'"
    >
      {{ row.kind === 'income' ? '+' : '−' }}{{ formatVnd(row.amount) }}
    </div>
  </button>
</template>
