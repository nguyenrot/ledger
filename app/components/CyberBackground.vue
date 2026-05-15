<script setup lang="ts">
// Static decorative background — grid + scanline + corner runes.
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-[var(--color-bg)]">
    <div class="absolute inset-0 opacity-60"
         style="background: radial-gradient(circle at 20% 20%, rgba(0, 245, 255, 0.12), transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(170, 0, 255, 0.12), transparent 50%),
                            radial-gradient(circle at 60% 30%, rgba(255, 0, 170, 0.08), transparent 60%);" />
    <div class="cyber-grid" />
    <div class="scanline" />
    <div class="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-cyan-dim)] pulse-rune">
      ★ ledger.kynguyen.cc · 道
    </div>
    <div class="absolute bottom-3 right-3 text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-violet)] pulse-rune"
         style="animation-delay: 1.5s">
      sys/v1 · 修
    </div>
  </div>
</template>
