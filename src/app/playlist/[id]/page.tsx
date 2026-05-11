'use client'

import Link from 'next/link'
import { usePlaylistDetailController } from '@/controllers/usePlaylistDetailController'

export default function PlaylistDetailPage() {
  const {
    playlist,
    playlistCifras,
    availableCifras,
    editingName, setEditingName,
    nameInput, setNameInput,
    search, setSearch,
    handleSaveName,
    addCifra,
    removeCifra,
    moveUp,
    moveDown,
    handleDelete,
    handleShare,
    shareCopied,
    router,
  } = usePlaylistDetailController()

  if (!playlist) return null

  return (
    <div className="fade-up">
      {/* Breadcrumb */}
      <button
        onClick={() => router.push('/playlist')}
        className="bg-transparent border-none cursor-pointer text-muted text-[0.82rem] p-0 mb-5 flex items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Playlists
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                className="field text-[1.6rem] font-extrabold tracking-[-0.03em] py-1"
              />
              <button onClick={handleSaveName} className="btn-accent">Salvar</button>
              <button onClick={() => setEditingName(false)} className="btn-ghost">Cancelar</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-[1.8rem] font-extrabold tracking-[-0.04em] leading-tight">
                {playlist.name}
              </h1>
              <button
                onClick={() => setEditingName(true)}
                className="btn-ghost p-1.5"
                title="Renomear playlist"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <button onClick={handleShare} className="btn-ghost flex items-center gap-1.5">
            {shareCopied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Copiado!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Compartilhar
              </>
            )}
          </button>
          <button onClick={handleDelete} className="btn-danger shrink-0">Excluir playlist</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: cifras in playlist */}
        <div>
          <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] mb-3">
            Cifras na playlist ({playlistCifras.length})
          </p>

          {playlistCifras.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-(--radius) py-10 px-4 text-center text-faint text-sm">
              Adicione cifras da biblioteca →
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {playlistCifras.map((cifra, idx) => (
                <div key={cifra.id} className="surface p-3 px-4 flex items-center gap-3">
                  <span className="font-extrabold text-faint text-[0.85rem] w-5 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis">{cifra.title}</p>
                    <p className="text-[0.78rem] text-muted">{cifra.artist || '—'}</p>
                  </div>
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="bg-transparent border-none text-[0.7rem] px-1 py-px cursor-pointer disabled:text-faint disabled:cursor-default text-muted"
                    >▲</button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === playlistCifras.length - 1}
                      className="bg-transparent border-none text-[0.7rem] px-1 py-px cursor-pointer disabled:text-faint disabled:cursor-default text-muted"
                    >▼</button>
                  </div>
                  {/* Open */}
                  <Link
                    href={`/cifra/${cifra.id}?playlist=${playlist.id}`}
                    className="btn-ghost text-xs px-2 py-1 no-underline shrink-0"
                    title="Abrir cifra"
                  >
                    Abrir
                  </Link>
                  {/* Remove */}
                  <button
                    onClick={() => removeCifra(cifra.id)}
                    className="bg-transparent border-none cursor-pointer text-danger text-base leading-none shrink-0 px-0.5"
                    title="Remover da playlist"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: library to add from */}
        <div>
          <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] mb-3">
            Adicionar da biblioteca
          </p>
          <input
            type="search"
            placeholder="Buscar por título ou artista…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field mb-3 text-sm"
          />
          {availableCifras.length === 0 ? (
            <p className="text-faint text-sm">
              {search ? `Nenhum resultado para "${search}".` : 'Todas as cifras já estão na playlist.'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableCifras.map((cifra) => (
                <div
                  key={cifra.id}
                  className="surface p-3 px-4 flex items-center gap-3 cursor-pointer transition-all duration-150 hover:border-accent/40"
                  onClick={() => addCifra(cifra.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis">{cifra.title}</p>
                    <p className="text-[0.78rem] text-muted">{cifra.artist || '—'}</p>
                  </div>
                  <span className="text-accent text-lg leading-none shrink-0">+</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
