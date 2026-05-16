<script setup lang="ts">
import { ApiError, useLedgerApi } from '~/composables/useLedgerApi'
import { useFormat } from '~/composables/useFormat'
import { useToast } from '~/composables/useToast'
import type { TodayResponse } from '~/composables/useLedgerApi'
import TransactionRow from '~/components/TransactionRow.vue'

const api = useLedgerApi()
const toast = useToast()
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
</script>

<template>
  <div class="max-w-screen-md mx-auto px-4 md:px-6 py-4 md:py-6">
    <!-- Totals card -->
    <section class="card p-4 mb-4">
      <div class="flex items-baseline justify-between mb-1">
        <span class="label">Hôm nay</span>
        <span class="label-dim">{{ data?.count ?? 0 }} giao dịch</span>
      </div>
      <div class="flex items-baseline gap-1 mb-2">
        <span
          class="text-3xl font-bold num"
          :class="(data?.net ?? 0) >= 0 ? 'income' : 'expense'"
        >
          {{ formatSignedVnd(data?.net ?? 0) }}
        </span>
      </div>
      <div class="flex gap-4 text-sm">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-income)]" />
          <span class="text-[var(--color-text-dim)]">Thu</span>
          <span class="num income font-medium">{{ formatVnd(data?.income ?? 0) }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-expense)]" />
          <span class="text-[var(--color-text-dim)]">Chi</span>
          <span class="num expense font-medium">{{ formatVnd(data?.expense ?? 0) }}</span>
        </div>
      </div>
    </section>

    <!-- Transaction list -->
    <section>
      <div class="flex items-center justify-between mb-2 px-1">
        <h2 class="text-sm font-semibold text-[var(--color-text-muted)]">Giao dịch</h2>
      </div>

      <div v-if="loading && !data" class="card p-6 text-center text-sm text-[var(--color-text-dim)]">
        Đang tải…
      </div>
      <div
        v-else-if="!data?.transactions.length"
        class="card p-8 text-center"
      >
        <div class="text-[var(--color-text-dim)] text-sm mb-1">Chưa ghi gì hôm nay</div>
        <div class="text-xs text-[var(--color-text-dim)]">Nhấn nút + để thêm giao dịch đầu tiên</div>
      </div>
      <div v-else class="card overflow-hidden">
        <TransactionRow
          v-for="row in data.transactions"
          :key="row.id"
          :row="row"
        />
      </div>
    </section>
  </div>
</template>
