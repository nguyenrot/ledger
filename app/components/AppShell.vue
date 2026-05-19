<script setup lang="ts">
import TopNav from '~/components/TopNav.vue'
import MobileTopBar from '~/components/MobileTopBar.vue'
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
  <div class="min-h-[100dvh] flex flex-col">
    <TopNav />
    <!-- MobileTopBar handles the iOS status-bar inset on mobile via its own
         padding-top, so main doesn't need additional pt-[safe-inset-top]. -->
    <MobileTopBar />
    <main class="flex-1 pb-28 md:pb-10">
      <slot />
    </main>
    <BottomTabs />
    <EntrySheet />
    <CategoryManagerSheet />
    <Toast />
    <ConfirmDialog />
  </div>
</template>
