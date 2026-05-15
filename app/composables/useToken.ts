const STORAGE_KEY = 'x106-ledger-token'

export const useToken = () => {
  const token = useState<string | null>('ledger-token', () => null)

  // Read from localStorage on first client-side access. Safe to call multiple
  // times — useState is shared, so subsequent calls just see the cached value.
  const hydrate = () => {
    if (import.meta.client && token.value === null) {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) token.value = raw
    }
  }

  const setToken = (raw: string | null) => {
    token.value = raw
    if (import.meta.client) {
      if (raw) window.localStorage.setItem(STORAGE_KEY, raw)
      else window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const clearToken = () => setToken(null)

  return { token, hydrate, setToken, clearToken }
}
