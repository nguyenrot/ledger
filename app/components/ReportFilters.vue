<script setup lang="ts">
import { vnDateIso } from '~/composables/useFormat'

const props = defineProps<{
  from: string
  to: string
  groupBy: 'day' | 'month'
}>()
const emit = defineEmits<{
  update: [value: { from: string; to: string; groupBy: 'day' | 'month' }]
}>()

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

const activePreset = ref<string | null>(null)

function preset(id: string) {
  // Anchor every preset on "today" in Asia/Ho_Chi_Minh (the backend's tz),
  // then do calendar math in UTC so day/month overflow normalizes correctly.
  const [y, m, d] = vnDateIso().split('-').map(Number) as [number, number, number]
  const utc = (yy: number, mm: number, dd: number) => new Date(Date.UTC(yy, mm, dd))
  const fmt = (dt: Date) => dt.toISOString().slice(0, 10)
  const today = utc(y, m - 1, d)
  let from: Date
  let to: Date = today
  switch (id) {
    case 'today':
      from = today
      break
    case 'week':
      from = utc(y, m - 1, d - 6)
      break
    case 'month':
      from = utc(y, m - 1, 1)
      break
    case 'last-month':
      from = utc(y, m - 2, 1)
      to = utc(y, m - 1, 0)
      break
    case 'year':
      from = utc(y, 0, 1)
      break
    default:
      from = today
  }
  localFrom.value = fmt(from)
  localTo.value = fmt(to)
  localGroupBy.value = id === 'year' || id === 'last-month' ? 'month' : 'day'
  activePreset.value = id
  emitNow()
}

// Any manual date change drops the preset highlight
function manualChange() {
  activePreset.value = null
  emitNow()
}
</script>

<template>
  <div class="space-y-3">
    <!-- Date row + Day/Month toggle -->
    <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch gap-2">
      <label class="flex items-center gap-2 text-sm sm:flex-1 sm:min-w-[150px]">
        <span class="label-dim shrink-0 w-7 text-right">Từ</span>
        <input
          v-model="localFrom"
          type="date"
          class="input num !py-2 text-sm flex-1 min-w-0"
          @change="manualChange"
        />
      </label>
      <label class="flex items-center gap-2 text-sm sm:flex-1 sm:min-w-[150px]">
        <span class="label-dim shrink-0 w-7 text-right">Đến</span>
        <input
          v-model="localTo"
          type="date"
          class="input num !py-2 text-sm flex-1 min-w-0"
          @change="manualChange"
        />
      </label>
      <div class="flex bg-[var(--color-surface-2)] p-0.5 rounded-lg border border-[var(--color-border)] self-stretch sm:self-auto">
        <button
          class="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors"
          :class="localGroupBy === 'day'
            ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'"
          @click="localGroupBy = 'day'; emitNow()"
        >Ngày</button>
        <button
          class="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors"
          :class="localGroupBy === 'month'
            ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'"
          @click="localGroupBy = 'month'; emitNow()"
        >Tháng</button>
      </div>
    </div>

    <!-- Preset row -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="p in presets"
        :key="p.id"
        class="chip text-xs !py-1.5 !px-3"
        :class="activePreset === p.id ? 'chip-active' : ''"
        @click="preset(p.id)"
      >
        {{ p.label }}
      </button>
    </div>
  </div>
</template>
