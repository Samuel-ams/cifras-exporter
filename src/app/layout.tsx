import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Cifras',
  description: 'Sua coleção de cifras musicais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ThemeProvider>
          {/* Nav */}
          <header
            style={{
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              position: 'sticky',
              top: 0,
              zIndex: 50,
            }}
          >
            <div
              style={{
                maxWidth: 960,
                margin: '0 auto',
                padding: '0 1.5rem',
                height: '3.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  color: 'var(--accent)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.03em',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Cifras
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <ThemeToggle />
                <Link
                  href="/compilacao"
                  style={{
                    textDecoration: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    padding: '0.4rem 0.75rem',
                    borderRadius: 8,
                    transition: 'color 0.15s',
                  }}
                >
                  Compilação
                </Link>
                <Link href="/nova" className="btn-accent" style={{ textDecoration: 'none' }}>
                  + Nova Cifra
                </Link>
              </div>
            </div>
          </header>

          <main style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
