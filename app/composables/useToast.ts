export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
  /** Auto-dismiss after this many ms; 0 = persistent. */
  duration: number
}

let nextId = 1

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  function push(kind: ToastKind, message: string, duration = 2200) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, kind, message, duration }]
    if (duration > 0 && import.meta.client) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (msg: string, duration?: number) => push('success', msg, duration),
    error: (msg: string, duration = 4500) => push('error', msg, duration),
    info: (msg: string, duration?: number) => push('info', msg, duration),
  }
}
