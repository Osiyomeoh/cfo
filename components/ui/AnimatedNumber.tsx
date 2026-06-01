'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  format: (n: number) => string
  className?: string
}

/** Smooth count-up when portfolio values change */
export function AnimatedNumber({ value, format, className = '' }: Props) {
  const [display, setDisplay] = useState(value)
  const [tick, setTick] = useState(false)
  const prev = useRef(value)
  const frame = useRef<number>(0)

  useEffect(() => {
    if (Math.abs(prev.current - value) < 0.01) return

    const start = prev.current
    const end = value
    const t0 = performance.now()
    const duration = 550

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - p) ** 3
      setDisplay(start + (end - start) * eased)
      if (p < 1) {
        frame.current = requestAnimationFrame(step)
      } else {
        setDisplay(end)
        prev.current = end
        setTick(true)
        window.setTimeout(() => setTick(false), 320)
      }
    }

    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [value])

  return (
    <span className={`${className} ${tick ? 'number-tick' : ''}`.trim()}>
      {format(display)}
    </span>
  )
}
