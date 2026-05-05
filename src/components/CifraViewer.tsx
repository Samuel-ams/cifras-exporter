'use client'

import { ParsedLine } from '@/types/cifra'
import { transposeLine } from '@/lib/chords'

interface Props {
  lines: ParsedLine[]
  transpose: number
  capo: number
  lineColors?: Record<number, string>
  colorMode?: boolean
  selectedColor?: string
  onLineColorChange?: (idx: number, color: string | null) => void
}

export default function CifraViewer({ lines, transpose, capo, lineColors, colorMode, selectedColor, onLineColorChange }: Props) {
  if (lines.length === 0) {
    return (
      <div
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'var(--text-faint)',
          fontSize: '0.9rem',
        }}
      >
        A cifra aparecerá aqui conforme você digitar.
      </div>
    )
  }

  function handleLineClick(idx: number) {
    if (!colorMode || !onLineColorChange) return
    const current = lineColors?.[idx]
    onLineColorChange(idx, current === selectedColor ? null : (selectedColor ?? '#ef4444'))
  }

  return (
    <div
      className="surface"
      style={{ padding: '2rem', overflowX: 'auto', cursor: colorMode ? 'crosshair' : undefined }}
    >
      {capo > 0 && (
        <div
          className="pill pill-capo"
          style={{ marginBottom: '1.25rem', display: 'inline-flex', padding: '0.3rem 0.8rem', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          CAPO {capo}ª CASA
        </div>
      )}

      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Mono', 'Cascadia Code', 'Courier New', monospace", fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre' }}>
        {lines.map((line, i) => {
          const customColor = lineColors?.[i]
          const clickProps = colorMode && line.type !== 'empty'
            ? { onClick: () => handleLineClick(i), style: { outline: customColor ? `2px solid ${customColor}22` : undefined, outlineOffset: '1px', borderRadius: 2 } }
            : {}

          if (line.type === 'empty') return <div key={i} style={{ height: '0.75rem' }} />

          if (line.type === 'section')
            return (
              <div key={i} className="cifra-section" style={{ fontFamily: 'system-ui, sans-serif', color: customColor ?? undefined }} {...clickProps}>
                {line.content.replace(/[\[\]]/g, '')}
              </div>
            )

          if (line.type === 'chord') {
            const content = transpose !== 0 ? transposeLine(line.content, transpose) : line.content
            return (
              <div key={i} className="cifra-chord" style={{ color: customColor ?? undefined }} {...clickProps}>
                {content}
              </div>
            )
          }

          if (line.type === 'tab')
            return (
              <div key={i} className="cifra-tab" style={{ color: customColor ?? undefined }} {...clickProps}>
                {line.content}
              </div>
            )

          return (
            <div key={i} className="cifra-lyric" style={{ color: customColor ?? undefined }} {...clickProps}>
              {line.content || '\u00A0'}
            </div>
          )
        })}
      </div>
    </div>
  )
}
