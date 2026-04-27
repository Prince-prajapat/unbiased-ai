// components/Navbar.tsx — Main navigation bar with theme toggle
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavbarProps {
  userEmail?: string | null
}

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="navbar-brand">
        <img src="/logo.jpg" alt="Spectra AI" className="navbar-logo" />
        Spectra AI
      </Link>

      <div className="navbar-links">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link href="/upload" className={pathname === '/upload' ? 'active' : ''}>
          New Audit
        </Link>
      </div>

      <div className="navbar-user">
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {userEmail && <span className="user-email">{userEmail}</span>}
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}
