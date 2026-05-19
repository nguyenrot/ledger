<script setup lang="ts">
import { useTheme, type ThemeIntent } from '~/composables/useTheme'

const { intent, set } = useTheme()

const options: { value: ThemeIntent; label: string; aria: string }[] = [
  { value: 'system', label: 'Hệ thống', aria: 'Theo hệ thống' },
  { value: 'light', label: 'Sáng', aria: 'Giao diện sáng' },
  { value: 'dark', label: 'Tối', aria: 'Giao diện tối' },
]
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-3 py-2">
    <span class="text-sm text-[var(--color-text-muted)]">Giao diện</span>
    <div
      class="inline-flex bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md p-0.5"
      role="radiogroup"
      aria-label="Chọn giao diện"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :aria-label="opt.aria"
        :aria-pressed="intent === opt.value"
        class="w-7 h-7 inline-flex items-center justify-center rounded-[5px] transition-colors"
        :class="intent === opt.value
          ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[inset_0_0_0_1px_var(--color-border)]'
          : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'"
        @click="set(opt.value)"
      >
        <!-- System (monitor) -->
        <svg v-if="opt.value === 'system'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <!-- Sun -->
        <svg v-else-if="opt.value === 'light'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <!-- Moon -->
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  </div>
</template>
