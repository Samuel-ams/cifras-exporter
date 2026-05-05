'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Cifra } from '@/types/cifra'
import { parseRawText } from '@/lib/parser'
import { getCifra, saveCifra, deleteCifra } from '@/lib/storage'
import CifraViewer from '@/components/CifraViewer'
import AutoScrollWidget from '@/components/AutoScrollWidget'

const PdfDownloadButton = dynamic(() => import('@/components/PdfDownloadButton'), { ssr: false })

type AnnotateMode = 'color' | 'bold' | 'italic' | null

export default function CifraPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cifra, setCifra] = useState<Cifra | null>(null)
  const [editing, setEditing] = useState(false)
  const [rawText, setRawText] = useState('')
  const [annotateMode, setAnnotateMode] = useState<AnnotateMode>(null)
  const [selectedColor, setSelectedColor] = useState('#ef4444')
  const [autoScrollOpen, setAutoScrollOpen] = useState(false)

  const COLOR_PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6']

  useEffect(() => {
    const c = getCifra(id)
    if (!c) { router.replace('/'); return }
    setCifra(c)
    setRawText(c.rawText)
  }, [id, router])

  if (!cifra) return null

  function update(patch: Partial<Cifra>) {
    const updated: Cifra = { ...cifra!, ...patch, updatedAt: new Date().toISOString() }
    setCifra(updated)
    saveCifra(updated)
  }

  function handleSaveEdit() {
    update({ rawText, lines: parseRawText(rawText) })
    setEditing(false)
  }

  function handleLineClick(idx: number) {
    if (!annotateMode) return
    if (annotateMode === 'color') {
      const newColors = { ...(cifra!.lineColors ?? {}) }
      if (newColors[idx] === selectedColor) delete newColors[idx]
      else newColors[idx] = selectedColor
      update({ lineColors: newColors })
    } else {
      const newStyles = Object.fromEntries(
        Object.entries(cifra!.lineStyles ?? {}).map(([k, v]) => [Number(k), v])
      ) as Record<number, { bold?: boolean; italic?: boolean }>
      const current = newStyles[idx] ?? {}
      const updated = { ...current, [annotateMode]: !current[annotateMode as 'bold' | 'italic'] }
      if (!updated.bold && !updated.italic) delete newStyles[idx]
      else newStyles[idx] = updated
      update({ lineStyles: newStyles })
    }
  }

  function handleDelete() {
    if (!confirm('Excluir esta cifra?')) return
    deleteCifra(cifra!.id)
    router.push('/')
  }

  return (
    <>
    <div className="fade-up">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Minhas Cifras
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.2rem', lineHeight: 1.1 }}>
            {cifra.title}
          </h1>
          {cifra.artist && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>{cifra.artist}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => { if (editing) setRawText(cifra.rawText); setEditing((e) => !e) }}
            className="btn-ghost"
          >
            {editing ? 'Cancelar' : 'Editar'}
          </button>
          <PdfDownloadButton cifra={cifra} />
          <button onClick={handleDelete} className="btn-danger">Excluir</button>
        </div>
      </div>

      {/* Annotation + AutoScroll toolbar */}
      {!editing && (
        <div
          className="surface"
          style={{ padding: '0.65rem 1.25rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          {/* Color mode */}
          <button
            onClick={() => setAnnotateMode((m) => m === 'color' ? null : 'color')}
            className={annotateMode === 'color' ? 'btn-accent' : 'btn-ghost'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            title="Colorir linhas"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
            </svg>
            Cor
          </button>
          {/* Bold mode */}
          <button
            onClick={() => setAnnotateMode((m) => m === 'bold' ? null : 'bold')}
            className={annotateMode === 'bold' ? 'btn-accent' : 'btn-ghost'}
            style={{ fontWeight: 800, fontSize: '0.85rem', padding: '0.3rem 0.65rem', fontFamily: 'serif' }}
            title="Negrito em linhas"
          >
            B
          </button>
          {/* Italic mode */}
          <button
            onClick={() => setAnnotateMode((m) => m === 'italic' ? null : 'italic')}
            className={annotateMode === 'italic' ? 'btn-accent' : 'btn-ghost'}
            style={{ fontStyle: 'italic', fontSize: '0.85rem', padding: '0.3rem 0.65rem', fontFamily: 'serif' }}
            title="Itálico em linhas"
          >
            I
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.25rem' }} />
          {/* Color swatches (only visible in color mode) */}
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { setSelectedColor(c); setAnnotateMode('color') }}
              title={c}
              style={{
                width: 22, height: 22, borderRadius: '50%', background: c,
                border: selectedColor === c && annotateMode === 'color' ? '2.5px solid var(--text)' : '2px solid transparent',
                cursor: 'pointer', boxShadow: '0 0 0 1px var(--border)', flexShrink: 0,
              }}
            />
          ))}
          <label title="Cor personalizada" style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: COLOR_PALETTE.includes(selectedColor) ? 'var(--surface-2)' : selectedColor,
              border: !COLOR_PALETTE.includes(selectedColor) && annotateMode === 'color' ? '2.5px solid var(--text)' : '2px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
            }}>
              {(COLOR_PALETTE.includes(selectedColor) || annotateMode !== 'color') ? '+' : null}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => { setSelectedColor(e.target.value); setAnnotateMode('color') }}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
            />
          </label>
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.25rem' }} />
          {/* Auto Scroll */}
          <button
            onClick={() => setAutoScrollOpen((o) => !o)}
            className={autoScrollOpen ? 'btn-accent' : 'btn-ghost'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            title="Auto Scroll"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/>
            </svg>
            Auto Scroll
          </button>
          {(Object.keys(cifra.lineColors ?? {}).length > 0 || Object.keys(cifra.lineStyles ?? {}).length > 0) && (
            <button
              onClick={() => update({ lineColors: {}, lineStyles: {} })}
              style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Limpar formatação
            </button>
          )}
        </div>
      )}

      {/* Controls bar (view mode) */}
      {!editing && (
        <div
          className="surface"
          style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}
        >
          {/* Transpose */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transpose</span>
            <button className="counter-btn" onClick={() => update({ transpose: cifra.transpose - 1 })}>−</button>
            <span style={{ width: '2.5rem', textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.95rem', color: cifra.transpose !== 0 ? 'var(--accent)' : 'var(--text)' }}>
              {cifra.transpose > 0 ? `+${cifra.transpose}` : cifra.transpose}
            </span>
            <button className="counter-btn" onClick={() => update({ transpose: cifra.transpose + 1 })}>+</button>
            {cifra.transpose !== 0 && (
              <button onClick={() => update({ transpose: 0 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-faint)', textDecoration: 'underline', padding: 0 }}>
                resetar
              </button>
            )}
          </div>

          {/* Capo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capo</span>
            <select
              value={cifra.capo}
              onChange={(e) => update({ capo: Number(e.target.value) })}
              className="field"
              style={{ width: 'auto' }}
            >
              <option value={0}>Sem capo</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}ª casa</option>
              ))}
            </select>
          </div>

          {/* Current tone */}
          {cifra.tone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Tom original:</span>
              <span className="pill pill-accent">{cifra.tone}</span>
              {cifra.transpose !== 0 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                  ({cifra.transpose > 0 ? '+' : ''}{cifra.transpose} semi)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit mode */}
      {editing ? (
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Edite o texto da cifra — linhas só com acordes são detectadas automaticamente.
          </p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={30}
            spellCheck={false}
            className="field"
            style={{ display: 'block', background: 'var(--surface)' }}
          />
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
            <button onClick={() => { setRawText(cifra.rawText); setEditing(false) }} className="btn-ghost">Cancelar</button>
            <button onClick={handleSaveEdit} className="btn-accent">Salvar</button>
          </div>
        </div>
      ) : (
        <CifraViewer
          lines={cifra.lines}
          transpose={cifra.transpose}
          capo={cifra.capo}
          lineColors={cifra.lineColors}
          lineStyles={cifra.lineStyles}
          annotateMode={annotateMode}
          selectedColor={selectedColor}
          onLineClick={handleLineClick}
        />
      )}
    </div>
    {autoScrollOpen && <AutoScrollWidget onClose={() => setAutoScrollOpen(false)} />}
    </>
  )
}