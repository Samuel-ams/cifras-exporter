'use client'

import Link from 'next/link'
import { Playlist } from '@/models/playlist'

interface Props {
  playlist: Playlist
  currentIndex: number
  prevCifraId: string | null
  nextCifraId: string | null
  onPrev: () => void
  onNext: () => void
}

export default function PlaylistNavBar({ playlist, currentIndex, prevCifraId, nextCifraId, onPrev, onNext }: Props) {
  return (
    <div
      className="surface px-5 py-3 mb-4 flex items-center gap-3 flex-wrap"
      style={{ borderColor: 'var(--accent)', borderLeftWidth: 3 }}
    >
      {/* Playlist label */}
      <Link
        href={`/playlist/${playlist.id}`}
        className="flex items-center gap-1.5 text-accent text-[0.82rem] font-semibold no-underline hover:underline min-w-0 shrink"
        title="Voltar para a playlist"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span className="truncate">{playlist.name}</span>
      </Link>

      <span className="text-faint text-[0.78rem]">
        {currentIndex + 1} / {playlist.cifraIds.length}
      </span>

      <div className="flex gap-1.5 ml-auto shrink-0">
        <button
          onClick={onPrev}
          disabled={!prevCifraId}
          className="btn-ghost flex items-center gap-1 text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-default"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!nextCifraId}
          className="btn-ghost flex items-center gap-1 text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-default"
        >
          Próxima
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
