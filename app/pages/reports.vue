<script setup lang="ts">
import { ApiError, useLedgerApi } from '~/composables/useLedgerApi'
import { useFormat } from '~/composables/useFormat'
import { useToast } from '~/composables/useToast'
import type { Summary, Transaction } from '~/composables/useLedgerApi'
import TransactionRow from '~/components/TransactionRow.vue'
import ReportFilters from '~/components/ReportFilters.vue'
import ReportChart from '~/components/ReportChart.vue'
import ReportCategoryBreakdown from '~/components/ReportCategoryBreakdown.vue'

const api = useLedgerApi()
const toast = useToast()
const { firstOfMonthIso, todayIso, formatVnd, formatSignedVnd, formatDate } = useFormat()

const from = ref(firstOfMonthIso())
const to = ref(todayIso())
const groupBy = ref<'day' | 'month'>('day')

const summary = ref<Summary | null>(null)
const transactions = ref<Transaction[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const [s, list] = await Promise.all([
      api.summary({ from: from.value, to: to.value, group_by: groupBy.value }),
      api.list({ from: from.value, to: to.value }),
    ])
    summary.value = s
    transactions.value = list
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) {
      toast.error((e as Error).message || 'Lỗi tải báo cáo.')
    }
  } finally {
    loading.value = false
  }
}

function onChange() {
  load()
}

function handleFilterUpdate(v: { from: string; to: string; groupBy: 'day' | 'month' }) {
  from.value = v.from
  to.value = v.to
  groupBy.value = v.groupBy
  load()
}

onMounted(() => {
  load()
  window.addEventListener('ledger:transactions-changed', onChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('ledger:transactions-changed', onChange)
})

const hasIncomeBreakdown = computed(() => (summary.value?.by_category.income.length ?? 0) > 0)
const hasExpenseBreakdown = computed(() => (summary.value?.by_category.expense.length ?? 0) > 0)

// Split bar for income vs expense
const split = computed(() => {
  const inc = summary.value?.totals.income ?? 0
  const exp = summary.value?.totals.expense ?? 0
  const sum = inc + exp
  if (sum === 0) return { inc: 0, exp: 0 }
  return { inc: (inc / sum) * 100, exp: (exp / sum) * 100 }
})
</script>

<template>
  <div class="max-w-screen-md mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10">
    <!-- Hero — eyebrow + date range + big net + split bar -->
    <header v-if="summary">
      <div class="flex items-baseline justify-between mb-1">
        <span class="eyebrow">Báo cáo</span>
        <span class="label-dim num">{{ summary.totals.count }} giao dịch</span>
      </div>
      <div class="text-sm text-[var(--color-text-muted)] num mb-5">
        {{ formatDate(summary.from) }} → {{ formatDate(summary.to) }}
      </div>

      <div
        class="display-num text-5xl md:text-6xl leading-none mb-5 tabular-nums"
        :class="summary.totals.net >= 0 ? 'income' : 'expense'"
      >
        {{ formatSignedVnd(summary.totals.net) }}
      </div>

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
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="dot bg-[var(--color-income)]" />
            <span class="text-[var(--color-text-muted)]">Thu</span>
            <span class="num income font-medium">{{ formatVnd(summary.totals.income) }}</span>
          </div>
          <div class="flex items-center gap-2 justify-end">
            <span class="dot bg-[var(--color-expense)]" />
            <span class="text-[var(--color-text-muted)]">Chi</span>
            <span class="num expense font-medium">{{ formatVnd(summary.totals.expense) }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Filters — quiet, no card -->
    <ReportFilters
      :from="from"
      :to="to"
      :group-by="groupBy"
      @update="handleFilterUpdate"
    />

    <div v-if="loading && !summary" class="py-10 text-center text-sm text-[var(--color-text-dim)]">
      Đang tính toán…
    </div>

    <template v-if="summary">
      <ReportChart :buckets="summary.buckets" :group-by="summary.group_by" />

      <ReportCategoryBreakdown
        v-if="hasExpenseBreakdown"
        kind="expense"
        title="Chi theo phân loại"
        :rows="summary.by_category.expense"
      />
      <ReportCategoryBreakdown
        v-if="hasIncomeBreakdown"
        kind="income"
        title="Thu theo phân loại"
        :rows="summary.by_category.income"
      />

      <section>
        <div class="flex items-center justify-between mb-3 px-0.5">
          <h3 class="eyebrow">Giao dịch</h3>
          <span class="label-dim num">{{ transactions.length }}</span>
        </div>
        <div v-if="transactions.length === 0" class="py-10 text-center text-sm text-[var(--color-text-dim)]">
          Không có giao dịch nào trong khoảng đã chọn.
        </div>
        <div v-else class="divide-y divide-[var(--color-border)]">
          <TransactionRow
            v-for="(row, i) in transactions"
            :key="row.id"
            :row="row"
            :index="i"
            :show-date="true"
          />
        </div>
      </section>
    </template>
  </div>
</template>
