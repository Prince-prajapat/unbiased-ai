// app/layout.tsx — Root Layout
// TODO: Implement in next phase

/**
 * Root layout wrapping all pages.
 * Responsibilities:
 *  - Load Google Fonts (Inter)
 *  - Provide Firebase Auth context
 *  - Global navigation bar
 *  - Toast notification provider
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
