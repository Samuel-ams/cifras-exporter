import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Cifra, ParsedLine } from '@/models/cifra'
import { transposeLine } from '@/models/chords'
import { PdfOrientation, PdfColumns } from './PdfDocument'

export interface SongbookPdfConfig {
  orientation: PdfOrientation
  fontSize: number
  columns: PdfColumns
}

interface Props {
  cifras: Cifra[]
  config: SongbookPdfConfig
  title?: string
  cifraColumns?: Record<string, 1 | 2 | 3>
}

type LineItem = { line: ParsedLine; i: number }
type LineGroup = { items: LineItem[]; keepTogether: boolean }

/** Group chord lines with their immediately following lyric line so they stay together. */
function groupLines(lines: ParsedLine[]): LineGroup[] {
  const groups: LineGroup[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.type === 'chord') {
      const items: LineItem[] = [{ line, i }]
      let j = i + 1
      while (j < lines.length && lines[j].type === 'chord') {
        items.push({ line: lines[j], i: j })
        j++
      }
      if (j < lines.length && lines[j].type === 'lyric') {
        items.push({ line: lines[j], i: j })
        j++
      }
      groups.push({ items, keepTogether: true })
      i = j
    } else {
      groups.push({ items: [{ line, i }], keepTogether: false })
      i++
    }
  }
  return groups
}

/** Approximate visual height in pt for a parsed line given a font size. */
function lineHeightPt(line: ParsedLine, fontSize: number): number {
  switch (line.type) {
    case 'empty': return Math.max(3, fontSize / 2)
    case 'section': return (fontSize - 2) * 1.2 + 16   // text + marginTop(12) + marginBottom(2)
    case 'chord': return fontSize * 1.1
    case 'tab': return (fontSize - 1) * 1.2
    default: return fontSize * 1.3   // lyric
  }
}

/** Split groups into n columns based on estimated pt height, hard-capped per column. */
function chunkGroups(groups: LineGroup[], n: number, fontSize: number, availableHeight: number): LineGroup[][] {
  const totalHeight = groups.reduce((sum, g) => sum + g.items.reduce((s, { line }) => s + lineHeightPt(line, fontSize), 0), 0)
  const targetHeight = Math.min(totalHeight / n, availableHeight)
  const chunks: LineGroup[][] = []
  let current: LineGroup[] = []
  let currentHeight = 0
  for (const group of groups) {
    const gh = group.items.reduce((s, { line }) => s + lineHeightPt(line, fontSize), 0)
    if (currentHeight + gh > targetHeight && chunks.length < n - 1 && current.length > 0) {
      chunks.push(current)
      current = []
      currentHeight = 0
    }
    current.push(group)
    currentHeight += gh
  }
  if (current.length > 0) chunks.push(current)
  while (chunks.length < n) chunks.push([])

  // Move trailing orphaned chord-only groups and section labels to the next column.
  // Scan backwards through trailing empty lines to detect orphans beneath them.
  for (let ci = 0; ci < chunks.length - 1; ci++) {
    const chunk = chunks[ci]
    if (chunk.length === 0) continue
    let cutAt = chunk.length  // last "safe" boundary (keep-all by default)
    let scan = chunk.length
    while (scan > 1) {
      const g = chunk[scan - 1]
      const lastType = g.items[g.items.length - 1].line.type
      if (lastType === 'empty') { scan--; continue }  // skip empties, keep scanning
      const isOrphanChord = g.keepTogether && lastType !== 'lyric'
      const isSection = lastType === 'section'
      if (isOrphanChord || isSection) {
        cutAt = scan - 1  // trim from before this orphan (includes trailing empties)
        scan--
      } else {
        break
      }
    }
    if (cutAt < chunk.length) {
      chunks[ci + 1].unshift(...chunk.splice(cutAt))
    }
  }

  return chunks
}

function courierFont(baseBold: boolean, bold?: boolean, italic?: boolean) {
  const b = baseBold || bold
  if (b && italic) return 'Courier-BoldOblique'
  if (b) return 'Courier-Bold'
  if (italic) return 'Courier-Oblique'
  return 'Courier'
}
function helveticaBoldFont(italic?: boolean) {
  return italic ? 'Helvetica-BoldOblique' : 'Helvetica-Bold'
}

function makeStyles(fontSize: number) {
  return StyleSheet.create({
    page:         { padding: 44, fontFamily: 'Courier', fontSize, backgroundColor: '#fff' },
    header:       { marginBottom: 16, borderBottom: '1pt solid #e0e0e0', paddingBottom: 10 },
    title:        { fontSize: fontSize + 10, fontFamily: 'Helvetica-Bold', marginBottom: 3, color: '#111' },
    artist:       { fontSize: fontSize + 2, fontFamily: 'Helvetica', color: '#555' },
    meta:         { fontSize: Math.max(6, fontSize - 1), fontFamily: 'Helvetica', color: '#888', marginTop: 5 },
    capoNote:     { fontSize: Math.max(6, fontSize - 1), fontFamily: 'Helvetica-Bold', color: '#92400e', backgroundColor: '#fef9c3', padding: 5, marginTop: 6, marginBottom: 3 },
    sectionLabel: { fontSize: Math.max(6, fontSize - 2), fontFamily: 'Helvetica-Bold', color: '#6366f1', marginTop: 12, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
    chordLine:    { fontFamily: 'Courier-Bold', fontSize, color: '#1d4ed8', lineHeight: 1.1 },
    lyricLine:    { fontFamily: 'Courier', fontSize, color: '#111', lineHeight: 1.3 },
    tabLine:      { fontFamily: 'Courier', fontSize: Math.max(6, fontSize - 1), color: '#15803d', lineHeight: 1.2 },
    empty:        { height: Math.max(3, fontSize / 2) },
    colWrap:      { flexDirection: 'row' },
  })
}

function renderLineItem(
  { line, i }: LineItem,
  transpose: number,
  s: ReturnType<typeof makeStyles>,
  lineColors?: Record<number, string>,
  lineStyles?: Record<number, { bold?: boolean; italic?: boolean }>,
) {
  const cc = lineColors?.[i] ? { color: lineColors[i] } : {}
  const customStyle = lineStyles?.[i]
  const lyricPresence = Math.ceil(s.lyricLine.fontSize * 1.5)
  if (line.type === 'empty') return <View key={i} style={s.empty} />
  if (line.type === 'section')
    return <Text key={i} style={{ ...s.sectionLabel, fontFamily: helveticaBoldFont(customStyle?.italic), ...cc }}>{line.content.replace(/[\[\]]/g, '')}</Text>
  if (line.type === 'chord') {
    const content = (transpose !== 0 ? transposeLine(line.content, transpose) : line.content).replace(/ /g, '\u00a0')
    return <Text key={i} minPresenceAhead={lyricPresence} style={{ ...s.chordLine, fontFamily: courierFont(true, customStyle?.bold, customStyle?.italic), ...cc }}>{content}</Text>
  }
  if (line.type === 'tab')
    return <Text key={i} style={{ ...s.tabLine, fontFamily: courierFont(false, customStyle?.bold, customStyle?.italic), ...cc }}>{line.content}</Text>
  const lyric = (line.content || ' ').replace(/^ +/, m => m.replace(/ /g, '\u00a0'))
  return <Text key={i} style={{ ...s.lyricLine, fontFamily: courierFont(false, customStyle?.bold, customStyle?.italic), ...cc }}>{lyric}</Text>
}

export default function SongbookPdfDocument({ cifras, config, title, cifraColumns }: Props) {
  const { orientation, fontSize, columns } = config
  const s = makeStyles(fontSize)

  return (
    <Document title={title}>
      {cifras.map((cifra) => {
        const metaParts: string[] = []
        if (cifra.tone) metaParts.push(`Tom: ${cifra.tone}`)
        if (cifra.transpose !== 0)
          metaParts.push(`Transpose: ${cifra.transpose > 0 ? '+' : ''}${cifra.transpose}`)
        if (cifra.capo > 0) metaParts.push(`Capo na ${cifra.capo}\u00aa casa`)

        const effectiveCols = cifraColumns?.[cifra.id] ?? columns

        return (
          <Page key={cifra.id} size="A4" orientation={orientation} style={s.page}>
            <View style={s.header}>
              <Text style={s.title}>{cifra.title}</Text>
              {cifra.artist ? <Text style={s.artist}>{cifra.artist}</Text> : null}
              {metaParts.length > 0 ? <Text style={s.meta}>{metaParts.join('  \u2022  ')}</Text> : null}
              {cifra.capo > 0 ? <Text style={s.capoNote}>Capo na {cifra.capo}\u00aa casa</Text> : null}
            </View>

            {(() => {
              if (effectiveCols > 1) {
                const groups = groupLines(cifra.lines)
                const pageH = orientation === 'landscape' ? 595 : 842
                const estHeaderH = (fontSize + 10) * 1.4 + (cifra.artist ? (fontSize + 2) * 1.4 : 0) + 26
                const availableColH = pageH - 44 * 2 - estHeaderH
                return (
                  <View style={s.colWrap}>
                    {chunkGroups(groups, effectiveCols, fontSize, availableColH).map((chunk, colIdx) => (
                      <View key={colIdx} style={{ flex: 1, paddingRight: colIdx < effectiveCols - 1 ? 10 : 0 }}>
                        {chunk.map((g, gi) =>
                          g.keepTogether ? (
                            <View key={gi} wrap={false}>
                              {g.items.map(item => renderLineItem(item, cifra.transpose, s, cifra.lineColors, cifra.lineStyles))}
                            </View>
                          ) : (
                            g.items.map(item => renderLineItem(item, cifra.transpose, s, cifra.lineColors, cifra.lineStyles))
                          )
                        )}
                      </View>
                    ))}
                  </View>
                )
              }
              const singleGroups = groupLines(cifra.lines)
              return (
                <View>
                  {singleGroups.map((g, gi) =>
                    g.keepTogether ? (
                      <View key={gi} wrap={false}>
                        {g.items.map(item => renderLineItem(item, cifra.transpose, s, cifra.lineColors, cifra.lineStyles))}
                      </View>
                    ) : (
                      g.items.map(item => renderLineItem(item, cifra.transpose, s, cifra.lineColors, cifra.lineStyles))
                    )
                  )}
                </View>
              )
            })()}
          </Page>
        )
      })}
    </Document>
  )
}
