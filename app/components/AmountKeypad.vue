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
  next = next.replace(/^0+(\d)/, '$1')
  if (next.length > max.value) return
  emit('update:modelValue', next)
}

function backspace() {
  emit('update:modelValue', props.modelValue.slice(0, -1))
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <button
      v-for="n in ['1','2','3','4','5','6','7','8','9']"
      :key="n"
      type="button"
      class="h-14 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]
             hover:bg-[var(--color-surface-3)] active:bg-[var(--color-border-strong)]
             active:scale-[0.97] text-xl font-medium text-[var(--color-text)] num
             transition-all duration-100 select-none"
      :aria-label="`Số ${n}`"
      @click="press(n)"
    >
      {{ n }}
    </button>

    <button
      type="button"
      class="h-14 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]
             hover:bg-[var(--color-surface-3)] active:bg-[var(--color-border-strong)]
             active:scale-[0.97] text-base font-medium text-[var(--color-text-muted)] num
             transition-all duration-100 select-none"
      aria-label="Ba số không"
      @click="press('000')"
    >
      000
    </button>

    <button
      type="button"
      class="h-14 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]
             hover:bg-[var(--color-surface-3)] active:bg-[var(--color-border-strong)]
             active:scale-[0.97] text-xl font-medium text-[var(--color-text)] num
             transition-all duration-100 select-none"
      aria-label="Số 0"
      @click="press('0')"
    >
      0
    </button>

    <button
      type="button"
      class="h-14 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]
             hover:bg-[var(--color-surface-3)] active:bg-[var(--color-border-strong)]
             active:scale-[0.97] flex items-center justify-center text-[var(--color-text-muted)]
             transition-all duration-100 select-none"
      aria-label="Xoá"
      @click="backspace"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
        <line x1="18" y1="9" x2="12" y2="15" />
        <line x1="12" y1="9" x2="18" y2="15" />
      </svg>
    </button>
  </div>
</template>
