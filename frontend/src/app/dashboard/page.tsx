// app/dashboard/page.tsx — Main Dashboard
'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface AuditReport {
  id: string
  dataset_name: string
  sensitive_attribute: string
  fairness_score: number
  risk_level: string
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<AuditReport[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push('/')
        return
      }
      setUser(u)
      fetchReports(u)
    })
    return unsub
  }, [router])

  const fetchReports = async (u: User) => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = await u.getIdToken()
      const res = await fetch(`${API}/reports/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setReports(data.reports || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskClass = (risk: string) => {
    const r = risk?.toLowerCase()
    if (r === 'low') return 'low'
    if (r === 'moderate') return 'moderate'
    return 'high'
  }

  const getSeverityClass = (score: number) => {
    if (score >= 80) return 'safe'
    if (score >= 50) return 'warning'
    return 'danger'
  }

  if (loading) {
    return (
      <>
        <Navbar userEmail={user?.email} />
        <div className="page-container">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading dashboard…</p>
          </div>
        </div>
      </>
    )
  }

  const totalAudits = reports.length
  const avgScore = totalAudits > 0
    ? Math.round(reports.reduce((s, r) => s + (r.fairness_score || 0), 0) / totalAudits)
    : 0
  const highRisk = reports.filter(r => r.risk_level?.toLowerCase() === 'high').length

  return (
    <>
      <Navbar userEmail={user?.email} />
      <div className="page-container">
        <div className="dashboard-header">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Monitor your AI models for bias and fairness</p>
          </div>
          <Link href="/upload" className="btn-new-audit">
            ＋ New Audit
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="glass-card stat-card animate-in">
            <div className="stat-label">Total Audits</div>
            <div className="stat-value blue">{totalAudits}</div>
          </div>
          <div className="glass-card stat-card animate-in">
            <div className="stat-label">Avg Fairness Score</div>
            <div className={`stat-value ${avgScore >= 80 ? 'green' : avgScore >= 50 ? 'amber' : 'red'}`}>
              {avgScore}%
            </div>
          </div>
          <div className="glass-card stat-card animate-in">
            <div className="stat-label">High Risk Models</div>
            <div className={`stat-value ${highRisk > 0 ? 'red' : 'green'}`}>{highRisk}</div>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="glass-card empty-state animate-in">
            <div className="empty-icon">📊</div>
            <h3>No audit reports yet</h3>
            <p>Upload a dataset and model predictions to run your first fairness audit.</p>
            <Link href="/upload" className="btn-new-audit">
              ＋ Run Your First Audit
            </Link>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={`glass-card report-card risk-${getRiskClass(report.risk_level)} animate-in`}>
                  <div className="report-name">{report.dataset_name || 'Untitled Audit'}</div>
                  <div className="report-meta">
                    <span>🔒 {report.sensitive_attribute}</span>
                    <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="report-footer">
                    <span className={`score-badge ${getSeverityClass(report.fairness_score)}`}>
                      {report.fairness_score}% Fair
                    </span>
                    <span className={`risk-tag ${getRiskClass(report.risk_level)}`}>
                      {report.risk_level} Risk
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
