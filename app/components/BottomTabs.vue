<script setup lang="ts">
import { useEntrySheet } from '~/composables/useEntrySheet'

const route = useRoute()
const sheet = useEntrySheet()
</script>

<template>
  <nav
    class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-border)] safe-bottom"
  >
    <div class="grid grid-cols-3 items-center max-w-screen-md mx-auto">
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium"
        :class="route.path === '/' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Hôm nay</span>
      </NuxtLink>

      <div class="flex items-center justify-center">
        <button
          type="button"
          class="-translate-y-3 w-14 h-14 rounded-full flex items-center justify-center text-[#062b2a] bg-[var(--color-accent)] hover:bg-[#1ad6c4] active:bg-[#0fa595] transition-colors"
          style="box-shadow: var(--shadow-fab);"
          aria-label="Ghi giao dịch mới"
          @click="sheet.openCreate()"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <NuxtLink
        to="/reports"
        class="flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium"
        :class="route.path === '/reports' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span>Báo cáo</span>
      </NuxtLink>
    </div>
  </nav>
</template>
