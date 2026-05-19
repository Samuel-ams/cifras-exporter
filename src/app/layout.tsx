import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { ThemeProvider } from '@/views/ThemeProvider'
import { ConfirmProvider } from '@/views/ConfirmModal'
import ThemeToggle from '@/views/ThemeToggle'

export const metadata: Metadata = {
    title: 'Cifras',
    description: 'Sua coleção de cifras musicais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
            <body suppressHydrationWarning>
                <ThemeProvider>
                    <ConfirmProvider>
                    {/* Nav */}
                    <header className="bg-surface border-b border-border sticky top-0 z-50">
                        <div className="max-w-240 mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-accent font-extrabold text-xl tracking-[-0.03em] no-underline"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="18" cy="16" r="3" />
                                </svg>
                                Cifras
                            </Link>

                            <div className="flex items-center gap-2.5">
                                <ThemeToggle />
                                <Link
                                    href="/playlist"
                                    className="inline-block text-muted text-sm font-medium px-3 py-1.5 rounded-lg no-underline transition-colors hover:text-text"
                                >
                                    Playlists
                                </Link>
                                <Link
                                    href="/nova" 
                                    className="btn-accent no-underline">
                                    + Nova Cifra
                                </Link>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-240 mx-auto px-4 sm:px-6 py-8 sm:py-10">
                        {children}
                    </main>
                    </ConfirmProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
