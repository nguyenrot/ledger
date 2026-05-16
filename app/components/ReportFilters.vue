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

const presets: { id: string; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: '7 ngày' },
  { id: 'month', label: 'Tháng này' },
  { id: 'last-month', label: 'Tháng trước' },
  { id: 'year', label: 'Năm này' },
]

function preset(id: string) {
  const now = new Date()
  let from: Date
  let to: Date = now
  switch (id) {
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
    case 'last-month':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      to = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'year':
      from = new Date(now.getFullYear(), 0, 1)
      break
    default:
      from = now
  }
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  localFrom.value = fmt(from)
  localTo.value = fmt(to)
  localGroupBy.value = id === 'year' || id === 'last-month' ? 'month' : 'day'
  emitNow()
}
</script>

<template>
  <div class="card p-3 md:p-4 space-y-3">
    <!-- Date row -->
    <div class="flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-2 text-sm flex-1 min-w-[140px]">
        <span class="label-dim shrink-0">Từ</span>
        <input
          v-model="localFrom"
          type="date"
          class="input !py-1.5 text-sm"
          @change="emitNow"
        />
      </label>
      <label class="flex items-center gap-2 text-sm flex-1 min-w-[140px]">
        <span class="label-dim shrink-0">Đến</span>
        <input
          v-model="localTo"
          type="date"
          class="input !py-1.5 text-sm"
          @change="emitNow"
        />
      </label>
      <div class="flex bg-[var(--color-surface-2)] p-0.5 rounded-md">
        <button
          class="px-3 py-1.5 text-xs font-medium rounded transition-colors"
          :class="localGroupBy === 'day' ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'"
          @click="localGroupBy = 'day'; emitNow()"
        >Ngày</button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded transition-colors"
          :class="localGroupBy === 'month' ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'"
          @click="localGroupBy = 'month'; emitNow()"
        >Tháng</button>
      </div>
    </div>

    <!-- Preset row -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="p in presets"
        :key="p.id"
        class="chip text-xs !py-1 !px-2.5"
        @click="preset(p.id)"
      >
        {{ p.label }}
      </button>
    </div>
  </div>
</template>
