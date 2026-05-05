import { ParsedLine } from '@/types/cifra'
import { isChordLine, isTabLine, isSectionLine } from './chords'

/**
 * Parses raw cifra text (CifrasClub-style) into typed lines.
 * Chord lines are detected automatically by pattern matching.
 */
export function parseRawText(text: string): ParsedLine[] {
  return text.split('\n').map((line): ParsedLine => {
    if (!line.trim()) return { type: 'empty', content: line }
    if (isSectionLine(line)) return { type: 'section', content: line.trim() }
    if (isTabLine(line)) return { type: 'tab', content: line }
    if (isChordLine(line)) return { type: 'chord', content: line }
    return { type: 'lyric', content: line }
  })
}
