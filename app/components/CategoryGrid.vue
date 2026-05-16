<script setup lang="ts">
import { CATEGORY_LABELS } from '~/composables/useFormat'
import type { LedgerKind } from '~/composables/useLedgerApi'

const props = defineProps<{
  modelValue: string
  kind: LedgerKind
}>()
const emit = defineEmits<{
  'update:modelValue': [v: string]
}>()

const incomeCats = ['salary', 'bonus', 'other']
const expenseCats = ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'other']

const cats = computed(() => (props.kind === 'income' ? incomeCats : expenseCats))

// Re-anchor selected to the first valid category when kind flips.
watch(
  () => props.kind,
  () => {
    if (!cats.value.includes(props.modelValue)) {
      emit('update:modelValue', cats.value[0]!)
    }
  },
)

function set(c: string) {
  if (props.modelValue !== c) emit('update:modelValue', c)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-1.5">
    <button
      v-for="c in cats"
      :key="c"
      type="button"
      class="chip py-2.5 text-sm"
      :class="modelValue === c ? 'chip-active' : ''"
      @click="set(c)"
    >
      {{ CATEGORY_LABELS[c] || c }}
    </button>
  </div>
</template>
