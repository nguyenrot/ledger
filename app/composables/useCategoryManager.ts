/** Global open-state for the CategoryManagerSheet, similar to useEntrySheet. */
export const useCategoryManager = () => {
  const open = useState<boolean>('category-manager-open', () => false)

  return {
    open,
    show: () => { open.value = true },
    close: () => { open.value = false },
    toggle: () => { open.value = !open.value },
  }
}
