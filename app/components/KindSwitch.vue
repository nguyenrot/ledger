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
  <div class="grid grid-cols-2 gap-1.5 bg-[var(--color-surface-2)] p-1 rounded-lg">
    <button
      type="button"
      class="py-2.5 rounded-md text-sm font-semibold transition-colors"
      :class="modelValue === 'expense'
        ? 'bg-[var(--color-expense)] text-[#2a0808]'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
      @click="set('expense')"
    >
      − Chi
    </button>
    <button
      type="button"
      class="py-2.5 rounded-md text-sm font-semibold transition-colors"
      :class="modelValue === 'income'
        ? 'bg-[var(--color-income)] text-[#062a1a]'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
      @click="set('income')"
    >
      + Thu
    </button>
  </div>
</template>
