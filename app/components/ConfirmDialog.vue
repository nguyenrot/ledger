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
        <div class="card w-full max-w-sm p-5 shadow-2xl">
          <h2 class="text-base font-semibold mb-2">{{ state.title }}</h2>
          <p class="text-sm text-[var(--color-text-muted)] mb-5 leading-relaxed">{{ state.body }}</p>
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
