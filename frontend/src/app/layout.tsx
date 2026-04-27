// app/layout.tsx — Root Layout
import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spectra AI — Bias Detection & Fairness Audit Platform',
  description: 'Vigilance. Fairness. Innovation. Detect and mitigate bias in AI models using Fairlearn metrics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
