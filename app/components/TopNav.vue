<script setup lang="ts">
import { useToken } from '~/composables/useToken'
import { useEntrySheet } from '~/composables/useEntrySheet'

const route = useRoute()
const { token, clearToken } = useToken()
const sheet = useEntrySheet()
const menuOpen = ref(false)
const tokenVisible = ref(false)

function close() {
  menuOpen.value = false
  tokenVisible.value = false
}

function copyToken() {
  if (token.value) navigator.clipboard?.writeText(token.value).catch(() => {})
}

function handleSignOut() {
  if (confirm('Đăng xuất sẽ xoá token khỏi trình duyệt này. Anh đã lưu token ở nơi khác chưa?')) {
    clearToken()
  }
  close()
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
    class="hidden md:block sticky top-0 z-20 bg-[var(--color-bg)]/90 backdrop-blur border-b border-[var(--color-border)]"
  >
    <div class="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-base">
        <span class="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
        Ledger
      </NuxtLink>

      <nav class="flex items-center gap-1 text-sm">
        <NuxtLink
          to="/"
          class="px-3 py-1.5 rounded-md font-medium transition-colors"
          :class="route.path === '/' ? 'text-[var(--color-accent)] bg-[var(--color-surface)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        >
          Hôm nay
        </NuxtLink>
        <NuxtLink
          to="/reports"
          class="px-3 py-1.5 rounded-md font-medium transition-colors"
          :class="route.path === '/reports' ? 'text-[var(--color-accent)] bg-[var(--color-surface)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        >
          Báo cáo
        </NuxtLink>
        <button class="btn btn-primary !py-1.5 !px-3 ml-2" @click="sheet.openCreate()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ghi
        </button>
      </nav>

      <div class="relative" @click.stop>
        <button
          class="btn btn-ghost !py-1.5 !px-3"
          aria-label="Tài khoản"
          @click="menuOpen = !menuOpen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Tài khoản</span>
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-1 w-72 card-flat border border-[var(--color-border)] shadow-lg py-1.5 text-sm"
        >
          <button
            class="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-2)] transition-colors flex items-center justify-between gap-2"
            @click="tokenVisible = !tokenVisible"
          >
            <span>{{ tokenVisible ? 'Ẩn token' : 'Hiện token' }}</span>
            <span class="label-dim">{{ tokenVisible ? '🙈' : '👁' }}</span>
          </button>
          <div v-if="tokenVisible" class="px-3 pb-2">
            <div class="flex items-stretch gap-1.5">
              <code class="flex-1 input !py-1.5 text-xs tracking-wider">{{ token }}</code>
              <button class="btn btn-ghost !py-1.5 !px-2 text-xs" @click="copyToken">Copy</button>
            </div>
          </div>
          <div class="border-t border-[var(--color-border)] my-1" />
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
