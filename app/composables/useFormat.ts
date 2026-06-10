const VND_FORMATTER = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

/** Backend "today" lives in Asia/Ho_Chi_Minh — every default date / preset
 * must be keyed in that timezone, NOT the browser's. 'en-CA' yields YYYY-MM-DD. */
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'
export const vnDateIso = (d: Date = new Date()): string =>
  d.toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE })

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

  /** YYYY-MM-DD for "today" in Asia/Ho_Chi_Minh (matches the backend). */
  const todayIso = (): string => vnDateIso()

  /** First-of-month ISO, in Asia/Ho_Chi_Minh. */
  const firstOfMonthIso = (ref?: Date): string =>
    `${vnDateIso(ref).slice(0, 7)}-01`

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

// Static category dictionaries removed — categories are now per-account and
// fetched via useCategories(). Resolve labels and colors with
// useCategories().labelFor(kind, slug) / colorFor(kind, slug).
