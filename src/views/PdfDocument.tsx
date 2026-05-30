import { Document, Page, Text, View } from '@react-pdf/renderer'
import { Cifra, ParsedLine } from '@/models/cifra'
import { transposeLine } from '@/models/chords'

export type PdfOrientation = 'portrait' | 'landscape'
export type PdfColumns = 1 | 2 | 3

/** Map bold/italic flags to the correct built-in PDF font name. */
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

/** Split groups into n columns without breaking any chord+lyric group across columns. */
function chunkGroups(groups: LineGroup[], n: number): LineGroup[][] {
    const total = groups.reduce((sum, g) => sum + g.items.length, 0)
    const targetSize = Math.ceil(total / n)
    const chunks: LineGroup[][] = []
    let current: LineGroup[] = []
    let count = 0
    for (const group of groups) {
        if (count >= targetSize && chunks.length < n - 1) {
            chunks.push(current)
            current = []
            count = 0
        }
        current.push(group)
        count += group.items.length
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
        page: { padding: 44, fontFamily: 'Courier', fontSize, backgroundColor: '#fff' },
        header: { marginBottom: 18 },
        title: { fontSize: fontSize + 10, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#111' },
        artist: { fontSize: fontSize + 2, fontFamily: 'Helvetica', color: '#555' },
        meta: { fontSize: fontSize - 1, fontFamily: 'Helvetica', color: '#888', marginTop: 6 },
        capoNote: { fontSize: fontSize - 1, fontFamily: 'Helvetica-Bold', color: '#92400e', backgroundColor: '#fef9c3', padding: 6, marginTop: 8, marginBottom: 4 },
        sectionLabel: { fontSize: fontSize - 2, fontFamily: 'Helvetica-Bold', color: '#6366f1', marginTop: 14, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: 1 },
        chordLine: { fontFamily: 'Courier-Bold', fontSize, color: '#1d4ed8', lineHeight: 1.1 },
        lyricLine: { fontFamily: 'Courier', fontSize, color: '#111', lineHeight: 1.3 },
        tabLine: { fontFamily: 'Courier', fontSize: fontSize - 1, color: '#15803d', lineHeight: 1.2 },
        empty: { height: Math.max(3, fontSize / 2) },
    }

    const docTitle = [cifra.title, cifra.artist].filter(Boolean).join(' - ')

    return (
        <Document title={docTitle}>
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

                {(() => {
                    function renderLine(line: ParsedLine, i: number) {
                        const cc = cifra.lineColors?.[i]
                        const cs = cifra.lineStyles?.[i]
                        switch (line.type) {
                            case 'empty':
                                return <View key={i} style={s.empty} />
                            case 'section':
                                return <Text key={i} style={{ ...s.sectionLabel, fontFamily: helveticaBoldFont(cs?.italic), ...(cc ? { color: cc } : {}) }}>{line.content.replace(/[\[\]]/g, '')}</Text>
                            case 'chord': {
                                const content = (cifra.transpose !== 0 ? transposeLine(line.content, cifra.transpose) : line.content).replace(/ /g, '\u00a0')
                                return <Text key={i} style={{ ...s.chordLine, fontFamily: courierFont(true, cs?.bold, cs?.italic), ...(cc ? { color: cc } : {}) }}>{content}</Text>
                            }
                            case 'tab':
                                return <Text key={i} style={{ ...s.tabLine, fontFamily: courierFont(false, cs?.bold, cs?.italic), ...(cc ? { color: cc } : {}) }}>{line.content}</Text>
                            default: {
                                const lyric = (line.content || ' ').replace(/^ +/, m => m.replace(/ /g, '\u00a0'))
                                return <Text key={i} style={{ ...s.lyricLine, fontFamily: courierFont(false, cs?.bold, cs?.italic), ...(cc ? { color: cc } : {}) }}>{lyric}</Text>
                            }
                        }
                    }

                    const groups = groupLines(cifra.lines)

                    if (columns > 1) {
                        return (
                            <View style={{ flexDirection: 'row' }}>
                                {chunkGroups(groups, columns).map((chunk, colIdx) => (
                                    <View key={colIdx} style={{ flex: 1, paddingRight: colIdx < columns - 1 ? 10 : 0 }}>
                                        {chunk.map((g, gi) =>
                                            g.keepTogether ? (
                                                <View key={gi} wrap={false}>
                                                    {g.items.map(({ line, i }) => renderLine(line, i))}
                                                </View>
                                            ) : (
                                                g.items.map(({ line, i }) => renderLine(line, i))
                                            )
                                        )}
                                    </View>
                                ))}
                            </View>
                        )
                    }

                    return (
                        <View>
                            {groups.map((group, gi) =>
                                group.keepTogether ? (
                                    <View key={gi} wrap={false}>
                                        {group.items.map(({ line, i }) => renderLine(line, i))}
                                    </View>
                                ) : (
                                    group.items.map(({ line, i }) => renderLine(line, i))
                                )
                            )}
                        </View>
                    )
                })()}
            </Page>
        </Document>
    )
}
