<script setup lang="ts">
import { ApiError, useLedgerApi, type NewTransaction } from '~/composables/useLedgerApi'
import { useEntrySheet } from '~/composables/useEntrySheet'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useCategoryManager } from '~/composables/useCategoryManager'
import { useFormat } from '~/composables/useFormat'
import AmountKeypad from '~/components/AmountKeypad.vue'
import KindSwitch from '~/components/KindSwitch.vue'
import CategoryGrid from '~/components/CategoryGrid.vue'

const { state, close } = useEntrySheet()
const api = useLedgerApi()
const toast = useToast()
const confirm = useConfirm()
const categoryManager = useCategoryManager()
const { formatVnd, formatRelativeDate } = useFormat()

async function handleDelete() {
  if (state.value.mode !== 'edit' || !state.value.id) return
  const ok = await confirm.ask({
    title: 'Xoá giao dịch?',
    body: 'Hành động này không thể hoàn tác.',
    confirmText: 'Xoá',
    cancelText: 'Giữ lại',
    danger: true,
  })
  if (!ok) return
  try {
    await api.remove(state.value.id)
    toast.success('Đã xoá')
    window.dispatchEvent(new CustomEvent('ledger:transactions-changed'))
    close()
  } catch (e) {
    toast.error((e as Error).message || 'Không xoá được giao dịch.')
  }
}

const error = ref('')
const submitting = ref(false)
const showAdvanced = ref(false)

const amountValue = computed(() => {
  const n = Number(state.value.amount || '0')
  return Number.isFinite(n) ? n : 0
})
const amountDisplay = computed(() => (amountValue.value > 0 ? formatVnd(amountValue.value) : '0₫'))

const canSubmit = computed(() => amountValue.value > 0 && !submitting.value)

watch(
  () => state.value.open,
  (open) => {
    if (open) {
      error.value = ''
      showAdvanced.value = false
      if (import.meta.client) document.body.style.overflow = 'hidden'
    } else if (import.meta.client) {
      document.body.style.overflow = ''
    }
  },
)

function onKeyDown(e: KeyboardEvent) {
  if (!state.value.open) return
  if (e.key === 'Escape') close()
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (import.meta.client) document.body.style.overflow = ''
})

async function handleSubmit() {
  if (!canSubmit.value) return
  error.value = ''
  submitting.value = true
  try {
    const payload: NewTransaction = {
      kind: state.value.kind,
      amount: amountValue.value,
      category: state.value.category,
      note: state.value.note.trim() || undefined,
      occurred_on: state.value.occurredOn,
    }
    if (state.value.mode === 'edit' && state.value.id) {
      await api.update(state.value.id, payload)
      toast.success('Đã cập nhật')
    } else {
      await api.create(payload)
      toast.success(`Đã ghi ${state.value.kind === 'income' ? '+' : '−'}${formatVnd(amountValue.value)}`)
    }
    window.dispatchEvent(new CustomEvent('ledger:transactions-changed'))
    close()
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = e.message
    } else {
      error.value = (e as Error).message || 'Lỗi khi lưu giao dịch.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="state.open"
        class="sheet-backdrop"
        @click="close"
      />
    </Transition>
    <Transition name="sheet">
      <div
        v-if="state.open"
        class="sheet-mobile md:sheet-desktop"
        @click.stop
      >
        <div class="sheet-handle md:hidden" />

        <!-- Header — quieter, balanced -->
        <div class="flex items-center justify-between px-4 pt-3 pb-2 md:pt-5">
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
            aria-label="Đóng"
            @click="close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h2 class="text-sm font-semibold tracking-tight">
            {{ state.mode === 'edit' ? 'Sửa giao dịch' : 'Ghi giao dịch' }}
          </h2>
          <button
            v-if="state.mode === 'edit'"
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-2)] text-[var(--color-expense)] transition-colors"
            aria-label="Xoá giao dịch"
            @click="handleDelete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
          <div v-else class="w-8" />
        </div>

        <div class="flex-1 overflow-y-auto px-4 pb-3">
          <KindSwitch v-model="state.kind" class="mb-4" />

          <!-- Big amount display — display-num for premium mono kerning -->
          <div class="text-center py-5">
            <div
              class="display-num text-[42px] md:text-5xl leading-none tracking-[-0.04em]"
              :class="state.kind === 'income' ? 'income' : 'expense'"
            >
              {{ state.kind === 'income' ? '+' : '−' }}{{ amountDisplay }}
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="eyebrow">Phân loại</span>
            <button
              type="button"
              class="text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] inline-flex items-center gap-1 transition-colors"
              @click="categoryManager.show()"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Quản lý
            </button>
          </div>
          <CategoryGrid v-model="state.category" :kind="state.kind" class="mb-3" />

          <input
            v-model="state.note"
            type="text"
            maxlength="255"
            class="input mb-2"
            placeholder="Ghi chú (VD: Cơm tấm Sài Gòn)"
          />

          <button
            type="button"
            class="w-full flex items-center justify-between gap-2 py-2 mb-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            @click="showAdvanced = !showAdvanced"
          >
            <span class="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ showAdvanced ? 'Thu gọn' : `Ngày: ${formatRelativeDate(state.occurredOn)}` }}
            </span>
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              class="text-[var(--color-text-dim)] transition-transform"
              :class="showAdvanced ? 'rotate-180' : ''"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div v-if="showAdvanced" class="mb-2">
            <input
              v-model="state.occurredOn"
              type="date"
              class="input num"
            />
          </div>

          <AmountKeypad v-model="state.amount" />

          <p v-if="error" class="text-xs text-[var(--color-expense)] mt-3 text-center">{{ error }}</p>
        </div>

        <div
          class="px-4 pt-2 border-t border-[var(--color-border)]"
          style="padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);"
        >
          <button
            type="button"
            class="btn btn-primary w-full !py-3.5 text-base font-semibold"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <template v-if="!submitting">
              {{ state.mode === 'edit' ? 'Lưu thay đổi' : 'Ghi giao dịch' }}
            </template>
            <template v-else>
              <span class="inline-flex items-center gap-2">
                <span class="dot pulse-dot bg-[#04201f]" />
                Đang lưu…
              </span>
            </template>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
