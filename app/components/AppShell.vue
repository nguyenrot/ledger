<script setup lang="ts">
import TopNav from '~/components/TopNav.vue'
import BottomTabs from '~/components/BottomTabs.vue'
import EntrySheet from '~/components/EntrySheet.vue'
import CategoryManagerSheet from '~/components/CategoryManagerSheet.vue'
import Toast from '~/components/Toast.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import { useCategories } from '~/composables/useCategories'

const categories = useCategories()
onMounted(() => {
  // Warm the cache as soon as the shell mounts so the EntrySheet's category
  // grid and the reports breakdown have data without per-component fetches.
  categories.ensureLoaded()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopNav />
    <!-- Mobile: pad top by the iOS status-bar inset so the totals card clears
         the Dynamic Island. Desktop has TopNav doing this implicitly. -->
    <main class="flex-1 pb-24 md:pb-8 pt-[env(safe-area-inset-top)] md:pt-0">
      <slot />
    </main>
    <BottomTabs />
    <EntrySheet />
    <CategoryManagerSheet />
    <Toast />
    <ConfirmDialog />
  </div>
</template>
