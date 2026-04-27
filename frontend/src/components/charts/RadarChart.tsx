// components/charts/RadarChart.tsx — Visual Fairness Scorecard (replaces radar)
'use client'

interface RadarMetric {
  name: string
  score: number
}

interface FairnessRadarChartProps {
  metrics: RadarMetric[]
}

const FULL_NAMES: Record<string, string> = {
  'Equal': 'Equal Treatment',
  'Data': 'Data Balance',
  'Fair': 'Fair Selection',
}

const ICONS: Record<string, string> = {
  'Equal': '⚖️',
  'Data': '🔄',
  'Fair': '📊',
}

function getStatus(score: number) {
  if (score >= 75) return { label: 'Fair', color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
  if (score >= 50) return { label: 'Needs Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Unfair', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

export default function FairnessRadarChart({ metrics }: FairnessRadarChartProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No metric data available
      </div>
    )
  }

  // Use names directly (full names are passed from the report page)
  const uniqueMetrics = metrics.map(m => ({
    ...m,
    displayName: m.name,
  }))

  const avg = Math.round(metrics.reduce((a, m) => a + m.score, 0) / metrics.length)
  const overallStatus = getStatus(avg)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      
      {/* Overall score */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', padding: '0.75rem 1rem',
        background: overallStatus.bg,
        borderRadius: '12px',
        border: `1px solid ${overallStatus.color}33`,
      }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: overallStatus.color }}>
          {avg}
        </span>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average Score
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: overallStatus.color }}>
            {overallStatus.label}
          </div>
        </div>
      </div>

      {/* Individual metric bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {uniqueMetrics.map((m, i) => {
          const status = getStatus(m.score)
          const icon = ICONS[m.name] || '📈'
          return (
            <div key={i}>
              {/* Label row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '0.4rem',
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {icon} {m.displayName}
                </span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, color: status.color,
                  background: status.bg,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '99px',
                }}>
                  {m.score} · {status.label}
                </span>
              </div>
              
              {/* Progress bar */}
              <div style={{
                width: '100%', height: '10px',
                background: 'var(--bg-glass)',
                borderRadius: '99px',
                overflow: 'hidden',
                border: '1px solid var(--border-glass)',
              }}>
                <div style={{
                  width: `${Math.min(m.score, 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${status.color}cc, ${status.color})`,
                  borderRadius: '99px',
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1.25rem',
        paddingTop: '0.25rem', flexWrap: 'wrap',
      }}>
        {[
          { label: '75–100 Fair', color: '#10b981' },
          { label: '50–74 Review', color: '#f59e0b' },
          { label: '0–49 Unfair', color: '#ef4444' },
        ].map(g => (
          <div key={g.label} style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.68rem', color: 'var(--text-muted)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
            {g.label}
          </div>
        ))}
      </div>
    </div>
  )
}
