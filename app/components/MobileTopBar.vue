<script setup lang="ts">
import { useToken } from '~/composables/useToken'
import { useCategoryManager } from '~/composables/useCategoryManager'
import { useConfirm } from '~/composables/useConfirm'

const { token, clearToken } = useToken()
const categoryManager = useCategoryManager()
const confirm = useConfirm()

const menuOpen = ref(false)
const tokenVisible = ref(false)

function close() {
  menuOpen.value = false
  tokenVisible.value = false
}

function openCategoryManager() {
  close()
  categoryManager.show()
}

async function copyToken() {
  if (!token.value) return
  try {
    await navigator.clipboard.writeText(token.value)
  } catch {
    // Older iOS Safari: just ignore — user can long-press the code to copy.
  }
}

async function handleSignOut() {
  close()
  const ok = await confirm.ask({
    title: 'Đăng xuất?',
    body: 'Token sẽ bị xoá khỏi trình duyệt này. Anh đã lưu token ở nơi khác chưa?',
    confirmText: 'Đăng xuất',
    cancelText: 'Giữ lại',
    danger: true,
  })
  if (ok) clearToken()
}

onMounted(() => document.addEventListener('click', close))
onBeforeUnmount(() => document.removeEventListener('click', close))
</script>

<template>
  <header
    class="md:hidden sticky top-0 z-20 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]"
  >
    <div style="padding-top: env(safe-area-inset-top);">
      <div class="flex items-center justify-between px-4 py-2.5 max-w-screen-md mx-auto">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          <span class="text-sm font-semibold tracking-tight">Ledger</span>
        </NuxtLink>

        <div class="relative" @click.stop>
          <button
            type="button"
            class="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
            aria-label="Tài khoản"
            @click="menuOpen = !menuOpen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </button>

          <div
            v-if="menuOpen"
            class="absolute right-0 mt-1 w-64 card-flat border border-[var(--color-border)] shadow-lg py-1.5 text-sm"
          >
            <button
              class="w-full text-left px-3 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors"
              @click="openCategoryManager"
            >
              Quản lý danh mục
            </button>
            <button
              class="w-full text-left px-3 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors flex items-center justify-between gap-2"
              @click="tokenVisible = !tokenVisible"
            >
              <span>{{ tokenVisible ? 'Ẩn token' : 'Hiện token' }}</span>
              <span class="text-[var(--color-text-dim)]">{{ tokenVisible ? '🙈' : '👁' }}</span>
            </button>
            <div v-if="tokenVisible" class="px-3 pb-2">
              <div class="flex items-stretch gap-1.5">
                <code class="flex-1 input !py-1.5 text-xs tracking-wider">{{ token }}</code>
                <button class="btn btn-ghost !py-1.5 !px-2 text-xs" @click.stop="copyToken">Copy</button>
              </div>
            </div>
            <div class="border-t border-[var(--color-border)] my-1" />
            <button
              class="w-full text-left px-3 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-expense)]"
              @click="handleSignOut"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
