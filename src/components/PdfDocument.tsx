import { Document, Page, Text, View } from '@react-pdf/renderer'
import { Cifra, ParsedLine } from '@/types/cifra'
import { transposeLine } from '@/lib/chords'

export type PdfOrientation = 'portrait' | 'landscape'
export type PdfColumns = 1 | 2 | 3

/** Split an array into `n` roughly-equal vertical chunks (column-first order). */
function chunkLines<T>(arr: T[], n: number): T[][] {
  const size = Math.ceil(arr.length / n)
  return Array.from({ length: n }, (_, i) => arr.slice(i * size, i * size + size))
}

interface Props {
  cifra: Cifra
  orientation?: PdfOrientation
  fontSize?: number
  columns?: PdfColumns
}

export default function PdfDocument({ cifra, orientation = 'portrait', fontSize = 10, columns = 1 }: Props) {
  const metaParts: string[] = []
  if (cifra.tone) metaParts.push(`Tom: ${cifra.tone}`)
  if (cifra.transpose !== 0)
    metaParts.push(`Transpose: ${cifra.transpose > 0 ? '+' : ''}${cifra.transpose}`)
  if (cifra.capo > 0) metaParts.push(`Capo na ${cifra.capo}ª casa`)

  const s = {
    page:         { padding: 44, fontFamily: 'Courier', fontSize, backgroundColor: '#fff' },
    header:       { marginBottom: 18 },
    title:        { fontSize: fontSize + 10, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#111' },
    artist:       { fontSize: fontSize + 2, fontFamily: 'Helvetica', color: '#555' },
    meta:         { fontSize: fontSize - 1, fontFamily: 'Helvetica', color: '#888', marginTop: 6 },
    capoNote:     { fontSize: fontSize - 1, fontFamily: 'Helvetica-Bold', color: '#92400e', backgroundColor: '#fef9c3', padding: 6, marginTop: 8, marginBottom: 4 },
    sectionLabel: { fontSize: fontSize - 2, fontFamily: 'Helvetica-Bold', color: '#6366f1', marginTop: 14, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: 1 },
    chordLine:    { fontFamily: 'Courier-Bold', fontSize, color: '#1d4ed8', lineHeight: 1.1 },
    lyricLine:    { fontFamily: 'Courier', fontSize, color: '#111', lineHeight: 1.3 },
    tabLine:      { fontFamily: 'Courier', fontSize: fontSize - 1, color: '#15803d', lineHeight: 1.2 },
    empty:        { height: Math.max(3, fontSize / 2) },
  }

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>{cifra.title}</Text>
          {cifra.artist ? <Text style={s.artist}>{cifra.artist}</Text> : null}
          {metaParts.length > 0 ? (
            <Text style={s.meta}>{metaParts.join('  •  ')}</Text>
          ) : null}
          {cifra.capo > 0 ? (
            <Text style={s.capoNote}>Capo na {cifra.capo}ª casa</Text>
          ) : null}
        </View>

        <View style={columns > 1 ? { flexDirection: 'row' } : {}}>
          {columns > 1
            ? chunkLines(cifra.lines.map((line, i) => ({ line, i })), columns).map((chunk, colIdx) => (
                <View key={colIdx} style={{ flex: 1, paddingRight: colIdx < columns - 1 ? 10 : 0 }}>
                  {chunk.map(({ line, i }) => {
                    const cc = cifra.lineColors?.[i]
                    if (line.type === 'empty') return <View key={i} style={s.empty} />
                    if (line.type === 'section') return <Text key={i} style={{ ...s.sectionLabel, ...(cc ? { color: cc } : {}) }}>{line.content.replace(/[\[\]]/g, '')}</Text>
                    if (line.type === 'chord') return <Text key={i} style={{ ...s.chordLine, ...(cc ? { color: cc } : {}) }}>{cifra.transpose !== 0 ? transposeLine(line.content, cifra.transpose) : line.content}</Text>
                    if (line.type === 'tab') return <Text key={i} style={{ ...s.tabLine, ...(cc ? { color: cc } : {}) }}>{line.content}</Text>
                    return <Text key={i} style={{ ...s.lyricLine, ...(cc ? { color: cc } : {}) }}>{line.content || ' '}</Text>
                  })}
                </View>
              ))
            : cifra.lines.map((line: ParsedLine, i: number) => {
            const cc = cifra.lineColors?.[i]
            if (line.type === 'empty') return <View key={i} style={s.empty} />

            if (line.type === 'section')
              return (
                <Text key={i} style={{ ...s.sectionLabel, ...(cc ? { color: cc } : {}) }}>
                  {line.content.replace(/[\[\]]/g, '')}
                </Text>
              )

            if (line.type === 'chord') {
              const content =
                cifra.transpose !== 0
                  ? transposeLine(line.content, cifra.transpose)
                  : line.content
              return (
                <Text key={i} style={{ ...s.chordLine, ...(cc ? { color: cc } : {}) }}>
                  {content}
                </Text>
              )
            }

            if (line.type === 'tab')
              return (
                <Text key={i} style={{ ...s.tabLine, ...(cc ? { color: cc } : {}) }}>
                  {line.content}
                </Text>
              )

            return (
              <Text key={i} style={{ ...s.lyricLine, ...(cc ? { color: cc } : {}) }}>
                {line.content || ' '}
              </Text>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
