<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import type { LedgerKind } from '~/composables/useLedgerApi'

const props = defineProps<{
  modelValue: string  // slug
  kind: LedgerKind
}>()
const emit = defineEmits<{
  'update:modelValue': [v: string]
}>()

const { byKind, ensureLoaded } = useCategories()

onMounted(ensureLoaded)

const cats = computed(() => byKind(props.kind))

// Re-anchor the selected slug when kind flips, or when the current slug isn't
// in the kind's list (e.g. category was archived after the sheet opened).
watch(
  [() => props.kind, cats],
  ([, list]) => {
    if (list.length === 0) return
    if (!list.find((c) => c.slug === props.modelValue)) {
      emit('update:modelValue', list[0]!.slug)
    }
  },
  { immediate: true },
)

function set(slug: string) {
  if (props.modelValue !== slug) emit('update:modelValue', slug)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-1.5">
    <button
      v-for="c in cats"
      :key="c.id"
      type="button"
      class="chip relative py-2.5 text-sm transition-colors"
      :class="modelValue === c.slug ? 'chip-active' : ''"
      :style="modelValue === c.slug
        ? { borderColor: c.color, color: c.color, backgroundColor: `${c.color}1f` }
        : undefined"
      @click="set(c.slug)"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: c.color }" />
      <span class="truncate">{{ c.name }}</span>
    </button>
  </div>
</template>
