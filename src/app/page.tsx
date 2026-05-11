'use client'

import Link from 'next/link'
import { useHomeController } from '@/controllers/useHomeController'

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'agora'
    if (m < 60) return `${m}min atrás`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h atrás`
    return `${Math.floor(h / 24)}d atrás`
}

export default function HomePage() {
    const { cifras, filtered, search, setSearch, handleDelete } = useHomeController()

    if (cifras.length === 0) {
        return (
            <div className="fade-up text-center py-20 px-4">
                <div className="pb-8">
                    <div className="w-18 h-18 rounded-[20px] bg-accent/12 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                        </svg>
                    </div>
                    <h1 className="text-[1.75rem] font-extrabold mb-2 tracking-[-0.03em]">
                        Nenhuma cifra ainda
                    </h1>
                    <p className="text-muted mb-8 text-[0.95rem]">
                        Cole uma cifra do CifrasClub ou escreva do zero com seus acordes certos.
                    </p>
                    <Link href="/nova" className="btn-accent no-underline py-3 px-8 text-base">
                        + Adicionar Cifra
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="fade-up">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-[-0.03em] mb-0.5">
                        Minhas Cifras
                    </h1>
                    <p className="text-muted text-[0.85rem]">
                        {cifras.length} {cifras.length === 1 ? 'cifra salva' : 'cifras salvas'}
                    </p>
                </div>

                {/* Search */}
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar música ou artista..."
                    className="field sm:max-w-70"
                />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <p className="text-muted text-center py-12">Nenhuma cifra encontrada para &ldquo;{search}&rdquo;.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((cifra) => (
                        <Link
                            key={cifra.id}
                            href={`/cifra/${cifra.id}`}
                            className="no-underline block"
                        >
                            <article
                                className="surface p-5 cursor-pointer relative transition-all duration-200 hover:shadow-(--shadow-md) hover:-translate-y-0.5"
                            >
                                {/* Icon + title */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-9.5 h-9.5 rounded-[10px] bg-accent/10 flex items-center justify-center shrink-0">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18V5l12-2v13" />
                                            <circle cx="6" cy="18" r="3" />
                                            <circle cx="18" cy="16" r="3" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-[0.95rem] text-text whitespace-nowrap overflow-hidden text-ellipsis">
                                            {cifra.title}
                                        </p>
                                        <p className="text-xs text-muted whitespace-nowrap overflow-hidden text-ellipsis">
                                            {cifra.artist || '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Pills */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {cifra.tone && <span className="pill pill-accent">Tom: {cifra.tone}</span>}
                                    {cifra.capo > 0 && <span className="pill pill-capo">Capo {cifra.capo}</span>}
                                    <span className="ml-auto text-[0.72rem] text-faint">
                                        {timeAgo(cifra.updatedAt)}
                                    </span>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDelete(e, cifra.id)}
                                    className="absolute top-3 right-3 w-6.5 h-6.5 rounded-md border-none bg-transparent text-faint cursor-pointer flex items-center justify-center text-base leading-none transition-colors hover:text-danger hover:bg-danger/10"
                                    aria-label="Excluir cifra"
                                >
                                    ×
                                </button>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
