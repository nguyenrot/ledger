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

const { byKind, ensureLoaded, labelFor } = useCategories()

onMounted(ensureLoaded)

const cats = computed(() => byKind(props.kind))

const inActiveList = computed(() =>
  cats.value.some((c) => c.slug === props.modelValue),
)

// A non-empty slug missing from the ACTIVE list = archived category referenced
// by an old transaction. Keep it (shown as a disabled chip below) — silently
// swapping to list[0] would re-categorize the transaction on edit.
const archivedSelection = computed(() => !!props.modelValue && !inActiveList.value)

// Only auto-default when the model is EMPTY — never replace an existing slug.
watch(
  [cats, () => props.modelValue],
  ([list, value]) => {
    if (list.length === 0) return
    if (!value) emit('update:modelValue', list[0]!.slug)
  },
  { immediate: true },
)

// Switching kind makes the previous slug meaningless (slugs are per-kind):
// re-default to the new kind's first category.
watch(
  () => props.kind,
  () => {
    const list = cats.value
    if (list.length > 0 && !inActiveList.value) {
      emit('update:modelValue', list[0]!.slug)
    }
  },
)

function set(slug: string) {
  if (props.modelValue !== slug) emit('update:modelValue', slug)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-1.5">
    <!-- Archived category kept from an old transaction — selected but inert -->
    <button
      v-if="archivedSelection"
      type="button"
      disabled
      class="chip chip-active relative !py-2.5 text-sm opacity-60 cursor-default"
    >
      <span class="dot shrink-0 bg-[var(--color-text-dim)]" />
      <span class="truncate">{{ labelFor(kind, modelValue) }}</span>
    </button>
    <button
      v-for="c in cats"
      :key="c.id"
      type="button"
      class="chip relative !py-2.5 text-sm"
      :class="modelValue === c.slug ? 'chip-active' : ''"
      :style="modelValue === c.slug
        ? { borderColor: c.color, color: c.color, backgroundColor: `${c.color}22` }
        : undefined"
      @click="set(c.slug)"
    >
      <span class="dot shrink-0" :style="{ background: c.color }" />
      <span class="truncate">{{ c.name }}</span>
    </button>
  </div>
</template>
