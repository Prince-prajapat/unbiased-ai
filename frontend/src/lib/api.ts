// lib/api.ts — Backend API Client
// TODO: Implement in next phase

/**
 * HTTP client for communicating with the FastAPI backend.
 *
 * Functions to implement:
 *  - runAudit(formData, token)       → POST /audit
 *  - getReports(token)               → GET /reports
 *  - getReport(id, token)            → GET /reports/:id
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function runAudit(formData: FormData, token: string) {
  // TODO: implement
  const res = await fetch(`${API_URL}/audit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return res.json()
}

export async function getReports(token: string) {
  // TODO: implement
  const res = await fetch(`${API_URL}/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getReport(id: string, token: string) {
  // TODO: implement
  const res = await fetch(`${API_URL}/reports/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}
