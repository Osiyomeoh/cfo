export function formatUSD(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCompact(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return formatUSD(value, 0)
}

export function formatPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${formatUSD(value)}`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function parseIntent(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('yield') || t.includes('best')) return 'yield'
  if (t.includes('risk') || t.includes('safe')) return 'risk'
  if (t.includes('gain') || t.includes('profit') || t.includes('return')) return 'gains'
  if (t.includes('compound')) return 'compound'
  if (t.includes('portfolio') || t.includes('balance') || t.includes('breakdown')) return 'portfolio'
  return 'default'
}

export function shortHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : hash
}
