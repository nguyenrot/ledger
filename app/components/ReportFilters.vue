<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'

const props = defineProps<{
  from: string
  to: string
  groupBy: 'day' | 'month'
}>()

const emit = defineEmits<{
  update: [value: { from: string; to: string; groupBy: 'day' | 'month' }]
}>()

const { todayIso, firstOfMonthIso } = useFormat()

const localFrom = ref(props.from)
const localTo = ref(props.to)
const localGroupBy = ref(props.groupBy)

watch(() => props.from, (v) => (localFrom.value = v))
watch(() => props.to, (v) => (localTo.value = v))
watch(() => props.groupBy, (v) => (localGroupBy.value = v))

function emitNow() {
  emit('update', { from: localFrom.value, to: localTo.value, groupBy: localGroupBy.value })
}

function preset(name: 'today' | 'week' | 'month' | 'year') {
  const now = new Date()
  let from: Date
  switch (name) {
    case 'today':
      from = new Date(now)
      break
    case 'week':
      from = new Date(now)
      from.setDate(from.getDate() - 6)
      break
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      from = new Date(now.getFullYear(), 0, 1)
      break
  }
  const y = from.getFullYear()
  const m = String(from.getMonth() + 1).padStart(2, '0')
  const d = String(from.getDate()).padStart(2, '0')
  localFrom.value = `${y}-${m}-${d}`
  localTo.value = todayIso()
  localGroupBy.value = name === 'year' ? 'month' : 'day'
  emitNow()
}
</script>

<template>
  <div class="card p-5 sm:p-6 space-y-4">
    <div class="flex items-center justify-between">
      <span class="label">Bộ lọc</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <label class="block">
        <span class="label block mb-1.5">Từ ngày</span>
        <input
          v-model="localFrom"
          type="date"
          class="input-field w-full px-3 py-2 rounded-lg text-sm"
          @change="emitNow"
        />
      </label>
      <label class="block">
        <span class="label block mb-1.5">Đến ngày</span>
        <input
          v-model="localTo"
          type="date"
          class="input-field w-full px-3 py-2 rounded-lg text-sm"
          @change="emitNow"
        />
      </label>
    </div>

    <div>
      <span class="label block mb-2">Gom theo</span>
      <div class="grid grid-cols-2 gap-2">
        <button
          class="py-2 rounded-md border font-mono uppercase tracking-wider text-xs transition-colors"
          :class="localGroupBy === 'day'
            ? 'border-[var(--color-cyan)] bg-[rgba(0,245,255,0.12)] text-[var(--color-cyan)]'
            : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-cyan)]/60'"
          @click="localGroupBy = 'day'; emitNow()"
        >
          Ngày
        </button>
        <button
          class="py-2 rounded-md border font-mono uppercase tracking-wider text-xs transition-colors"
          :class="localGroupBy === 'month'
            ? 'border-[var(--color-cyan)] bg-[rgba(0,245,255,0.12)] text-[var(--color-cyan)]'
            : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-cyan)]/60'"
          @click="localGroupBy = 'month'; emitNow()"
        >
          Tháng
        </button>
      </div>
    </div>

    <div>
      <span class="label block mb-2">Khoảng nhanh</span>
      <div class="flex flex-wrap gap-1.5">
        <button class="btn-ghost px-3 py-1.5 rounded-md text-xs" @click="preset('today')">Hôm nay</button>
        <button class="btn-ghost px-3 py-1.5 rounded-md text-xs" @click="preset('week')">7 ngày</button>
        <button class="btn-ghost px-3 py-1.5 rounded-md text-xs" @click="preset('month')">Tháng này</button>
        <button class="btn-ghost px-3 py-1.5 rounded-md text-xs" @click="preset('year')">Năm này</button>
      </div>
    </div>
  </div>
</template>
