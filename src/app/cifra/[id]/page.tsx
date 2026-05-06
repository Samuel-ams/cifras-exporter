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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push('/')}
            className="bg-transparent border-none cursor-pointer text-muted text-[0.82rem] p-0 mb-2 flex items-center gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Minhas Cifras
          </button>
          <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] mb-0.5 leading-tight">
            {cifra.title}
          </h1>
          {cifra.artist && (
            <p className="text-muted text-base font-medium">{cifra.artist}</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
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
        <div className="surface px-5 py-2.5 mb-3 flex gap-2 items-center flex-wrap overflow-x-auto">
          {/* Color mode */}
          <button
            onClick={() => setAnnotateMode((m) => m === 'color' ? null : 'color')}
            className={`${annotateMode === 'color' ? 'btn-accent' : 'btn-ghost'} flex items-center gap-1.5 text-xs px-2.5 py-1.5`}
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
            className={`${annotateMode === 'bold' ? 'btn-accent' : 'btn-ghost'} font-black text-sm px-2.5 py-1.5 font-serif`}
            title="Negrito em linhas"
          >
            B
          </button>
          {/* Italic mode */}
          <button
            onClick={() => setAnnotateMode((m) => m === 'italic' ? null : 'italic')}
            className={`${annotateMode === 'italic' ? 'btn-accent' : 'btn-ghost'} italic text-sm px-2.5 py-1.5 font-serif`}
            title="Itálico em linhas"
          >
            I
          </button>
          <div className="w-px h-5 bg-border mx-1" />
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
          <label title="Cor personalizada" className="relative cursor-pointer shrink-0">
            <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs text-muted overflow-hidden" style={{
              background: COLOR_PALETTE.includes(selectedColor) ? 'var(--surface-2)' : selectedColor,
              border: !COLOR_PALETTE.includes(selectedColor) && annotateMode === 'color' ? '2.5px solid var(--text)' : '2px dashed var(--border)',
            }}>
              {(COLOR_PALETTE.includes(selectedColor) || annotateMode !== 'color') ? '+' : null}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => { setSelectedColor(e.target.value); setAnnotateMode('color') }}
              className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
            />
          </label>
          <div className="w-px h-5 bg-border mx-1" />
          {/* Auto Scroll */}
          <button
            onClick={() => setAutoScrollOpen((o) => !o)}
            className={`${autoScrollOpen ? 'btn-accent' : 'btn-ghost'} flex items-center gap-1.5 text-xs px-2.5 py-1.5`}
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
              className="ml-auto text-[0.78rem] text-faint bg-transparent border-none cursor-pointer underline p-0 shrink-0"
            >
              Limpar formatação
            </button>
          )}
        </div>
      )}

      {/* Controls bar (view mode) */}
      {!editing && (
        <div className="surface px-6 py-4 mb-6 flex flex-wrap gap-6 items-center">
          {/* Transpose */}
          <div className="flex items-center gap-2.5">
            <span className="text-[0.82rem] font-semibold text-muted uppercase tracking-[0.06em]">Transpose</span>
            <button className="counter-btn" onClick={() => update({ transpose: cifra.transpose - 1 })}>−</button>
            <span className={`w-10 text-center font-bold tabular-nums text-[0.95rem] ${cifra.transpose !== 0 ? 'text-accent' : 'text-text'}`}>
              {cifra.transpose > 0 ? `+${cifra.transpose}` : cifra.transpose}
            </span>
            <button className="counter-btn" onClick={() => update({ transpose: cifra.transpose + 1 })}>+</button>
            {cifra.transpose !== 0 && (
              <button onClick={() => update({ transpose: 0 })} className="bg-transparent border-none cursor-pointer text-xs text-faint underline p-0">
                resetar
              </button>
            )}
          </div>

          {/* Capo */}
          <div className="flex items-center gap-2.5">
            <span className="text-[0.82rem] font-semibold text-muted uppercase tracking-[0.06em]">Capo</span>
            <select
              value={cifra.capo}
              onChange={(e) => update({ capo: Number(e.target.value) })}
              className="field w-auto"
            >
              <option value={0}>Sem capo</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}ª casa</option>
              ))}
            </select>
          </div>

          {/* Current tone */}
          {cifra.tone && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[0.78rem] text-faint">Tom original:</span>
              <span className="pill pill-accent">{cifra.tone}</span>
              {cifra.transpose !== 0 && (
                <span className="text-[0.72rem] text-faint">
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
          <p className="text-[0.82rem] text-muted mb-3">
            Edite o texto da cifra — linhas só com acordes são detectadas automaticamente.
          </p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={30}
            spellCheck={false}
            className="field block"
          />
          <div className="mt-4 flex justify-end gap-2.5">
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