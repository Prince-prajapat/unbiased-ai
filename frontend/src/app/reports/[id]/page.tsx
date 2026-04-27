// app/reports/[id]/page.tsx — Individual Audit Report
'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BiasMetricCard from '@/components/BiasMetricCard'

import OutcomeRateChart from '@/components/charts/OutcomeRateChart'
import FairnessRadarChart from '@/components/charts/RadarChart'
import FeatureImportanceChart from '@/components/charts/FeatureImportance'

interface ReportData {
  id: string
  dataset_name: string
  sensitive_attribute: string
  outcome_column: string
  fairness_score: number
  risk_level: string
  created_at: string
  metrics: Record<string, any>
  group_rates: Record<string, any>
  gemini: {
    explanation: string
    recommendations: string[]
  }
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/'); return }
      setUser(u)
      fetchReport(params.id)
    })
    return unsub
  }, [params.id, router])

  const fetchReport = async (id: string) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/reports/${id}`)
      const data = await res.json()
      setReport(data)
    } catch (err) {
      console.error('Failed to fetch report:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-green)'
    if (score >= 50) return 'var(--accent-amber)'
    return 'var(--accent-red)'
  }

  const circumference = 2 * Math.PI * 65

  if (loading) {
    return (
      <>
        <Navbar userEmail={user?.email} />
        <div className="page-container">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading report…</p>
          </div>
        </div>
      </>
    )
  }

  if (!report || !report.metrics) {
    return (
      <>
        <Navbar userEmail={user?.email} />
        <div className="page-container">
          <div className="glass-card empty-state">
            <div className="empty-icon">📋</div>
            <h3>Report Not Found</h3>
            <p>This audit report doesn&apos;t exist or hasn&apos;t been generated yet.</p>
          </div>
        </div>
      </>
    )
  }

  const score = report.fairness_score || 0
  const offset = circumference - (score / 100) * circumference

  // Build metric cards from the report
  const metricConfigs = [
    {
      name: 'Equal Treatment',
      key: 'demographic_parity_difference',
      icon: '⚖️',
      getDesc: (v: number) => {
        const pct = (Math.abs(v) * 100).toFixed(1)
        if (Math.abs(v) <= 0.1) return `Groups are treated almost equally — only ${pct}% difference in outcomes.`
        if (Math.abs(v) <= 0.2) return `There's a ${pct}% gap in how different groups are treated. Some bias may exist.`
        return `There's a ${pct}% gap in outcomes between groups — one group is significantly favoured.`
      },
    },
    {
      name: 'Equal Accuracy',
      key: 'equalized_odds_difference',
      icon: '🎯',
      getDesc: (v: number) => {
        const pct = (Math.abs(v) * 100).toFixed(1)
        if (Math.abs(v) <= 0.1) return `The model predicts correctly at similar rates across groups (${pct}% difference).`
        if (Math.abs(v) <= 0.2) return `The model is ${pct}% more accurate for some groups than others.`
        return `The model is ${pct}% more accurate for one group — it works better for some people than others.`
      },
    },
    {
      name: 'Fair Selection Rate',
      key: 'disparate_impact_ratio',
      icon: '📊',
      getDesc: (v: number) => {
        const pct = (v * 100).toFixed(0)
        if (v >= 0.8 && v <= 1.25) return `Groups are selected at similar rates (${pct}% ratio). This is considered fair.`
        if (v >= 0.6) return `One group is selected ${pct}% as often as another. Some disparity exists.`
        return `One group is selected only ${pct}% as often as another — a major disparity.`
      },
    },
    {
      name: 'Data Balance',
      key: 'class_imbalance',
      icon: '🔄',
      getDesc: (v: number) => {
        const clamped = Math.min(Math.abs(v), 1)
        const pct = (clamped * 100).toFixed(0)
        if (clamped <= 0.2) return `Your dataset is well-balanced — outcomes are distributed fairly evenly.`
        if (clamped <= 0.5) return `Your dataset is somewhat unbalanced (${pct}% skew). This can affect fairness.`
        return `Your dataset is heavily skewed (${pct}% imbalanced). Consider rebalancing your training data.`
      },
    },
  ]

  const metricCards = metricConfigs.map(mc => {
    const val = report.metrics[mc.key]
    const numVal = typeof val === 'number' ? val : 0
    const absVal = Math.abs(numVal)
    let severity: 'safe' | 'warning' | 'danger' = 'safe'
    if (mc.key === 'disparate_impact_ratio') {
      severity = absVal >= 0.8 && absVal <= 1.25 ? 'safe' : absVal >= 0.6 ? 'warning' : 'danger'
    } else if (mc.key === 'class_imbalance') {
      const clamped = Math.min(absVal, 1)
      severity = clamped <= 0.2 ? 'safe' : clamped <= 0.5 ? 'warning' : 'danger'
    } else {
      severity = absVal <= 0.1 ? 'safe' : absVal <= 0.2 ? 'warning' : 'danger'
    }

    // Display values
    let display: string
    if (mc.key === 'disparate_impact_ratio') {
      display = `${(numVal * 100).toFixed(0)}%`
    } else if (mc.key === 'class_imbalance') {
      display = `${(Math.min(absVal, 1) * 100).toFixed(0)}%`
    } else {
      display = `${(absVal * 100).toFixed(1)}%`
    }

    return {
      name: mc.name,
      value: numVal,
      display,
      severity,
      description: mc.getDesc(numVal),
      icon: mc.icon,
      label: severity === 'safe' ? '✓ Fair' : severity === 'warning' ? '⚠ Needs Review' : '✗ Unfair',
      color: severity === 'safe' ? 'var(--accent-green)' : severity === 'warning' ? 'var(--accent-amber)' : 'var(--accent-red)',
    }
  })

  // Scorecard data
  const radarData = metricCards.map(m => ({
    name: m.name,
    score: m.severity === 'safe' ? 90 : m.severity === 'warning' ? 60 : 30,
  }))

  return (
    <>
      <Navbar userEmail={user?.email} />
      <div className="page-container">
        {/* Hero Section */}
        <div className="glass-card report-hero animate-in">
          <div className="fairness-ring">
            <svg viewBox="0 0 160 160">
              <circle className="ring-bg" cx="80" cy="80" r="65" />
              <circle
                className="ring-progress"
                cx="80" cy="80" r="65"
                stroke={getScoreColor(score)}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div className="ring-value" style={{ color: getScoreColor(score) }}>{score}</div>
              <div className="ring-label">Fairness Score</div>
            </div>
          </div>

          <div className="report-hero-info">
            <h1>{report.dataset_name || 'Audit Report'}</h1>
            <span className={`risk-tag ${report.risk_level?.toLowerCase()}`}>
              {report.risk_level} Risk
            </span>
            <div className="report-details">
              <div className="detail-item">
                <strong>Bias Checked For:</strong> {report.sensitive_attribute}
              </div>
              <div className="detail-item">
                <strong>Decision Column:</strong> {report.outcome_column}
              </div>
              <div className="detail-item">
                <strong>Analysed:</strong> {new Date(report.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="report-grid">
          {metricCards.map((metric, i) => (
            <BiasMetricCard key={i} {...metric} />
          ))}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="glass-card chart-wrapper animate-in">
            <h3>📊 Outcome Rates by Group</h3>
            <OutcomeRateChart
              groupRates={report.group_rates}
              sensitiveAttr={report.sensitive_attribute}
            />
          </div>
          <div className="glass-card chart-wrapper animate-in">
            <h3>🎯 Fairness Overview</h3>
            <FairnessRadarChart metrics={radarData} />
          </div>
        </div>


      </div>
    </>
  )
}
