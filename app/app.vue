<script setup lang="ts">
import { useToken } from '~/composables/useToken'
import { useTheme } from '~/composables/useTheme'
import AppShell from '~/components/AppShell.vue'
import TokenGate from '~/components/TokenGate.vue'

const { token, hydrate: hydrateToken } = useToken()
const { hydrate: hydrateTheme } = useTheme()

onMounted(() => {
  hydrateToken()
  hydrateTheme()
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
