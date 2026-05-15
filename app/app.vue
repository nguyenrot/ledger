<script setup lang="ts">
import { useToken } from '~/composables/useToken'
import CyberBackground from '~/components/CyberBackground.vue'
import TokenGate from '~/components/TokenGate.vue'

const { token, hydrate } = useToken()

onMounted(() => {
  hydrate()
})
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden">
    <CyberBackground />

    <template v-if="token">
      <NuxtPage />
    </template>
    <template v-else>
      <TokenGate />
    </template>
  </div>
</template>
