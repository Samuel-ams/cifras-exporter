'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Cifra } from '@/types/cifra'
import { parseRawText } from '@/lib/parser'
import { saveCifra } from '@/lib/storage'
import CifraViewer from '@/components/CifraViewer'

const PLACEHOLDER = `[Intro]
Em  G  C  D

[Verso 1]
Em              G
Esse é o primeiro verso
C               D
E esse é o segundo verso

[Refrão]
Em       G
Refrão aqui`

export default function NovaCifraPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [tone, setTone] = useState('')
  const [capo, setCapo] = useState(0)
  const [transpose, setTranspose] = useState(0)
  const [rawText, setRawText] = useState('')
  const [tab, setTab] = useState<'editor' | 'preview'>('editor')

  const lines = parseRawText(rawText)

  function handleSave() {
    if (!title.trim()) {
      alert('Digite o título da música.')
      return
    }
    const now = new Date().toISOString()
    const cifra: Cifra = {
      id: uuidv4(),
      title: title.trim(),
      artist: artist.trim(),
      tone: tone.trim(),
      capo,
      transpose,
      lines,
      rawText,
      createdAt: now,
      updatedAt: now,
    }
    saveCifra(cifra)
    router.push(`/cifra/${cifra.id}`)
  }

  return (
    <div className="fade-up">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', padding: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </button>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
        Nova Cifra
      </h1>

      {/* Meta fields */}
      <div
        className="surface"
        style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Título *
          </label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da música" className="field" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Artista
          </label>
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Nome do artista" className="field" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Tom original
          </label>
          <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Ex: Em, G, C#m" className="field" />
        </div>
      </div>

      {/* Controls */}
      <div
        className="surface"
        style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}
      >
        {/* Transpose */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transpose</span>
          <button className="counter-btn" onClick={() => setTranspose((t) => t - 1)}>−</button>
          <span style={{ width: '2.5rem', textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.95rem', color: transpose !== 0 ? 'var(--accent)' : 'var(--text)' }}>
            {transpose > 0 ? `+${transpose}` : transpose}
          </span>
          <button className="counter-btn" onClick={() => setTranspose((t) => t + 1)}>+</button>
          {transpose !== 0 && (
            <button onClick={() => setTranspose(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-faint)', textDecoration: 'underline', padding: 0 }}>
              resetar
            </button>
          )}
        </div>

        {/* Capo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capo</span>
          <select
            value={capo}
            onChange={(e) => setCapo(Number(e.target.value))}
            className="field"
            style={{ width: 'auto' }}
          >
            <option value={0}>Sem capo</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}ª casa</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: 10, width: 'fit-content' }}
      >
        {(['editor', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s ease' }}
            className={tab === t ? 'tab-active' : 'tab-inactive'}
          >
            {t === 'editor' ? 'Editor' : 'Preview'}
          </button>
        ))}
      </div>

      {tab === 'editor' ? (
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Cole aqui a cifra — linhas só com acordes (Ex: <code style={{ fontFamily: 'monospace', color: 'var(--chord)' }}>Em G C D</code>) são detectadas automaticamente.
          </p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={24}
            spellCheck={false}
            placeholder={PLACEHOLDER}
            className="field"
            style={{ display: 'block', background: 'var(--surface)' }}
          />
        </div>
      ) : (
        <CifraViewer lines={lines} transpose={transpose} capo={capo} />
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
        <button onClick={() => router.back()} className="btn-ghost">Cancelar</button>
        <button onClick={handleSave} className="btn-accent">Salvar Cifra</button>
      </div>
    </div>
  )
}
