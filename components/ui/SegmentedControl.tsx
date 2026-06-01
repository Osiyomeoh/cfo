'use client'
import { useLayoutEffect, useRef, useState } from 'react'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  variant?: 'surface' | 'accent'
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'surface',
  className = '',
}: Props<T>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0 })

  const idx = options.findIndex(o => o.value === value)
  const isAccent = variant === 'accent'

  useLayoutEffect(() => {
    const btn = btnRefs.current[idx]
    const track = trackRef.current
    if (!btn || !track) return
    setPill({ left: btn.offsetLeft, width: btn.offsetWidth })
  }, [value, idx, options.length])

  return (
    <div ref={trackRef} className={`segment-track relative ${className}`}>
      <span
        className={`segment-pill absolute top-[3px] bottom-[3px] ${isAccent ? 'segment-pill--accent' : ''}`}
        style={{
          left: pill.width ? pill.left : 3,
          width: pill.width || 0,
          opacity: pill.width ? 1 : 0,
        }}
      />
      {options.map((opt, i) => (
        <button
          key={opt.value}
          ref={el => {
            btnRefs.current[i] = el
          }}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`segment-btn relative z-[1] ${isAccent ? 'segment-btn--accent' : ''} ${
            value === opt.value ? 'segment-btn--active' : ''
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
