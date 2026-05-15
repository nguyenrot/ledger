<script setup lang="ts">
import { ApiError, useLedgerApi } from '~/composables/useLedgerApi'
import { useFormat } from '~/composables/useFormat'
import type { NewTransaction, TodayResponse } from '~/composables/useLedgerApi'

const api = useLedgerApi()
const { formatRelativeDate, todayIso } = useFormat()

const data = ref<TodayResponse | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await api.listToday()
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 401)) {
      error.value = (e as Error).message || 'Lỗi tải dữ liệu.'
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit(payload: NewTransaction) {
  submitting.value = true
  error.value = ''
  try {
    await api.create(payload)
    await load()
  } catch (e) {
    error.value = (e as Error).message || 'Không lưu được giao dịch.'
  } finally {
    submitting.value = false
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

onMounted(load)
</script>

<template>
  <div>
    <TopBar />
    <main class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div class="mb-6">
        <div class="label mb-1">{{ formatRelativeDate(todayIso()) }}</div>
        <h1 class="text-2xl sm:text-3xl font-display tracking-wider">
          Ghi sổ thu chi
        </h1>
      </div>

      <p v-if="error" class="mb-4 text-xs text-[var(--color-rose)] font-mono">{{ error }}</p>

      <div class="grid lg:grid-cols-[1fr_360px] gap-5">
        <div class="space-y-5 order-2 lg:order-1">
          <div v-if="loading && !data" class="card p-6 text-sm text-[var(--color-fg-dim)]">Đang tải…</div>
          <div v-else>
            <h2 class="label mb-2 px-1">Giao dịch hôm nay</h2>
            <TransactionList
              :rows="data?.transactions || []"
              empty-hint="Chưa ghi gì hôm nay. Bắt đầu bằng form bên phải →"
              @delete="handleDelete"
            />
          </div>
        </div>

        <div class="space-y-4 order-1 lg:order-2">
          <TotalsCard
            v-if="data"
            label="Hôm nay"
            :income="data.income"
            :expense="data.expense"
            :net="data.net"
            :count="data.count"
          />
          <TransactionForm :loading="submitting" @submit="handleSubmit" />
        </div>
      </div>
    </main>
  </div>
</template>
