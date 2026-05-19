<script setup lang="ts">
import {
  CATEGORY_COLOR_SWATCHES,
  useCategories,
} from '~/composables/useCategories'
import { useCategoryManager } from '~/composables/useCategoryManager'
import { useLedgerApi, type LedgerCategory, type LedgerKind } from '~/composables/useLedgerApi'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'

const { open, close } = useCategoryManager()
const cats = useCategories()
const api = useLedgerApi()
const toast = useToast()
const confirm = useConfirm()

const activeKind = ref<LedgerKind>('expense')
const editingId = ref<string | null>(null)
const draftName = ref('')
const draftColor = ref(CATEGORY_COLOR_SWATCHES[0]!)
const busy = ref(false)

watch(open, async (isOpen) => {
  if (isOpen) {
    if (import.meta.client) document.body.style.overflow = 'hidden'
    await cats.ensureLoaded()
  } else if (import.meta.client) {
    document.body.style.overflow = ''
    editingId.value = null
    draftName.value = ''
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

const currentList = computed(() => cats.byKind(activeKind.value))

function startCreate() {
  editingId.value = ''
  draftName.value = ''
  draftColor.value = CATEGORY_COLOR_SWATCHES[Math.floor(Math.random() * CATEGORY_COLOR_SWATCHES.length)]!
}

function startEdit(c: LedgerCategory) {
  editingId.value = c.id
  draftName.value = c.name
  draftColor.value = c.color
}

function cancelEdit() {
  editingId.value = null
  draftName.value = ''
}

async function saveDraft() {
  const name = draftName.value.trim()
  if (!name) {
    toast.error('Tên không được để trống.')
    return
  }
  busy.value = true
  try {
    if (editingId.value === '') {
      await api.createCategory({ kind: activeKind.value, name, color: draftColor.value })
      toast.success('Đã thêm danh mục')
    } else if (editingId.value) {
      await api.updateCategory(editingId.value, { name, color: draftColor.value })
      toast.success('Đã cập nhật')
    }
    await cats.refresh()
    editingId.value = null
    draftName.value = ''
  } catch (e) {
    toast.error((e as Error).message || 'Không lưu được danh mục.')
  } finally {
    busy.value = false
  }
}

async function deleteCategory(c: LedgerCategory) {
  const ok = await confirm.ask({
    title: `Xoá "${c.name}"?`,
    body: 'Giao dịch cũ đã ghi với danh mục này vẫn được giữ lại. Anh có thể tạo lại sau nếu cần.',
    confirmText: 'Xoá',
    cancelText: 'Giữ lại',
    danger: true,
  })
  if (!ok) return
  try {
    await api.deleteCategory(c.id)
    toast.success('Đã xoá')
    await cats.refresh()
  } catch (e) {
    toast.error((e as Error).message || 'Không xoá được danh mục.')
  }
}

async function move(c: LedgerCategory, dir: -1 | 1) {
  const list = [...currentList.value]
  const idx = list.findIndex((x) => x.id === c.id)
  if (idx < 0) return
  const targetIdx = idx + dir
  if (targetIdx < 0 || targetIdx >= list.length) return
  ;[list[idx], list[targetIdx]] = [list[targetIdx]!, list[idx]!]
  try {
    await api.reorderCategories(activeKind.value, list.map((x) => x.id))
    await cats.refresh()
  } catch (e) {
    toast.error((e as Error).message || 'Không di chuyển được.')
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    if (editingId.value !== null) cancelEdit()
    else close()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="sheet-backdrop" @click="close" />
    </Transition>
    <Transition name="sheet">
      <div v-if="open" class="sheet-mobile md:sheet-desktop" @click.stop>
        <div class="sheet-handle md:hidden" />

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
          <h2 class="text-sm font-semibold tracking-tight">Quản lý danh mục</h2>
          <div class="w-8" />
        </div>

        <!-- Kind switch — same sliding style as the entry sheet -->
        <div class="px-4">
          <div class="relative grid grid-cols-2 bg-[var(--color-surface-2)] p-1 rounded-xl border border-[var(--color-border)]">
            <div
              class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out"
              :class="activeKind === 'expense' ? 'bg-[var(--color-expense)] left-1' : 'bg-[var(--color-income)] left-1 translate-x-[calc(100%+4px)]'"
              aria-hidden="true"
            />
            <button
              type="button"
              class="relative z-10 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="activeKind === 'expense' ? 'text-[#2a0808]' : 'text-[var(--color-text-muted)]'"
              @click="activeKind = 'expense'; editingId = null"
            >Chi</button>
            <button
              type="button"
              class="relative z-10 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="activeKind === 'income' ? 'text-[#04201f]' : 'text-[var(--color-text-muted)]'"
              @click="activeKind = 'income'; editingId = null"
            >Thu</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          <div v-if="cats.loading.value && currentList.length === 0" class="py-6 text-center text-sm text-[var(--color-text-dim)]">
            Đang tải…
          </div>

          <template v-for="(c, idx) in currentList" :key="c.id">
            <div v-if="editingId === c.id" class="surface-2 p-3 border border-[var(--color-accent)] space-y-3 rounded-xl">
              <input
                v-model="draftName"
                type="text"
                maxlength="40"
                class="input"
                placeholder="Tên danh mục"
                @keyup.enter="saveDraft"
              />
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="sw in CATEGORY_COLOR_SWATCHES"
                  :key="sw"
                  type="button"
                  class="w-7 h-7 rounded-full border-2 transition-transform"
                  :class="draftColor === sw ? 'scale-110 border-[var(--color-text)]' : 'border-transparent'"
                  :style="{ background: sw }"
                  :aria-label="`Màu ${sw}`"
                  @click="draftColor = sw"
                />
              </div>
              <div class="flex gap-2 justify-end">
                <button class="btn btn-ghost !py-1.5 !px-3 text-sm" @click="cancelEdit">Hủy</button>
                <button class="btn btn-primary !py-1.5 !px-3 text-sm" :disabled="busy" @click="saveDraft">
                  {{ busy ? 'Đang lưu…' : 'Lưu' }}
                </button>
              </div>
            </div>

            <div v-else class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors group">
              <span class="dot shrink-0" :style="{ background: c.color }" />
              <span class="flex-1 text-sm truncate">{{ c.name }}</span>

              <div class="flex items-center text-[var(--color-text-dim)]">
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-3)] disabled:opacity-30 transition-colors"
                  :disabled="idx === 0"
                  aria-label="Lên"
                  @click="move(c, -1)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-3)] disabled:opacity-30 transition-colors"
                  :disabled="idx === currentList.length - 1"
                  aria-label="Xuống"
                  @click="move(c, 1)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Sửa"
                  @click="startEdit(c)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-3)] hover:text-[var(--color-expense)] transition-colors"
                  aria-label="Xoá"
                  @click="deleteCategory(c)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <div v-if="editingId === ''" class="surface-2 p-3 border border-[var(--color-accent)] space-y-3 rounded-xl">
            <input
              v-model="draftName"
              type="text"
              maxlength="40"
              class="input"
              :placeholder="`Tên ${activeKind === 'income' ? 'khoản thu' : 'khoản chi'} mới`"
              @keyup.enter="saveDraft"
            />
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="sw in CATEGORY_COLOR_SWATCHES"
                :key="sw"
                type="button"
                class="w-7 h-7 rounded-full border-2 transition-transform"
                :class="draftColor === sw ? 'scale-110 border-[var(--color-text)]' : 'border-transparent'"
                :style="{ background: sw }"
                :aria-label="`Màu ${sw}`"
                @click="draftColor = sw"
              />
            </div>
            <div class="flex gap-2 justify-end">
              <button class="btn btn-ghost !py-1.5 !px-3 text-sm" @click="cancelEdit">Hủy</button>
              <button class="btn btn-primary !py-1.5 !px-3 text-sm" :disabled="busy" @click="saveDraft">
                {{ busy ? 'Đang lưu…' : 'Thêm' }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="editingId === null"
          class="px-4 pt-2 border-t border-[var(--color-border)]"
          style="padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);"
        >
          <button class="btn btn-primary w-full !py-3 text-base font-semibold" @click="startCreate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm danh mục
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
