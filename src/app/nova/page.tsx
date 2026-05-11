'use client'

import { useNovaCifraController } from '@/controllers/useNovaCifraController'
import CifraViewer from '@/views/CifraViewer'

const PLACEHOLDER = `[Intro]
Em  G  C  D

[Verso 1]
Em              G
Esse é o primeiro verso
C               D
E esse é o segundo verso

[Refrão]
Em       G
Refrão aqui`

export default function NovaCifraPage() {
  const {
    title, setTitle,
    artist, setArtist,
    tone, setTone,
    capo, setCapo,
    transpose, setTranspose,
    rawText, handleRawTextChange,
    tab, setTab,
    lines,
    handleSave,
    router,
  } = useNovaCifraController()

  return (
    <div className="fade-up">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="bg-transparent border-none cursor-pointer text-muted text-[0.85rem] p-0 mb-5 flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar
      </button>

      <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-8">
        Nova Cifra
      </h1>

      <div className="surface p-6 mb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[0.78rem] font-semibold text-muted mb-1.5 uppercase tracking-[0.06em]">
            Título *
          </label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da música" className="field" />
        </div>
        <div>
          <label className="block text-[0.78rem] font-semibold text-muted mb-1.5 uppercase tracking-[0.06em]">
            Artista
          </label>
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Nome do artista" className="field" />
        </div>
        <div>
          <label className="block text-[0.78rem] font-semibold text-muted mb-1.5 uppercase tracking-[0.06em]">
            Tom original
          </label>
          <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Ex: Em, G, C#m" className="field" />
        </div>
      </div>

      {/* Controls */}
      <div className="surface px-6 py-4 mb-5 flex flex-wrap gap-6 items-center">
        {/* Transpose */}
        <div className="flex items-center gap-2.5">
          <span className="text-[0.82rem] font-semibold text-muted uppercase tracking-[0.06em]">Transpose</span>
          <button className="counter-btn" onClick={() => setTranspose((t) => t - 1)}>−</button>
          <span className={`w-10 text-center font-bold tabular-nums text-[0.95rem] ${transpose !== 0 ? 'text-accent' : 'text-text'}`}>
            {transpose > 0 ? `+${transpose}` : transpose}
          </span>
          <button className="counter-btn" onClick={() => setTranspose((t) => t + 1)}>+</button>
          {transpose !== 0 && (
            <button onClick={() => setTranspose(0)} className="bg-transparent border-none cursor-pointer text-xs text-faint underline p-0">
              resetar
            </button>
          )}
        </div>

        {/* Capo */}
        <div className="flex items-center gap-2.5">
          <span className="text-[0.82rem] font-semibold text-muted uppercase tracking-[0.06em]">Capo</span>
          <select
            value={capo}
            onChange={(e) => setCapo(Number(e.target.value))}
            className="field w-auto"
          >
            <option value={0}>Sem capo</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}ª casa</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-surface2 p-1 rounded-[10px] w-fit">
        {(['editor', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm border-none cursor-pointer transition-all duration-150 ${tab === t ? 'tab-active' : 'tab-inactive'}`}
          >
            {t === 'editor' ? 'Editor' : 'Preview'}
          </button>
        ))}
      </div>

      {tab === 'editor' ? (
        <div>
          <p className="text-[0.82rem] text-muted mb-3">
            Cole aqui a cifra — linhas só com acordes (Ex: <code className="font-mono text-chord">Em G C D</code>) são detectadas automaticamente.
          </p>
          <textarea
            value={rawText}
            onChange={(e) => handleRawTextChange(e.target.value)}
            rows={24}
            spellCheck={false}
            placeholder={PLACEHOLDER}
            className="field block"
          />
        </div>
      ) : (
        <CifraViewer lines={lines} transpose={transpose} capo={capo} />
      )}

      <div className="mt-6 flex justify-end gap-2.5">
        <button onClick={() => router.back()} className="btn-ghost">Cancelar</button>
        <button onClick={handleSave} className="btn-accent">Salvar Cifra</button>
      </div>
    </div>
  )
}
