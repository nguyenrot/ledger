export type LedgerKind = 'income' | 'expense'

export interface LedgerCategory {
  id: string
  kind: LedgerKind
  slug: string
  name: string
  color: string
  position: number
  is_archived: boolean
  created_at: string
}

export interface CategoriesResponse {
  income: LedgerCategory[]
  expense: LedgerCategory[]
}

export interface NewCategory {
  kind: LedgerKind
  name: string
  color?: string
  position?: number
}

export interface CategoryPatch {
  name?: string
  color?: string
  position?: number
}

export interface Transaction {
  id: string
  kind: LedgerKind
  amount: number
  category: string
  note: string
  occurred_on: string
  created_at: string
}

export interface NewTransaction {
  kind: LedgerKind
  amount: number
  category: string
  note?: string
  occurred_on?: string
}

export interface TodayResponse {
  date: string
  transactions: Transaction[]
  income: number
  expense: number
  net: number
  count: number
}

export interface SummaryBucket {
  bucket: string
  income: number
  expense: number
  net: number
}

export interface SummaryCategoryRow {
  category: string
  amount: number
}

export interface Summary {
  from: string
  to: string
  group_by: 'day' | 'month'
  totals: { income: number; expense: number; net: number; count: number }
  buckets: SummaryBucket[]
  by_category: { income: SummaryCategoryRow[]; expense: SummaryCategoryRow[] }
}

export interface CreateAccountResponse {
  id: string
  created_at: string
}

export const TOKEN_PATTERN = /^[A-Za-z0-9]{10}$/
export const TOKEN_LENGTH = 10

export interface AccountInfo {
  id: string
  created_at: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const useLedgerApi = () => {
  const config = useRuntimeConfig()
  const { token, clearToken } = useToken()
  const baseUrl = config.public.apiBase as string

  async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init.headers as Record<string, string>) || {}),
    }
    // An explicit Authorization header (e.g. validating a candidate token at
    // login, before committing it to state) wins over the stored token.
    if (!headers['Authorization'] && token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(`${baseUrl}${path}`, { ...init, headers })
    if (!res.ok) {
      const body = await res.text()
      let msg = body
      try {
        const parsed = JSON.parse(body)
        msg = parsed?.error || parsed?.detail || body
      } catch {
        // Body wasn't JSON; use raw text.
      }
      if (res.status === 401) clearToken()
      throw new ApiError(res.status, msg || `HTTP ${res.status}`)
    }
    if (res.status === 204) return undefined as unknown as T
    return (await res.json()) as T
  }

  const qs = (params: Record<string, string | undefined>) => {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    if (entries.length === 0) return ''
    return '?' + new URLSearchParams(entries as [string, string][]).toString()
  }

  return {
    createAccount: (token: string) =>
      apiFetch<CreateAccountResponse>('/api/v1/ledger/accounts', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    /** Pass `explicitToken` to verify a candidate token WITHOUT it being in
     * state yet (login flow validates first, commits via setToken on success). */
    me: (explicitToken?: string) =>
      apiFetch<AccountInfo>(
        '/api/v1/ledger/me',
        explicitToken ? { headers: { Authorization: `Bearer ${explicitToken}` } } : {},
      ),

    categories: () => apiFetch<CategoriesResponse>('/api/v1/ledger/categories'),
    createCategory: (body: NewCategory) =>
      apiFetch<LedgerCategory>('/api/v1/ledger/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateCategory: (id: string, body: CategoryPatch) =>
      apiFetch<LedgerCategory>(`/api/v1/ledger/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deleteCategory: (id: string) =>
      apiFetch<void>(`/api/v1/ledger/categories/${id}`, { method: 'DELETE' }),
    reorderCategories: (kind: LedgerKind, order: string[]) =>
      apiFetch<{ items: LedgerCategory[] }>('/api/v1/ledger/categories/reorder', {
        method: 'POST',
        body: JSON.stringify({ kind, order }),
      }),

    listToday: () => apiFetch<TodayResponse>('/api/v1/ledger/transactions/today'),
    list: (params: { from?: string; to?: string; date?: string; kind?: LedgerKind; category?: string } = {}) =>
      apiFetch<Transaction[]>(`/api/v1/ledger/transactions${qs(params)}`),
    create: (body: NewTransaction) =>
      apiFetch<Transaction>('/api/v1/ledger/transactions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<NewTransaction>) =>
      apiFetch<Transaction>(`/api/v1/ledger/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      apiFetch<void>(`/api/v1/ledger/transactions/${id}`, { method: 'DELETE' }),

    summary: (params: { from: string; to: string; group_by?: 'day' | 'month' }) =>
      apiFetch<Summary>(`/api/v1/ledger/transactions/summary${qs(params)}`),
  }
}
