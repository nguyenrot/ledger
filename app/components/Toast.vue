<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed z-[60] flex flex-col gap-2 pointer-events-none px-4 bottom-24 md:bottom-auto md:top-4 md:right-4 md:left-auto left-0 right-0 md:items-end items-center"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto max-w-sm w-fit px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-3"
          :class="{
            'bg-[var(--color-surface)] border-[var(--color-border-strong)] text-[var(--color-text)]': t.kind === 'info',
            'bg-[var(--color-toast-success-bg)] border-[var(--color-income)]/60 text-[var(--color-income)]': t.kind === 'success',
            'bg-[var(--color-toast-error-bg)] border-[var(--color-expense)]/60 text-[var(--color-expense)]': t.kind === 'error',
          }"
          style="box-shadow: var(--shadow-popover);"
        >
          <span class="shrink-0">
            <svg v-if="t.kind === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else-if="t.kind === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span>{{ t.message }}</span>
          <button
            v-if="t.kind === 'error'"
            class="opacity-60 hover:opacity-100 transition-opacity ml-1"
            aria-label="Đóng thông báo"
            @click="dismiss(t.id)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
