'use client'

import { Suspense } from 'react'
import { usePlaylistShareController } from '@/controllers/usePlaylistShareController'

function PlaylistShareContent() {
  const { playlist, cifras, invalid, saved, alreadySaved, handleSave, router } =
    usePlaylistShareController()

  if (invalid) {
    return (
      <div className="fade-up text-center py-20 px-4">
        <h1 className="text-2xl font-extrabold mb-3">Link inválido</h1>
        <p className="text-muted mb-6">O link de compartilhamento é inválido ou expirou.</p>
        <button onClick={() => router.push('/')} className="btn-accent">Ir para o início</button>
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div className="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] mb-1">
            Playlist compartilhada
          </p>
          <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] leading-tight">
            {playlist.name}
          </h1>
          <p className="text-muted text-sm mt-1">
            {cifras.length} {cifras.length === 1 ? 'cifra' : 'cifras'}
          </p>
        </div>

        {alreadySaved ? (
          <span className="text-[0.85rem] text-muted flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saved ? 'Salvo!' : 'Já está na sua lista'}
          </span>
        ) : (
          <button onClick={handleSave} className="btn-accent flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Salvar na minha lista
          </button>
        )}
      </div>

      {/* Song list preview */}
      <div className="flex flex-col gap-2">
        {cifras.map((cifra, idx) => (
          <div key={cifra.id} className="surface p-3 px-4 flex items-center gap-3">
            <span className="font-extrabold text-faint text-[0.85rem] w-5 text-center shrink-0">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis">
                {cifra.title}
              </p>
              <p className="text-[0.78rem] text-muted">{cifra.artist || '—'}</p>
            </div>
            {cifra.tone && <span className="pill pill-accent text-xs shrink-0">{cifra.tone}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlaylistSharePage() {
  return (
    <Suspense>
      <PlaylistShareContent />
    </Suspense>
  )
}
