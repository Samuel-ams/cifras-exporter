'use client'

import { Suspense } from 'react'
import { useShareController } from '@/controllers/useShareController'
import CifraViewer from '@/views/CifraViewer'

function ShareContent() {
  const { cifra, invalid, saved, alreadySaved, handleSave, router } = useShareController()

  if (invalid) {
    return (
      <div className="fade-up text-center py-20 px-4">
        <h1 className="text-2xl font-extrabold mb-3">Link inválido</h1>
        <p className="text-muted mb-6">O link de compartilhamento é inválido ou expirou.</p>
        <button onClick={() => router.push('/')} className="btn-accent">Ir para o início</button>
      </div>
    )
  }

  if (!cifra) return null

  return (
    <div className="fade-up">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push('/')}
            className="bg-transparent border-none cursor-pointer text-muted text-[0.82rem] p-0 mb-2 flex items-center gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Minhas Cifras
          </button>
          <h1 className="text-[1.5rem] sm:text-[2rem] font-extrabold tracking-[-0.04em] mb-0.5 leading-tight">
            {cifra.title}
          </h1>
          {cifra.artist && (
            <p className="text-muted text-base font-medium">{cifra.artist}</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
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
      </div>

      {/* Controls bar (read-only) */}
      <div className="surface px-4 sm:px-6 py-4 mb-6 flex flex-wrap gap-4 sm:gap-6 items-center">
        {cifra.tone && (
          <div className="flex items-center gap-1.5">
            <span className="text-[0.78rem] text-faint">Tom:</span>
            <span className="pill pill-accent">{cifra.tone}</span>
          </div>
        )}
        {cifra.capo > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[0.78rem] text-faint">Capo:</span>
            <span className="pill pill-accent">{cifra.capo}ª casa</span>
          </div>
        )}
        {cifra.transpose !== 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[0.78rem] text-faint">Transpose:</span>
            <span className="pill pill-accent">{cifra.transpose > 0 ? `+${cifra.transpose}` : cifra.transpose}</span>
          </div>
        )}
      </div>

      <CifraViewer
        lines={cifra.lines}
        transpose={cifra.transpose}
        capo={cifra.capo}
        lineColors={cifra.lineColors}
        lineStyles={cifra.lineStyles}
        annotateMode={null}
        selectedColor=""
        onLineClick={() => {}}
      />
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareContent />
    </Suspense>
  )
}
