<script setup lang="ts">
import { useEntrySheet } from '~/composables/useEntrySheet'

const route = useRoute()
const sheet = useEntrySheet()
</script>

<template>
  <nav
    class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-xl border-t border-[var(--color-border)] safe-bottom"
  >
    <div class="grid grid-cols-3 items-center max-w-screen-md mx-auto relative">
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
        :class="route.path === '/' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Hôm nay</span>
      </NuxtLink>

      <div class="flex items-center justify-center">
        <button
          type="button"
          class="relative -translate-y-3 w-14 h-14 rounded-full flex items-center justify-center text-[#04201f] bg-[var(--color-accent)] active:scale-95 transition-transform"
          style="box-shadow: var(--shadow-fab);"
          aria-label="Ghi giao dịch mới"
          @click="sheet.openCreate()"
        >
          <!-- Perpetual breathe ring — premium motion at MOTION_INTENSITY 6 -->
          <span
            aria-hidden="true"
            class="absolute inset-0 rounded-full bg-[var(--color-accent)] breathe-ring"
            style="opacity: 0.4;"
          />
          <svg class="relative" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <NuxtLink
        to="/reports"
        class="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
        :class="route.path === '/reports' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span>Báo cáo</span>
      </NuxtLink>
    </div>
  </nav>
</template>
