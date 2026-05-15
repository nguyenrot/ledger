<script setup lang="ts">
import { CATEGORY_LABELS, useFormat } from '~/composables/useFormat'
import type { LedgerKind, NewTransaction } from '~/composables/useLedgerApi'

const emit = defineEmits<{
  submit: [payload: NewTransaction]
}>()

const props = defineProps<{
  loading?: boolean
  defaultDate?: string
}>()

const { todayIso } = useFormat()

const kind = ref<LedgerKind>('expense')
const amountInput = ref('')
const category = ref<string>('food')
const note = ref('')
const occurredOn = ref<string>(props.defaultDate || todayIso())
const showAdvanced = ref(false)
const localError = ref('')

const incomeCats = ['salary', 'bonus', 'other']
const expenseCats = ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'other']

const availableCats = computed(() => (kind.value === 'income' ? incomeCats : expenseCats))

watch(kind, (k) => {
  if (!availableCats.value.includes(category.value)) {
    category.value = k === 'income' ? 'salary' : 'food'
  }
})

const parsedAmount = computed(() => {
  // Accept user-friendly input: "50000", "50.000", "50 000".
  const digits = amountInput.value.replace(/[\.,\s]/g, '')
  if (!digits) return 0
  const n = Number(digits)
  return Number.isFinite(n) ? n : 0
})

const formattedPreview = computed(() => {
  if (!parsedAmount.value) return ''
  return new Intl.NumberFormat('vi-VN').format(parsedAmount.value) + '₫'
})

async function handleSubmit() {
  localError.value = ''
  if (parsedAmount.value <= 0) {
    localError.value = 'Số tiền phải > 0.'
    return
  }
  emit('submit', {
    kind: kind.value,
    amount: parsedAmount.value,
    category: category.value,
    note: note.value.trim() || undefined,
    occurred_on: occurredOn.value,
  })
  amountInput.value = ''
  note.value = ''
}
</script>

<template>
  <form class="card card-glow p-5 sm:p-6 space-y-4" @submit.prevent="handleSubmit">
    <div class="flex items-center justify-between">
      <span class="label">Ghi giao dịch</span>
      <button
        type="button"
        class="label hover:text-[var(--color-cyan)] transition-colors"
        @click="showAdvanced = !showAdvanced"
      >
        {{ showAdvanced ? '− Gọn' : '+ Tùy chọn' }}
      </button>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        class="py-2.5 rounded-lg border font-display tracking-wider uppercase text-xs transition-all"
        :class="kind === 'expense'
          ? 'border-[var(--color-rose)] bg-[rgba(255,79,107,0.12)] text-[var(--color-rose)]'
          : 'border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-rose)]/60 hover:text-[var(--color-rose)]/80'"
        @click="kind = 'expense'"
      >
        − Chi
      </button>
      <button
        type="button"
        class="py-2.5 rounded-lg border font-display tracking-wider uppercase text-xs transition-all"
        :class="kind === 'income'
          ? 'border-[var(--color-emerald)] bg-[rgba(0,255,136,0.12)] text-[var(--color-emerald)]'
          : 'border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-emerald)]/60 hover:text-[var(--color-emerald)]/80'"
        @click="kind = 'income'"
      >
        + Thu
      </button>
    </div>

    <div>
      <span class="label block mb-2">Số tiền · VND</span>
      <div class="relative">
        <input
          v-model="amountInput"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          class="input-field w-full px-4 py-3 rounded-lg text-xl font-display tracking-wider"
          placeholder="50000"
        />
        <span v-if="formattedPreview" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--color-fg-dim)]">
          = {{ formattedPreview }}
        </span>
      </div>
    </div>

    <div>
      <span class="label block mb-2">Phân loại</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="c in availableCats"
          :key="c"
          type="button"
          class="px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-colors"
          :class="category === c
            ? 'border-[var(--color-cyan)] bg-[rgba(0,245,255,0.12)] text-[var(--color-cyan)]'
            : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-cyan)]/60'"
          @click="category = c"
        >
          {{ CATEGORY_LABELS[c] || c }}
        </button>
      </div>
    </div>

    <div>
      <span class="label block mb-2">Ghi chú (tuỳ chọn)</span>
      <input
        v-model="note"
        type="text"
        maxlength="255"
        class="input-field w-full px-4 py-2.5 rounded-lg text-sm"
        placeholder="VD: Cơm tấm Sài Gòn"
      />
    </div>

    <div v-if="showAdvanced">
      <span class="label block mb-2">Ngày giao dịch</span>
      <input
        v-model="occurredOn"
        type="date"
        class="input-field px-4 py-2.5 rounded-lg text-sm w-full sm:w-auto"
      />
    </div>

    <p v-if="localError" class="text-xs text-[var(--color-rose)] font-mono">{{ localError }}</p>

    <button
      type="submit"
      class="btn-primary w-full py-3 rounded-lg font-display"
      :disabled="loading || parsedAmount <= 0"
    >
      {{ loading ? 'Đang lưu…' : '⊕ Ghi' }}
    </button>
  </form>
</template>
