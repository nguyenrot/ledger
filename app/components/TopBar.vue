<script setup lang="ts">
import { useToken } from '~/composables/useToken'

const { clearToken } = useToken()
const route = useRoute()

function handleSignOut() {
  if (confirm('Đăng xuất sẽ xoá token khỏi trình duyệt này. Anh đã lưu token ở nơi khác chưa?')) {
    clearToken()
  }
}
</script>

<template>
  <header class="relative z-10 border-b border-[var(--color-border)] bg-[rgba(2,2,8,0.85)] backdrop-blur">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div class="w-2 h-2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_var(--color-cyan)] group-hover:shadow-[0_0_18px_var(--color-cyan)] transition-shadow" />
        <span class="font-display text-lg tracking-wider">
          <span class="text-[var(--color-cyan)]">LEDGER</span>
          <span class="text-[var(--color-fg-dim)] hidden sm:inline">·kynguyen.cc</span>
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-1 sm:gap-3 text-sm">
        <NuxtLink
          to="/"
          class="px-3 py-1.5 rounded-md font-display tracking-wider uppercase text-xs transition-colors"
          :class="route.path === '/' ? 'text-[var(--color-cyan)] bg-[rgba(0,245,255,0.08)]' : 'text-[var(--color-fg-muted)] hover:text-[var(--color-cyan)]'"
        >
          Hôm nay
        </NuxtLink>
        <NuxtLink
          to="/reports"
          class="px-3 py-1.5 rounded-md font-display tracking-wider uppercase text-xs transition-colors"
          :class="route.path === '/reports' ? 'text-[var(--color-cyan)] bg-[rgba(0,245,255,0.08)]' : 'text-[var(--color-fg-muted)] hover:text-[var(--color-cyan)]'"
        >
          Báo cáo
        </NuxtLink>
        <button
          class="px-3 py-1.5 rounded-md font-display tracking-wider uppercase text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-rose)] transition-colors"
          title="Xoá token khỏi trình duyệt này"
          @click="handleSignOut"
        >
          ⏏ Thoát
        </button>
      </nav>
    </div>
  </header>
</template>
