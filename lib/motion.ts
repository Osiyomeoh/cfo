/** Stagger delay for list entrance animations */
export function staggerDelay(index: number, base = 0.04, step = 0.045): string {
  return `${base + index * step}s`
}
