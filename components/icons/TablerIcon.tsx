import type { CSSProperties } from 'react'

export function TablerIcon({
  name,
  className = '',
  size,
  style,
}: {
  name: string
  className?: string
  size?: number
  style?: CSSProperties
}) {
  return (
    <i
      className={`ti ti-${name} ${className}`.trim()}
      style={{ ...(size ? { fontSize: size } : {}), ...style }}
      aria-hidden
    />
  )
}
