# Cifras

A client-side chord sheet manager for guitarists. Paste chords from sites like CifrasClub, organize them into playlists, transpose, annotate, and export to PDF — no account or backend required. Everything lives in your browser.

## Features

- **Smart paste** — detects chord lines, section headers, tab notation, and capo automatically from pasted text
- **Transpose** — shift all chords up/down by semitones, preserving accidentals and bass notes
- **Capo** — auto-extracted from text ("Capotraste na 2ª casa") or set manually
- **Annotations** — color-code, bold, or italicize individual lines
- **Auto-scroll** — hands-free scrolling at configurable speed for live use
- **PDF export** — individual chord sheets or a full songbook with configurable layout
- **Playlists** — group songs and navigate between them in sequence
- **Share links** — generate read-only URLs to share chords with others
- **Dark/light theme**
- **Fully offline** — all data stored in `localStorage`, no server needed

## Tech Stack

| | |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| PDF | @react-pdf/renderer |
| IDs | uuid |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/               # Pages (Next.js App Router)
    page.tsx         # Home — chord library
    nova/            # Create new chord
    cifra/[id]/      # View / edit chord
    cifra/share/     # Read-only shared view
    compilacao/      # Songbook PDF builder
    playlist/        # Playlist list
    playlist/[id]/   # Playlist detail
  controllers/       # Business logic hooks (one per page)
  models/
    cifra.ts         # Types: Cifra, ParsedLine
    chords.ts        # Chord detection, transposition
    parser.ts        # Raw text → ParsedLine[] (capo extraction, section splitting)
    storage.ts       # localStorage CRUD
    playlist.ts      # Playlist types
    share.ts         # Share URL encoding/decoding
  views/             # Shared UI components
```

## Chord Parsing

Lines are classified automatically:

| Type | Detection |
|------|-----------|
| `chord` | Line contains only chord tokens (`Am`, `G#m7`, `C/E`, …) |
| `tab` | Line starts with a string name followed by `\|` (`E\|`, `A\|`, …) |
| `section` | Line matches `[…]` (`[Intro]`, `[Verso 1]`, …) |
| `lyric` | Everything else |

If a section and chords appear on the same line (`[Refrão] Am Em`), the parser splits them into two lines. Chord lines not followed by a lyric have leading whitespace trimmed (copy-paste artifact from websites). Chord lines above lyrics preserve spacing for syllable alignment.

## Storage

All data is stored in `localStorage`:

- `cifras_v1` — array of all chord sheets
- `playlists_v1` — array of playlists

Deleting a chord automatically removes it from all playlists.
