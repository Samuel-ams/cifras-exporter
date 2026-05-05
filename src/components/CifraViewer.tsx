'use client'

import { ParsedLine } from '@/types/cifra'
import { transposeLine } from '@/lib/chords'

type AnnotateMode = 'color' | 'bold' | 'italic' | null

interface Props {
  lines: ParsedLine[]
  transpose: number
  capo: number
  lineColors?: Record<number, string>
  lineStyles?: Record<number, { bold?: boolean; italic?: boolean }>
  annotateMode?: AnnotateMode
  selectedColor?: string
  onLineClick?: (idx: number) => void
}

export default function CifraViewer({ lines, transpose, capo, lineColors, lineStyles, annotateMode, selectedColor, onLineClick }: Props) {
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

  return (
    <div
      className="surface"
      style={{ padding: '2rem', overflowX: 'auto', cursor: annotateMode ? 'crosshair' : undefined }}
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
          const customStyle = lineStyles?.[i]
          const clickable = annotateMode && line.type !== 'empty'

          const inlineStyle: React.CSSProperties = {}
          if (customColor) inlineStyle.color = customColor
          if (customStyle?.bold) inlineStyle.fontWeight = 'bold'
          if (customStyle?.italic) inlineStyle.fontStyle = 'italic'

          const clickProps = clickable
            ? { onClick: () => onLineClick?.(i), style: { ...inlineStyle, outline: '1px solid var(--border-faint)', outlineOffset: '1px', borderRadius: 2 } }
            : { style: inlineStyle }

          if (line.type === 'empty') return <div key={i} style={{ height: '0.75rem' }} />

          if (line.type === 'section')
            return (
              <div key={i} className="cifra-section" style={{ fontFamily: 'system-ui, sans-serif', ...clickProps.style }} {...(clickable ? { onClick: clickProps.onClick } : {})}>
                {line.content.replace(/[\[\]]/g, '')}
              </div>
            )

          if (line.type === 'chord') {
            const content = transpose !== 0 ? transposeLine(line.content, transpose) : line.content
            return (
              <div key={i} className="cifra-chord" {...clickProps}>
                {content}
              </div>
            )
          }

          if (line.type === 'tab')
            return (
              <div key={i} className="cifra-tab" {...clickProps}>
                {line.content}
              </div>
            )

          return (
            <div key={i} className="cifra-lyric" {...clickProps}>
              {line.content || '\u00A0'}
            </div>
          )
        })}
      </div>
    </div>
  )
}
