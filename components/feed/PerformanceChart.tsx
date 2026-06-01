'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: { date: string; value: number }[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip animate-fadeIn">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__value">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function PerformanceChart({ data }: Props) {
  return (
    <div className="chart-fade w-full" style={{ height: 160, minHeight: 160 }}>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c896" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#00c896" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,0,0,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#8888a0', fontFamily: 'Syne, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8888a0', fontFamily: 'Syne, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${Math.round(v / 1000)}k`}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00c896"
            strokeWidth={2}
            fill="url(#chartGrad)"
            dot={{ fill: '#00c896', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#00c896', strokeWidth: 0 }}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
