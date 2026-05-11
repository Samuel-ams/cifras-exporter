import { ParsedLine } from '@/models/cifra'
import { isChordLine, isTabLine, isSectionLine } from './chords'

/**
 * Detects "Capotraste na Xª casa" (or similar) in raw text,
 * extracts the capo fret number, and removes the matching line.
 * Returns the capo number (0 if not found) and the cleaned text.
 */
export function extractCapoFromText(text: string): { capo: number; cleanedText: string } {
  // Matches: "Capotraste na 2ª casa", "Capo na 3a casa", "Capo: 5", etc.
  const capoRegex = /capo(?:traste)?(?:\s+na\s+(\d+)[ªa°º]?\s*casa|\s*[:\-]\s*(\d+))/i
  const lines = text.split('\n')
  let capo = 0
  const cleanedLines = lines.filter((line) => {
    const match = line.match(capoRegex)
    if (match) {
      capo = parseInt(match[1] ?? match[2], 10)
      return false
    }
    return true
  })
  return { capo, cleanedText: cleanedLines.join('\n') }
}

// Matches a section prefix followed by more content, e.g. "[Chorus] Am Em Dm"
const SECTION_PREFIX_RE = /^(\[.+?\])\s+(.+)$/

/**
 * Parses raw cifra text (CifrasClub-style) into typed lines.
 * Chord lines are detected automatically by pattern matching.
 * Lines that mix a section header with chords/lyrics are split into two lines.
 */
export function parseRawText(text: string): ParsedLine[] {
  const parsed = text.split('\n').flatMap((line): ParsedLine[] => {
    if (!line.trim()) return [{ type: 'empty', content: line }]
    if (isSectionLine(line)) return [{ type: 'section', content: line.trim() }]

    // Split "[Section] rest" into separate section + chord/lyric lines
    const sectionMatch = line.match(SECTION_PREFIX_RE)
    if (sectionMatch) {
      const [, section, rest] = sectionMatch
      const restLine: ParsedLine = isTabLine(rest)
        ? { type: 'tab', content: rest }
        : isChordLine(rest)
          ? { type: 'chord', content: rest }
          : { type: 'lyric', content: rest }
      return [{ type: 'section', content: section }, restLine]
    }

    if (isTabLine(line)) return [{ type: 'tab', content: line }]
    if (isChordLine(line)) return [{ type: 'chord', content: line }]
    return [{ type: 'lyric', content: line }]
  })

  // Trim leading whitespace from chord lines that are NOT followed by a lyric line.
  // When a chord sits above a lyric the spacing encodes syllable alignment — preserve it.
  // When chords are standalone (consecutive chords, after a section, etc.) the indentation
  // is just copy-paste artifact and should be removed.
  return parsed.map((line, i) => {
    if (line.type !== 'chord') return line
    const next = parsed[i + 1]
    if (next?.type === 'lyric') return line
    return { ...line, content: line.content.trimStart() }
  })
}
