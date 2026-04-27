// components/BiasMetricCard.tsx — Displays a single fairness metric
'use client'

export interface BiasMetricCardProps {
  name: string
  value: number
  display: string
  severity: 'safe' | 'warning' | 'danger'
  description: string
  icon: string
  label: string
  color: string
}

export default function BiasMetricCard({
  name, display, severity, description, icon, label,
}: BiasMetricCardProps) {
  return (
    <div className={`glass-card metric-card ${severity} animate-in`}>
      <div className="metric-header">
        <div className="metric-icon">{icon}</div>
        <span className={`score-badge ${severity}`}>{label}</span>
      </div>
      <div className="metric-name">{name}</div>
      <div className="metric-value">{display}</div>
      <div className="metric-desc">{description}</div>
    </div>
  )
}
