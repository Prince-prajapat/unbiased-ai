// components/charts/OutcomeRateChart.tsx — Theme-aware bar chart for group outcome rates
'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface GroupRate {
  total: number
  positive: number
  rate: number
}

interface OutcomeRateChartProps {
  groupRates: Record<string, GroupRate>
  sensitiveAttr: string
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function useTheme() {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

export default function OutcomeRateChart({ groupRates, sensitiveAttr }: OutcomeRateChartProps) {
  const isDark = useTheme()

  if (!groupRates || Object.keys(groupRates).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No group rate data available
      </div>
    )
  }

  const data = Object.entries(groupRates).map(([group, rates]) => ({
    group,
    rate: Math.round((rates.rate || 0) * 100),
    total: rates.total || 0,
    positive: rates.positive || 0,
  }))

  const tickColor = isDark ? '#94a3b8' : '#475569'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const axisColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="group"
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={{ stroke: axisColor }}
        />
        <YAxis
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={{ stroke: axisColor }}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '8px',
            color: isDark ? '#f1f5f9' : '#0f172a',
          }}
          formatter={(value: number) => [`${value}%`, 'Positive Rate']}
        />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
