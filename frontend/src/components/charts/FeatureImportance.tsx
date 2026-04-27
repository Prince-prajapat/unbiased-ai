// components/charts/FeatureImportance.tsx — Horizontal bar chart for feature importance
'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface Feature {
  name: string
  importance: number
}

interface FeatureImportanceChartProps {
  features: Feature[]
}

export default function FeatureImportanceChart({ features }: FeatureImportanceChartProps) {
  if (!features || features.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No feature importance data available
      </div>
    )
  }

  const sorted = [...features].sort((a, b) => b.importance - a.importance)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 10, bottom: 10, left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          type="number"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          domain={[0, 1]}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
        />
        <Bar dataKey="importance" fill="#06b6d4" radius={[0, 6, 6, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
