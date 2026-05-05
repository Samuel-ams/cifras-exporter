export type LineType = 'chord' | 'lyric' | 'section' | 'tab' | 'empty'

export interface ParsedLine {
  type: LineType
  content: string
}

export interface Cifra {
  id: string
  title: string
  artist: string
  tone: string
  capo: number
  transpose: number
  lines: ParsedLine[]
  rawText: string
  createdAt: string
  updatedAt: string
  lineColors?: Record<number, string>
  lineStyles?: Record<number, { bold?: boolean; italic?: boolean }>
}
