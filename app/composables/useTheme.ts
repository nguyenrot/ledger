/**
 * Theme controller — 'system' | 'light' | 'dark'.
 *
 * Stores the *intent* (e.g. 'system') in localStorage and applies the
 * *resolved* value (always 'light' or 'dark') to `<html data-theme>` so the
 * CSS only needs to know about two states.
 *
 * SSR is disabled (Nuxt `ssr: false`), so we don't have to guard against
 * server execution beyond the usual `import.meta.client` checks.
 */
export type ThemeIntent = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'x106-ledger-theme'

function readStored(): ThemeIntent {
  if (!import.meta.client) return 'system'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

function systemPrefers(): ResolvedTheme {
  if (!import.meta.client) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolve(intent: ThemeIntent): ResolvedTheme {
  return intent === 'system' ? systemPrefers() : intent
}

function apply(intent: ThemeIntent) {
  if (!import.meta.client) return
  const resolved = resolve(intent)
  document.documentElement.dataset.theme = resolved
  // Keep the `meta[name=theme-color]` browser-chrome colour in sync with the
  // actual page background so the iOS / Android URL bar doesn't look bolted on.
  const meta = document.head.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'light' ? '#fafbfc' : '#08080a')
}

let mediaListenerAttached = false

export const useTheme = () => {
  const intent = useState<ThemeIntent>('ledger-theme-intent', () => readStored())
  const resolved = useState<ResolvedTheme>('ledger-theme-resolved', () => resolve(readStored()))

  function set(next: ThemeIntent) {
    intent.value = next
    resolved.value = resolve(next)
    if (import.meta.client) {
      window.localStorage.setItem(STORAGE_KEY, next)
      apply(next)
    }
  }

  function hydrate() {
    if (!import.meta.client) return
    const stored = readStored()
    intent.value = stored
    resolved.value = resolve(stored)
    apply(stored)

    if (!mediaListenerAttached) {
      const mq = window.matchMedia('(prefers-color-scheme: light)')
      const onChange = () => {
        if (intent.value === 'system') {
          resolved.value = systemPrefers()
          apply('system')
        }
      }
      mq.addEventListener?.('change', onChange)
      mediaListenerAttached = true
    }
  }

  return { intent, resolved, set, hydrate }
}
