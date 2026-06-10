import { useCategories } from '~/composables/useCategories'
import { useEntrySheet } from '~/composables/useEntrySheet'

/**
 * Single place to wipe every account-scoped `useState` cache. Must be called
 * alongside `clearToken()` on logout — otherwise the next token to log in on
 * this device sees (and submits against) the PREVIOUS account's categories,
 * because `useCategories().loaded` survives the TokenGate remount.
 */
export const useAccountState = () => {
  const categories = useCategories()
  const entrySheet = useEntrySheet()

  function resetAccountState() {
    categories.reset()
    entrySheet.reset()
  }

  return { resetAccountState }
}
