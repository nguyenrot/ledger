<script setup lang="ts">
import { useToken } from '~/composables/useToken'
import { useEntrySheet } from '~/composables/useEntrySheet'
import { useCategoryManager } from '~/composables/useCategoryManager'
import { useConfirm } from '~/composables/useConfirm'
import ThemeSwitcher from '~/components/ThemeSwitcher.vue'

const route = useRoute()
const { token, clearToken } = useToken()
const sheet = useEntrySheet()
const categoryManager = useCategoryManager()
const confirm = useConfirm()
const menuOpen = ref(false)
const tokenVisible = ref(false)

function close() {
  menuOpen.value = false
  tokenVisible.value = false
}

function copyToken() {
  if (token.value) navigator.clipboard?.writeText(token.value).catch(() => {})
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

onMounted(() => {
  document.addEventListener('click', close)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', close)
})
</script>

<template>
  <header
    class="hidden md:block sticky top-0 z-20 bg-[var(--color-bg)]/85 backdrop-blur-xl border-b border-[var(--color-border)]"
  >
    <div class="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
      <NuxtLink to="/" class="flex items-center gap-2.5 font-semibold text-base group">
        <span class="relative flex w-2 h-2">
          <span class="absolute inset-0 rounded-full bg-[var(--color-accent)] breathe-ring" />
          <span class="relative rounded-full w-2 h-2 bg-[var(--color-accent)]" />
        </span>
        <span>Ledger</span>
      </NuxtLink>

      <nav class="flex items-center gap-1 text-sm">
        <NuxtLink
          to="/"
          class="relative px-3.5 py-1.5 rounded-md font-medium transition-colors"
          :class="route.path === '/' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        >
          <span
            v-if="route.path === '/'"
            class="absolute inset-0 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] -z-0"
          />
          <span class="relative z-10">Hôm nay</span>
        </NuxtLink>
        <NuxtLink
          to="/reports"
          class="relative px-3.5 py-1.5 rounded-md font-medium transition-colors"
          :class="route.path === '/reports' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        >
          <span
            v-if="route.path === '/reports'"
            class="absolute inset-0 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] -z-0"
          />
          <span class="relative z-10">Báo cáo</span>
        </NuxtLink>
        <button class="btn btn-primary !py-1.5 !px-3.5 ml-2 group" @click="sheet.openCreate()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Ghi</span>
          <span class="text-[10px] font-mono text-[#04201f]/70 hidden lg:inline">⌘N</span>
        </button>
      </nav>

      <div class="relative" @click.stop>
        <button
          class="btn btn-ghost !py-1.5 !px-3"
          aria-label="Tài khoản"
          @click="menuOpen = !menuOpen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Tài khoản</span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            class="text-[var(--color-text-dim)] transition-transform"
            :class="menuOpen ? 'rotate-180' : ''"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-1.5 w-72 card border border-[var(--color-border)] py-1.5 text-sm overflow-hidden"
          style="box-shadow: var(--shadow-popover);"
        >
          <button
            class="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-2)] transition-colors"
            @click="categoryManager.show(); close()"
          >
            Quản lý danh mục
          </button>
          <ThemeSwitcher />
          <div class="divider my-1" />
          <button
            class="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-2)] transition-colors flex items-center justify-between gap-2"
            @click="tokenVisible = !tokenVisible"
          >
            <span>{{ tokenVisible ? 'Ẩn token' : 'Hiện token' }}</span>
            <svg v-if="tokenVisible" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-dim)]">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-dim)]">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <div v-if="tokenVisible" class="px-3 pb-2">
            <div class="flex items-stretch gap-1.5">
              <code class="flex-1 input num !py-1.5 text-xs tracking-[0.18em]">{{ token }}</code>
              <button class="btn btn-ghost !py-1.5 !px-2 text-xs" @click="copyToken">Copy</button>
            </div>
          </div>
          <div class="divider my-1" />
          <button
            class="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-expense)]"
            @click="handleSignOut"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
