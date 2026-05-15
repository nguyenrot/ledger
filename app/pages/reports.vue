<script setup lang="ts">
import { ApiError, useLedgerApi } from '~/composables/useLedgerApi'
import { useFormat } from '~/composables/useFormat'
import type { Summary, Transaction } from '~/composables/useLedgerApi'

const api = useLedgerApi()
const { firstOfMonthIso, todayIso, formatDate } = useFormat()

const from = ref(firstOfMonthIso())
const to = ref(todayIso())
const groupBy = ref<'day' | 'month'>('day')

const summary = ref<Summary | null>(null)
const transactions = ref<Transaction[]>([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [s, list] = await Promise.all([
      api.summary({ from: from.value, to: to.value, group_by: groupBy.value }),
      api.list({ from: from.value, to: to.value }),
    ])
    summary.value = s
    transactions.value = list
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) {
      error.value = (e as Error).message || 'Lỗi tải báo cáo.'
    }
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await api.remove(id)
    await load()
  } catch (e) {
    error.value = (e as Error).message || 'Không xoá được.'
  }
}

function handleFilterUpdate(v: { from: string; to: string; groupBy: 'day' | 'month' }) {
  from.value = v.from
  to.value = v.to
  groupBy.value = v.groupBy
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <TopBar />
    <main class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div class="mb-6">
        <div class="label mb-1">Phân tích</div>
        <h1 class="text-2xl sm:text-3xl font-display tracking-wider">Báo cáo</h1>
        <p v-if="summary" class="text-sm text-[var(--color-fg-muted)] mt-1 font-mono">
          {{ formatDate(summary.from) }} → {{ formatDate(summary.to) }}
        </p>
      </div>

      <p v-if="error" class="mb-4 text-xs text-[var(--color-rose)] font-mono">{{ error }}</p>

      <div class="grid lg:grid-cols-[280px_1fr] gap-5">
        <aside class="space-y-4">
          <ReportFilters
            :from="from"
            :to="to"
            :group-by="groupBy"
            @update="handleFilterUpdate"
          />
          <TotalsCard
            v-if="summary"
            label="Tổng kết khoảng"
            :income="summary.totals.income"
            :expense="summary.totals.expense"
            :net="summary.totals.net"
            :count="summary.totals.count"
          />
        </aside>

        <div class="space-y-5 min-w-0">
          <div v-if="loading && !summary" class="card p-6 text-sm text-[var(--color-fg-dim)]">Đang tính toán…</div>

          <template v-if="summary">
            <ReportChart :buckets="summary.buckets" :group-by="summary.group_by" />

            <div class="grid sm:grid-cols-2 gap-5">
              <ReportCategoryBreakdown
                kind="expense"
                title="Chi theo phân loại"
                :rows="summary.by_category.expense"
              />
              <ReportCategoryBreakdown
                kind="income"
                title="Thu theo phân loại"
                :rows="summary.by_category.income"
              />
            </div>

            <div>
              <h2 class="label mb-2 px-1">Giao dịch trong khoảng · {{ transactions.length }}</h2>
              <TransactionList
                :rows="transactions"
                :show-date="true"
                empty-hint="Không có giao dịch nào trong khoảng đã chọn."
                @delete="handleDelete"
              />
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>
