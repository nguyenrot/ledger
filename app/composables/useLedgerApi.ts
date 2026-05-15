export type LedgerKind = 'income' | 'expense'

export interface LedgerCategory {
  id: string
  label: string
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
  token: string
  created_at: string
}

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
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`

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
    createAccount: () =>
      apiFetch<CreateAccountResponse>('/api/v1/ledger/accounts', { method: 'POST', body: '{}' }),
    me: () => apiFetch<AccountInfo>('/api/v1/ledger/me'),
    categories: () => apiFetch<LedgerCategory[]>('/api/v1/ledger/categories'),

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
