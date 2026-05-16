import type { LedgerKind, Transaction } from '~/composables/useLedgerApi'

interface EntrySheetState {
  open: boolean
  mode: 'create' | 'edit'
  // Prefilled values; for edit, also the id.
  id: string | null
  kind: LedgerKind
  amount: string         // digit string, NOT number — we accumulate digits as the user types
  category: string
  note: string
  occurredOn: string     // ISO YYYY-MM-DD
}

const isoToday = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const baseState = (): EntrySheetState => ({
  open: false,
  mode: 'create',
  id: null,
  kind: 'expense',
  amount: '',
  category: 'food',
  note: '',
  occurredOn: isoToday(),
})

/**
 * Global entry-sheet controller. Single source of truth so any component
 * (FAB, top-nav, list row) can open the same sheet without prop drilling.
 */
export const useEntrySheet = () => {
  const state = useState<EntrySheetState>('entry-sheet', baseState)

  function openCreate() {
    state.value = { ...baseState(), open: true }
  }

  function openEdit(tx: Transaction) {
    state.value = {
      open: true,
      mode: 'edit',
      id: tx.id,
      kind: tx.kind,
      amount: String(tx.amount),
      category: tx.category,
      note: tx.note || '',
      occurredOn: tx.occurred_on,
    }
  }

  function close() {
    state.value.open = false
  }

  return { state, openCreate, openEdit, close }
}
