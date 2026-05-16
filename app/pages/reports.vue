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
</script>

<template>
  <div class="max-w-screen-md mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
    <!-- Filters -->
    <ReportFilters
      :from="from"
      :to="to"
      :group-by="groupBy"
      @update="handleFilterUpdate"
    />

    <!-- Totals -->
    <section v-if="summary" class="card p-4">
      <div class="text-xs label-dim mb-1">
        {{ formatDate(summary.from) }} → {{ formatDate(summary.to) }} · {{ summary.totals.count }} giao dịch
      </div>
      <div
        class="text-3xl font-bold num mb-2"
        :class="summary.totals.net >= 0 ? 'income' : 'expense'"
      >
        {{ formatSignedVnd(summary.totals.net) }}
      </div>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="flex flex-col">
          <span class="label-dim">Thu</span>
          <span class="num income font-semibold">{{ formatVnd(summary.totals.income) }}</span>
        </div>
        <div class="flex flex-col">
          <span class="label-dim">Chi</span>
          <span class="num expense font-semibold">{{ formatVnd(summary.totals.expense) }}</span>
        </div>
      </div>
    </section>

    <div v-if="loading && !summary" class="card p-6 text-center text-sm text-[var(--color-text-dim)]">
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
        <h3 class="text-sm font-semibold text-[var(--color-text-muted)] mb-2 px-1">
          Giao dịch · {{ transactions.length }}
        </h3>
        <div v-if="transactions.length === 0" class="card p-6 text-center text-sm text-[var(--color-text-dim)]">
          Không có giao dịch nào trong khoảng đã chọn.
        </div>
        <div v-else class="card overflow-hidden">
          <TransactionRow
            v-for="row in transactions"
            :key="row.id"
            :row="row"
            :show-date="true"
          />
        </div>
      </section>
    </template>
  </div>
</template>
