<script setup lang="ts">
import type { LedgerKind } from '~/composables/useLedgerApi'

const props = defineProps<{
  modelValue: LedgerKind
}>()
const emit = defineEmits<{
  'update:modelValue': [v: LedgerKind]
}>()

function set(v: LedgerKind) {
  if (props.modelValue !== v) emit('update:modelValue', v)
}
</script>

<template>
  <div class="relative grid grid-cols-2 bg-[var(--color-surface-2)] p-1 rounded-xl border border-[var(--color-border)]">
    <!-- Sliding indicator — premium feel vs. instant background swap -->
    <div
      class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out"
      :class="modelValue === 'expense' ? 'bg-[var(--color-expense)] left-1' : 'bg-[var(--color-income)] left-1 translate-x-[calc(100%+4px)]'"
      aria-hidden="true"
    />

    <button
      type="button"
      class="relative z-10 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
      :class="modelValue === 'expense' ? 'text-[#2a0808]' : 'text-[var(--color-text-muted)]'"
      @click="set('expense')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
      Chi
    </button>
    <button
      type="button"
      class="relative z-10 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
      :class="modelValue === 'income' ? 'text-[#04201f]' : 'text-[var(--color-text-muted)]'"
      @click="set('income')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
      Thu
    </button>
  </div>
</template>
