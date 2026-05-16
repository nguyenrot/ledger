<script setup lang="ts">
import TopNav from '~/components/TopNav.vue'
import BottomTabs from '~/components/BottomTabs.vue'
import EntrySheet from '~/components/EntrySheet.vue'
import Toast from '~/components/Toast.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopNav />
    <main class="flex-1 pb-24 md:pb-8">
      <slot />
    </main>
    <BottomTabs />
    <EntrySheet />
    <Toast />
    <ConfirmDialog />
  </div>
</template>
