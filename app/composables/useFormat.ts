const VND_FORMATTER = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

export const useFormat = () => {
  const formatVnd = (amount: number): string => `${VND_FORMATTER.format(amount)}₫`

  const formatSignedVnd = (amount: number): string => {
    if (amount === 0) return '0₫'
    const sign = amount > 0 ? '+' : '−'
    return `${sign}${VND_FORMATTER.format(Math.abs(amount))}₫`
  }

  const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }): string => {
    try {
      return new Date(iso).toLocaleDateString('vi-VN', opts)
    } catch {
      return iso
    }
  }

  const formatRelativeDate = (iso: string): string => {
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)
    const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000)
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === -1) return 'Hôm qua'
    if (diffDays === 1) return 'Ngày mai'
    return formatDate(iso)
  }

  const formatTime = (iso: string): string => {
    try {
      return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  /** YYYY-MM-DD for the user's local "today" (browser timezone). */
  const todayIso = (): string => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  /** First-of-month ISO. */
  const firstOfMonthIso = (ref?: Date): string => {
    const d = ref ?? new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}-01`
  }

  return {
    formatVnd,
    formatSignedVnd,
    formatDate,
    formatRelativeDate,
    formatTime,
    todayIso,
    firstOfMonthIso,
  }
}

export const CATEGORY_LABELS: Record<string, string> = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  shopping: 'Mua sắm',
  bills: 'Hóa đơn',
  entertainment: 'Giải trí',
  health: 'Sức khỏe',
  salary: 'Lương',
  bonus: 'Thưởng',
  other: 'Khác',
}

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#ff6b9d',
  transport: '#00f5ff',
  shopping: '#aa00ff',
  bills: '#f0b429',
  entertainment: '#ff00aa',
  health: '#00ff88',
  salary: '#00ff88',
  bonus: '#ffd700',
  other: '#94a3b8',
}
