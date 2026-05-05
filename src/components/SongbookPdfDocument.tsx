import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Cifra, ParsedLine } from '@/types/cifra'
import { transposeLine } from '@/lib/chords'
import { PdfOrientation, PdfColumns } from './PdfDocument'

export interface SongbookPdfConfig {
  orientation: PdfOrientation
  fontSize: number
  columns: PdfColumns
}

interface Props {
  cifras: Cifra[]
  config: SongbookPdfConfig
}

/** Split an array into `n` roughly-equal vertical chunks. */
function chunkLines<T>(arr: T[], n: number): T[][] {
  const size = Math.ceil(arr.length / n)
  return Array.from({ length: n }, (_, i) => arr.slice(i * size, i * size + size))
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

function renderLine(
  line: ParsedLine,
  i: number,
  transpose: number,
  s: ReturnType<typeof makeStyles>,
  customColor?: string,
  customStyle?: { bold?: boolean; italic?: boolean },
) {
  const cc = customColor ? { color: customColor } : {}
  if (line.type === 'empty') return <View key={i} style={s.empty} />
  if (line.type === 'section')
    return <Text key={i} style={{ ...s.sectionLabel, fontFamily: helveticaBoldFont(customStyle?.italic), ...cc }}>{line.content.replace(/[\[\]]/g, '')}</Text>
  if (line.type === 'chord') {
    const content = transpose !== 0 ? transposeLine(line.content, transpose) : line.content
    return <Text key={i} style={{ ...s.chordLine, fontFamily: courierFont(true, customStyle?.bold, customStyle?.italic), ...cc }}>{content}</Text>
  }
  if (line.type === 'tab')
    return <Text key={i} style={{ ...s.tabLine, fontFamily: courierFont(false, customStyle?.bold, customStyle?.italic), ...cc }}>{line.content}</Text>
  return <Text key={i} style={{ ...s.lyricLine, fontFamily: courierFont(false, customStyle?.bold, customStyle?.italic), ...cc }}>{line.content || ' '}</Text>
}

export default function SongbookPdfDocument({ cifras, config }: Props) {
  const { orientation, fontSize, columns } = config
  const s = makeStyles(fontSize)

  return (
    <Document>
      {cifras.map((cifra) => {
        const metaParts: string[] = []
        if (cifra.tone) metaParts.push(`Tom: ${cifra.tone}`)
        if (cifra.transpose !== 0)
          metaParts.push(`Transpose: ${cifra.transpose > 0 ? '+' : ''}${cifra.transpose}`)
        if (cifra.capo > 0) metaParts.push(`Capo na ${cifra.capo}\u00aa casa`)

        return (
          <Page key={cifra.id} size="A4" orientation={orientation} style={s.page}>
            <View style={s.header}>
              <Text style={s.title}>{cifra.title}</Text>
              {cifra.artist ? <Text style={s.artist}>{cifra.artist}</Text> : null}
              {metaParts.length > 0 ? <Text style={s.meta}>{metaParts.join('  \u2022  ')}</Text> : null}
              {cifra.capo > 0 ? <Text style={s.capoNote}>Capo na {cifra.capo}\u00aa casa</Text> : null}
            </View>

            {columns > 1 ? (
              <View style={s.colWrap}>
                {chunkLines(cifra.lines.map((line, i) => ({ line, i })), columns).map((chunk, colIdx) => (
                  <View key={colIdx} style={{ flex: 1, paddingRight: colIdx < columns - 1 ? 10 : 0 }}>
                    {chunk.map(({ line, i }) => renderLine(line, i, cifra.transpose, s, cifra.lineColors?.[i], cifra.lineStyles?.[i]))}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                {cifra.lines.map((line, i) => renderLine(line, i, cifra.transpose, s, cifra.lineColors?.[i], cifra.lineStyles?.[i]))}
              </View>
            )}
          </Page>
        )
      })}
    </Document>
  )
}
