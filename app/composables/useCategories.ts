import { useLedgerApi, type CategoriesResponse, type LedgerCategory, type LedgerKind } from '~/composables/useLedgerApi'

const EMPTY: CategoriesResponse = { income: [], expense: [] }

/**
 * Global cache for the user's category lists. Multiple components (EntrySheet,
 * CategoryGrid, CategoryManagerSheet, ReportCategoryBreakdown) all hit the
 * same `useState`-backed snapshot, so renames/deletes propagate without each
 * site re-fetching.
 *
 * `refresh()` is exposed so callers can pull explicitly after mutations.
 */
export const useCategories = () => {
  const api = useLedgerApi()
  const cache = useState<CategoriesResponse>('ledger-categories', () => ({ ...EMPTY }))
  const loading = useState<boolean>('ledger-categories-loading', () => false)
  const loaded = useState<boolean>('ledger-categories-loaded', () => false)

  async function refresh() {
    loading.value = true
    try {
      cache.value = await api.categories()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) await refresh()
  }

  function reset() {
    cache.value = { ...EMPTY }
    loaded.value = false
  }

  function byKind(kind: LedgerKind): LedgerCategory[] {
    return kind === 'income' ? cache.value.income : cache.value.expense
  }

  /** Resolve a slug to a display label, falling back to the slug for unknown
   * slugs (e.g. archived categories referenced by old transactions). */
  function labelFor(kind: LedgerKind | string, slug: string): string {
    const list = kind === 'income' ? cache.value.income : cache.value.expense
    const match = list.find((c) => c.slug === slug)
    return match?.name || slug
  }

  function colorFor(kind: LedgerKind | string, slug: string): string {
    const list = kind === 'income' ? cache.value.income : cache.value.expense
    const match = list.find((c) => c.slug === slug)
    return match?.color || '#94a3b8'
  }

  /** Resolve label without knowing the kind — searches both lists. Useful for
   * report breakdowns that don't track per-row kind. */
  function labelForUnknownKind(slug: string): string {
    const all = [...cache.value.income, ...cache.value.expense]
    const match = all.find((c) => c.slug === slug)
    return match?.name || slug
  }

  function colorForUnknownKind(slug: string): string {
    const all = [...cache.value.income, ...cache.value.expense]
    const match = all.find((c) => c.slug === slug)
    return match?.color || '#94a3b8'
  }

  return {
    cache,
    loading,
    loaded,
    refresh,
    ensureLoaded,
    reset,
    byKind,
    labelFor,
    colorFor,
    labelForUnknownKind,
    colorForUnknownKind,
  }
}

/** Curated swatches for the color picker — Tailwind-ish, balanced across hues. */
export const CATEGORY_COLOR_SWATCHES: string[] = [
  '#f87171', // rose
  '#fb923c', // orange
  '#fbbf24', // amber
  '#fde047', // yellow
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#a78bfa', // violet
  '#f472b6', // pink
  '#94a3b8', // slate
]
