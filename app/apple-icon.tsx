import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0a0a0f',
          border: '6px solid #f5a623',
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 64,
            fontWeight: 900,
            color: '#f5a623',
            letterSpacing: '-2px',
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
