'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cifra } from '@/types/cifra'
import { getAllCifras, deleteCifra } from '@/lib/storage'

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
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { setCifras(getAllCifras()) }, [])

  const filtered = cifras.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.artist.toLowerCase().includes(search.toLowerCase()),
  )

  function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    if (!confirm('Excluir esta cifra?')) return
    deleteCifra(id)
    setCifras(getAllCifras())
  }

  if (cifras.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="hero-gradient" style={{ paddingBottom: '2rem' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Nenhuma cifra ainda
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Cole uma cifra do CifrasClub ou escreva do zero com seus acordes certos.
          </p>
          <Link href="/nova" className="btn-accent" style={{ textDecoration: 'none', padding: '0.75rem 2rem', fontSize: '1rem' }}>
            + Adicionar Cifra
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.15rem' }}>
            Minhas Cifras
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {cifras.length} {cifras.length === 1 ? 'cifra salva' : 'cifras salvas'}
          </p>
        </div>

        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar música ou artista..."
          className="field"
          style={{ maxWidth: 280 }}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
          Nenhuma cifra encontrada para "{search}".
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((cifra) => (
            <Link
              key={cifra.id}
              href={`/cifra/${cifra.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <article
                className="surface"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                {/* Icon + title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cifra.title}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cifra.artist || '—'}
                    </p>
                  </div>
                </div>

                {/* Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {cifra.tone && <span className="pill pill-accent">Tom: {cifra.tone}</span>}
                  {cifra.capo > 0 && <span className="pill pill-capo">Capo {cifra.capo}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                    {timeAgo(cifra.updatedAt)}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, cifra.id)}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    lineHeight: 1,
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--danger)'
                    ;(e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--danger) 10%, transparent)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
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
