const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function noteIndex(note: string): number {
  const si = CHROMATIC_SHARPS.indexOf(note)
  return si !== -1 ? si : CHROMATIC_FLATS.indexOf(note)
}

function transposeNote(note: string, semitones: number, useFlats: boolean): string {
  const idx = noteIndex(note)
  if (idx === -1) return note
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  return useFlats ? CHROMATIC_FLATS[newIdx] : CHROMATIC_SHARPS[newIdx]
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord
  const match = chord.match(
    /^([A-G][#b]?)((?:maj7?|min7?|m7?|dim7?|aug|sus[24]?|add\d+|\d+)*)(\/[A-G][#b]?)?$/,
  )
  if (!match) return chord
  const [, root, suffix, bass] = match
  const useFlats = root.endsWith('b')
  const newRoot = transposeNote(root, semitones, useFlats)
  const newBass = bass ? '/' + transposeNote(bass.slice(1), semitones, useFlats) : ''
  return newRoot + suffix + newBass
}

// Matches individual chord tokens (e.g. "Em", "G#m7", "C/E")
const CHORD_TOKEN_RE =
  /[A-G][#b]?(?:maj7?|min7?|m7?|dim7?|aug|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?/g

export function transposeLine(line: string, semitones: number): string {
  if (semitones === 0) return line
  return line.replace(CHORD_TOKEN_RE, (match) => transposeChord(match, semitones))
}

/** Returns true if the line contains only chord tokens and whitespace */
export function isChordLine(line: string): boolean {
  if (!line.trim()) return false
  const cleaned = line.replace(CHORD_TOKEN_RE, '').replace(/\s/g, '')
  return cleaned === ''
}

/** Returns true if the line looks like a guitar tab string (E|, A|, D|, G|, B|, e|) */
export function isTabLine(line: string): boolean {
  return /^[EADGBe]\|/.test(line.trim())
}

/** Returns true if the line is a section header like [Intro], [Verse 1] */
export function isSectionLine(line: string): boolean {
  return /^\[.+\]$/.test(line.trim())
}
