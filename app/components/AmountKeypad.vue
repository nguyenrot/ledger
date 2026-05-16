<script setup lang="ts">
/**
 * Calculator-style numpad. Accumulates digits as a string in v-model so the
 * caller can re-render the formatted preview. Max 13 digits == 9,999,999,999,999
 * which comfortably exceeds the backend's 10^12 cap.
 */
const props = defineProps<{
  modelValue: string
  max?: number
}>()
const emit = defineEmits<{
  'update:modelValue': [v: string]
}>()

const max = computed(() => props.max ?? 13)

function press(c: string) {
  let next = props.modelValue
  if (c === '000') {
    if (next === '') return
    next = next + '000'
  } else {
    if (next === '0') next = c
    else next = next + c
  }
  // Drop leading zeros.
  next = next.replace(/^0+(\d)/, '$1')
  if (next.length > max.value) return
  emit('update:modelValue', next)
}

function backspace() {
  emit('update:modelValue', props.modelValue.slice(0, -1))
}

const keys: { label: string; press: () => void; aria: string }[] = [
  { label: '1', press: () => press('1'), aria: 'one' },
  { label: '2', press: () => press('2'), aria: 'two' },
  { label: '3', press: () => press('3'), aria: 'three' },
  { label: '4', press: () => press('4'), aria: 'four' },
  { label: '5', press: () => press('5'), aria: 'five' },
  { label: '6', press: () => press('6'), aria: 'six' },
  { label: '7', press: () => press('7'), aria: 'seven' },
  { label: '8', press: () => press('8'), aria: 'eight' },
  { label: '9', press: () => press('9'), aria: 'nine' },
  { label: '000', press: () => press('000'), aria: 'thousand' },
  { label: '0', press: () => press('0'), aria: 'zero' },
  { label: '⌫', press: backspace, aria: 'backspace' },
]
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <button
      v-for="k in keys"
      :key="k.label"
      type="button"
      class="h-14 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] active:bg-[var(--color-border-strong)] text-lg font-medium text-[var(--color-text)] transition-colors select-none"
      :class="{ 'text-base text-[var(--color-text-muted)]': k.label === '000' || k.label === '⌫' }"
      :aria-label="k.aria"
      @click="k.press()"
    >
      {{ k.label }}
    </button>
  </div>
</template>
