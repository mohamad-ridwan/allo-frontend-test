export const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholders/rocket-placeholder.svg'

export function formatCost(cost: string | number | null | undefined): string {
  if (cost === null || cost === undefined || cost === '') return 'N/A'
  const numeric = Number(cost)
  if (isNaN(numeric)) return String(cost)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numeric)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
