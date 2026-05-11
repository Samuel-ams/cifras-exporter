'use client'

import { useEffect, useState } from 'react'
import { usePDF } from '@react-pdf/renderer'
import PdfDocument, { PdfOrientation, PdfColumns } from './PdfDocument'
import { Cifra } from '@/models/cifra'

const FONT_SIZES = [8, 9, 10, 11, 12, 14] as const
type FontSize = (typeof FONT_SIZES)[number]
const COLUMNS: PdfColumns[] = [1, 2, 3]

interface Props {
  cifra: Cifra
}

export default function PdfDownloadButton({ cifra }: Props) {
  const [orientation, setOrientation] = useState<PdfOrientation>('portrait')
  const [fontSize, setFontSize] = useState<FontSize>(10)
  const [columns, setColumns] = useState<PdfColumns>(1)
  const [open, setOpen] = useState(false)

  const doc = <PdfDocument cifra={cifra} orientation={orientation} fontSize={fontSize} columns={columns} />
  const [instance, update] = usePDF({ document: doc })

  useEffect(() => {
    update(<PdfDocument cifra={cifra} orientation={orientation} fontSize={fontSize} columns={columns} />)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cifra.id, cifra.title, cifra.artist, cifra.tone, cifra.capo, cifra.transpose, cifra.rawText, cifra.lineColors, cifra.lineStyles, orientation, fontSize, columns])

  const filename = [cifra.title, cifra.artist]
    .filter(Boolean)
    .join(' - ')
    .replace(/[/\\:*?"<>|]/g, '_')
    .concat('.pdf')

  return (
    <div className="relative inline-flex">
      {/* Settings toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost"
        aria-label="Opções do PDF"
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none', padding: '0.5rem 0.625rem' }}
        title="Opções do PDF"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 1.41 1.41M4.93 4.93A10 10 0 0 0 3.52 6.34M19.07 19.07a10 10 0 0 1-1.41 1.41M4.93 19.07A10 10 0 0 0 6.34 20.48" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      </button>

      {/* Download */}
      {instance.loading ? (
        <button
          disabled
          className="btn-ghost opacity-50 cursor-wait"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        >
          Gerando...
        </button>
      ) : instance.url ? (
        <a
          href={instance.url}
          download={filename}
          className="btn-ghost no-underline"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        >
          ↓ PDF
        </a>
      ) : null}

      {/* Popover */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
          />
          <div
            className="absolute top-[calc(100%+8px)] right-0 z-50 bg-surface border border-border flex flex-col gap-4 p-5 min-w-60"
            style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}
          >
            <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] m-0">
              Opções do PDF
            </p>

            {/* Orientation */}
            <div>
              <label className="block text-[0.8rem] font-semibold text-text mb-2">Orientação</label>
              <div className="flex gap-2">
                {(['portrait', 'landscape'] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className="flex-1 p-2 rounded-lg flex flex-col items-center gap-1.5 cursor-pointer text-[0.8rem] font-semibold transition-all duration-150"
                    style={{
                      border: '1.5px solid',
                      borderColor: orientation === o ? 'var(--accent)' : 'var(--border)',
                      background: orientation === o ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                      color: orientation === o ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    <span style={{ display: 'block', border: '1.5px solid currentColor', borderRadius: 2, width: o === 'portrait' ? 14 : 20, height: o === 'portrait' ? 20 : 14 }} />
                    {o === 'portrait' ? 'Retrato' : 'Paisagem'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <label className="block text-[0.8rem] font-semibold text-text mb-2">
                Tamanho da fonte — <span className="text-accent">{fontSize}pt</span>
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className="px-2.5 py-1 rounded-md text-[0.8rem] transition-all duration-150 min-w-8.5 text-center"
                    style={{
                      border: '1.5px solid',
                      borderColor: fontSize === s ? 'var(--accent)' : 'var(--border)',
                      background: fontSize === s ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                      color: fontSize === s ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: fontSize === s ? 700 : 500,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Columns */}
            <div>
              <label className="block text-[0.8rem] font-semibold text-text mb-2">
                Colunas — <span className="text-accent">{columns}</span>
              </label>
              <div className="flex gap-2">
                {COLUMNS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColumns(c)}
                    className="flex-1 py-2 px-1 rounded-lg flex flex-col items-center gap-1.5 cursor-pointer text-[0.8rem] font-semibold transition-all duration-150"
                    style={{
                      border: '1.5px solid',
                      borderColor: columns === c ? 'var(--accent)' : 'var(--border)',
                      background: columns === c ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                      color: columns === c ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    {/* Mini column icon */}
                    <span className="flex gap-0.5">
                      {Array.from({ length: c }).map((_, i) => (
                        <span key={i} style={{ display: 'block', width: c === 1 ? 14 : c === 2 ? 8 : 5, height: 18, border: '1.5px solid currentColor', borderRadius: 1 }} />
                      ))}
                    </span>
                    {c === 1 ? '1 col' : c === 2 ? '2 cols' : '3 cols'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="btn-accent mt-1"
            >
              Aplicar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
