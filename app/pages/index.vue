<script setup lang="ts">
import { ApiError, useLedgerApi } from '~/composables/useLedgerApi'
import { useFormat } from '~/composables/useFormat'
import { useToast } from '~/composables/useToast'
import { useEntrySheet } from '~/composables/useEntrySheet'
import type { TodayResponse } from '~/composables/useLedgerApi'
import TransactionRow from '~/components/TransactionRow.vue'

const api = useLedgerApi()
const toast = useToast()
const sheet = useEntrySheet()
const { formatVnd, formatSignedVnd } = useFormat()

const data = ref<TodayResponse | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    data.value = await api.listToday()
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) {
      toast.error((e as Error).message || 'Lỗi tải dữ liệu.')
    }
  } finally {
    loading.value = false
  }
}

function onChange() {
  load()
}

onMounted(() => {
  load()
  window.addEventListener('ledger:transactions-changed', onChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('ledger:transactions-changed', onChange)
})

// Human-friendly "Thứ Năm · 19 tháng 5" — long form on desktop for breathing room
const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
})

// Thu/Chi proportional split — used to render the horizontal balance bar
const split = computed(() => {
  const inc = data.value?.income ?? 0
  const exp = data.value?.expense ?? 0
  const sum = inc + exp
  if (sum === 0) return { inc: 0, exp: 0 }
  return { inc: (inc / sum) * 100, exp: (exp / sum) * 100 }
})

const net = computed(() => data.value?.net ?? 0)
const count = computed(() => data.value?.count ?? 0)
</script>

<template>
  <div class="max-w-screen-md mx-auto px-4 md:px-6 py-6 md:py-10">
    <!-- Hero — asymmetric left-aligned per DESIGN_VARIANCE 8. Banned: centered hero. -->
    <header class="mb-8 md:mb-10">
      <div class="flex items-baseline justify-between mb-1">
        <span class="eyebrow">Hôm nay</span>
        <span class="label-dim num">{{ count }} giao dịch</span>
      </div>
      <div class="text-sm text-[var(--color-text-muted)] capitalize mb-5">
        {{ todayLabel }}
      </div>

      <!-- Big net — display num with mono. Color shifts on sign. -->
      <div
        v-if="loading && !data"
        class="skeleton h-14 w-56 mb-5"
      />
      <div
        v-else
        class="display-num text-5xl md:text-6xl leading-none mb-5 tabular-nums"
        :class="net >= 0 ? 'income' : 'expense'"
      >
        {{ formatSignedVnd(net) }}
      </div>

      <!-- Split bar — shows Thu/Chi ratio at a glance. Single source of color cue. -->
      <div class="space-y-2.5">
        <div class="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <div
            v-if="split.inc > 0"
            class="h-full bg-[var(--color-income)] transition-all duration-500"
            :style="{ width: `${split.inc}%` }"
          />
          <div
            v-if="split.exp > 0"
            class="h-full bg-[var(--color-expense)] transition-all duration-500"
            :style="{ width: `${split.exp}%` }"
          />
        </div>
        <div class="flex items-center justify-between gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="dot bg-[var(--color-income)]" />
            <span class="text-[var(--color-text-muted)]">Thu</span>
            <span class="num income font-medium">{{ formatVnd(data?.income ?? 0) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="dot bg-[var(--color-expense)]" />
            <span class="text-[var(--color-text-muted)]">Chi</span>
            <span class="num expense font-medium">{{ formatVnd(data?.expense ?? 0) }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Transactions — divider list, no card frame. Anti-card-overuse per the skill. -->
    <section>
      <div class="flex items-center justify-between mb-3 px-0.5">
        <h2 class="eyebrow">Giao dịch</h2>
        <button
          v-if="(data?.transactions?.length ?? 0) > 0"
          class="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
          @click="sheet.openCreate()"
        >
          + Thêm
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading && !data" class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 py-3">
          <div class="skeleton w-2 h-10" />
          <div class="flex-1 space-y-1.5">
            <div class="skeleton h-3.5 w-2/5" />
            <div class="skeleton h-2.5 w-1/4" />
          </div>
          <div class="skeleton h-4 w-20" />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!data?.transactions.length"
        class="py-14 text-center"
      >
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-dim)]">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div class="text-sm text-[var(--color-text-muted)] mb-1">Chưa ghi gì hôm nay</div>
        <div class="text-xs text-[var(--color-text-dim)]">Nhấn nút + để thêm giao dịch đầu tiên</div>
      </div>

      <!-- List — dividers, no surrounding card -->
      <div v-else class="divide-y divide-[var(--color-border)]">
        <TransactionRow
          v-for="(row, i) in data.transactions"
          :key="row.id"
          :row="row"
          :index="i"
        />
      </div>
    </section>
  </div>
</template>
