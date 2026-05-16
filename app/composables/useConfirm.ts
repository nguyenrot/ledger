interface ConfirmRequest {
  open: boolean
  title: string
  body: string
  confirmText: string
  cancelText: string
  danger: boolean
  resolve: ((value: boolean) => void) | null
}

const baseState = (): ConfirmRequest => ({
  open: false,
  title: '',
  body: '',
  confirmText: 'OK',
  cancelText: 'Hủy',
  danger: false,
  resolve: null,
})

interface AskOptions {
  title?: string
  body: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

/**
 * Themed confirm dialog backed by a shared promise. Drop-in replacement for
 * the native `confirm()`. Caller `await`s the boolean.
 */
export const useConfirm = () => {
  const state = useState<ConfirmRequest>('confirm-dialog', baseState)

  function ask(opts: AskOptions): Promise<boolean> {
    return new Promise((resolve) => {
      state.value = {
        open: true,
        title: opts.title ?? 'Xác nhận',
        body: opts.body,
        confirmText: opts.confirmText ?? 'OK',
        cancelText: opts.cancelText ?? 'Hủy',
        danger: opts.danger ?? false,
        resolve,
      }
    })
  }

  function answer(value: boolean) {
    state.value.resolve?.(value)
    state.value = baseState()
  }

  return { state, ask, answer }
}
