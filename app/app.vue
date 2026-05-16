<script setup lang="ts">
import { useToken } from '~/composables/useToken'
import AppShell from '~/components/AppShell.vue'
import TokenGate from '~/components/TokenGate.vue'

const { token, hydrate } = useToken()

onMounted(() => {
  hydrate()
})
</script>

<template>
  <div>
    <template v-if="token">
      <AppShell>
        <NuxtPage />
      </AppShell>
    </template>
    <template v-else>
      <TokenGate />
    </template>
  </div>
</template>
