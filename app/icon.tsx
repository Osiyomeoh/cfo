import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0a0a0f',
          border: '1.5px solid #f5a623',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 900,
            color: '#f5a623',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}
        >
          CFO
        </span>
      </div>
    ),
    { ...size },
  )
}
