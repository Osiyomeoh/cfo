/** Sparkline matching prototype SVG path */
export function SparkLine() {
  return (
    <svg
      className="w-full h-10 mt-3"
      viewBox="0 0 220 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c896" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,32 C30,28 60,20 100,16 C140,12 170,8 220,4"
        fill="none"
        stroke="#00c896"
        strokeWidth="1.5"
      />
      <path
        d="M0,32 C30,28 60,20 100,16 C140,12 170,8 220,4 L220,40 L0,40Z"
        fill="url(#sparkGrad)"
      />
    </svg>
  )
}
