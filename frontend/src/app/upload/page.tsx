// app/upload/page.tsx — CSV Upload Page
'use client'

import { useEffect, useState, useRef, DragEvent } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [datasetFile, setDatasetFile] = useState<File | null>(null)
  const [predictionsFile, setPredictionsFile] = useState<File | null>(null)
  const [sensitiveAttr, setSensitiveAttr] = useState('')
  const [outcomeCol, setOutcomeCol] = useState('')
  const [datasetName, setDatasetName] = useState('')
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOverDataset, setDragOverDataset] = useState(false)
  const [dragOverPredictions, setDragOverPredictions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/'); return }
      setUser(u)
    })
    return unsub
  }, [router])

  // Parse columns from CSV header
  const parseColumns = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const firstLine = text.split('\n')[0]
      if (firstLine) {
        const cols = firstLine.split(',').map(c => c.trim().replace(/['"]/g, ''))
        setColumns(cols)
      }
    }
    reader.readAsText(file)
  }

  const handleDatasetFile = (file: File) => {
    setDatasetFile(file)
    parseColumns(file)
  }

  const handleDrop = (setter: (f: File) => void, setDrag: (b: boolean) => void) =>
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDrag(false)
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.csv')) {
        setter(file)
        if (setter === handleDatasetFile) parseColumns(file)
      }
    }

  const handleSubmit = async () => {
    if (!datasetFile || !predictionsFile || !sensitiveAttr || !outcomeCol) {
      setError('Please fill in all required fields.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = user ? await user.getIdToken() : ''
      const formData = new FormData()
      formData.append('dataset', datasetFile)
      formData.append('predictions', predictionsFile)
      formData.append('sensitive_attribute', sensitiveAttr)
      formData.append('outcome_column', outcomeCol)
      if (datasetName) formData.append('dataset_name', datasetName)

      const res = await fetch(`${API}/audit/`, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()

      if (data.report_id) {
        router.push(`/reports/${data.report_id}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err?.message || 'Audit failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <>
      <Navbar userEmail={user?.email} />
      <div className="page-container">
        <div className="page-header animate-in">
          <h1>New Fairness Audit</h1>
          <p>Upload your dataset and model predictions to analyse for bias</p>
        </div>

        {error && <div className="form-error animate-in">{error}</div>}

        <div className="upload-layout">
          {/* Dataset Upload */}
          <div
            className={`upload-zone ${datasetFile ? 'has-file' : ''} ${dragOverDataset ? 'drag-over' : ''} animate-in`}
            onDragOver={(e) => { e.preventDefault(); setDragOverDataset(true) }}
            onDragLeave={() => setDragOverDataset(false)}
            onDrop={handleDrop(handleDatasetFile, setDragOverDataset)}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleDatasetFile(e.target.files[0])}
            />
            {datasetFile ? (
              <>
                <div className="upload-icon">✅</div>
                <div className="file-info">
                  📄 {datasetFile.name} ({formatSize(datasetFile.size)})
                </div>
              </>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <div className="upload-title">Dataset CSV</div>
                <div className="upload-desc">
                  Drag &amp; drop or click to upload<br />
                  Features + actual labels
                </div>
              </>
            )}
          </div>

          {/* Predictions Upload */}
          <div
            className={`upload-zone ${predictionsFile ? 'has-file' : ''} ${dragOverPredictions ? 'drag-over' : ''} animate-in`}
            onDragOver={(e) => { e.preventDefault(); setDragOverPredictions(true) }}
            onDragLeave={() => setDragOverPredictions(false)}
            onDrop={handleDrop((f) => setPredictionsFile(f), setDragOverPredictions)}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && setPredictionsFile(e.target.files[0])}
            />
            {predictionsFile ? (
              <>
                <div className="upload-icon">✅</div>
                <div className="file-info">
                  📄 {predictionsFile.name} ({formatSize(predictionsFile.size)})
                </div>
              </>
            ) : (
              <>
                <div className="upload-icon">🤖</div>
                <div className="upload-title">Predictions CSV</div>
                <div className="upload-desc">
                  Drag &amp; drop or click to upload<br />
                  Model predicted column
                </div>
              </>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="glass-card config-section animate-in" style={{ padding: '1.5rem' }}>
          <h2>⚙️ Audit Configuration</h2>

          <div className="config-grid">
            <div className="form-group">
              <label htmlFor="dataset-name">Name Your Audit (optional)</label>
              <span className="form-hint">Give this audit a name so you can find it later</span>
              <input
                id="dataset-name"
                type="text"
                placeholder="e.g. Hiring Model Q4 2025"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sensitive-attr">Group to Check for Bias</label>
              <span className="form-hint">
                Which column represents the group you want to check? (e.g. gender, race, age)
              </span>
              {columns.length > 0 ? (
                <select
                  id="sensitive-attr"
                  value={sensitiveAttr}
                  onChange={(e) => setSensitiveAttr(e.target.value)}
                >
                  <option value="">Select column…</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="sensitive-attr"
                  type="text"
                  placeholder="e.g. gender, race, age_group"
                  value={sensitiveAttr}
                  onChange={(e) => setSensitiveAttr(e.target.value)}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="outcome-col">Decision Column</label>
              <span className="form-hint">
                Which column has the actual decision or outcome? (e.g. hired, approved, admitted)
              </span>
              {columns.length > 0 ? (
                <select
                  id="outcome-col"
                  value={outcomeCol}
                  onChange={(e) => setOutcomeCol(e.target.value)}
                >
                  <option value="">Select column…</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="outcome-col"
                  type="text"
                  placeholder="e.g. hired, approved"
                  value={outcomeCol}
                  onChange={(e) => setOutcomeCol(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="submit-section animate-in">
          <button
            className="btn-audit"
            onClick={handleSubmit}
            disabled={loading || !datasetFile || !predictionsFile || !sensitiveAttr || !outcomeCol}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, marginBottom: 0, borderWidth: 2 }} />
                Analysing…
              </>
            ) : (
              <>🔍 Run Fairness Audit</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
