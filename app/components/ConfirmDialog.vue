<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'

const { state, answer } = useConfirm()

function onKeyDown(e: KeyboardEvent) {
  if (!state.value.open) return
  if (e.key === 'Escape') answer(false)
  if (e.key === 'Enter') answer(true)
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="state.open"
        class="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="answer(false)"
      >
        <div class="card w-full max-w-sm p-5" style="box-shadow: var(--shadow-popover);">
          <div class="flex items-start gap-3 mb-4">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :class="state.danger
                ? 'bg-[var(--color-expense)]/12 text-[var(--color-expense)]'
                : 'bg-[var(--color-accent)]/14 text-[var(--color-accent)]'"
            >
              <svg v-if="state.danger" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-[15px] font-semibold tracking-tight mb-1">{{ state.title }}</h2>
              <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{{ state.body }}</p>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-ghost" @click="answer(false)">{{ state.cancelText }}</button>
            <button
              class="btn"
              :class="state.danger ? 'btn-danger' : 'btn-primary'"
              @click="answer(true)"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
