'use client'

import { usePlaylistsController } from '@/controllers/usePlaylistsController'

export default function PlaylistsPage() {
  const {
    playlists,
    creating, setCreating,
    newName, setNewName,
    handleCreate,
    handleDelete,
  } = usePlaylistsController()

  return (
    <div className="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] mb-0.5">Playlists</h1>
          <p className="text-muted text-[0.85rem]">
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-accent">
          + Nova Playlist
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="surface p-5 mb-6 flex gap-3 items-center">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
            placeholder="Nome da playlist…"
            className="field flex-1"
          />
          <button onClick={handleCreate} className="btn-accent">Criar</button>
          <button onClick={() => { setCreating(false); setNewName('') }} className="btn-ghost">Cancelar</button>
        </div>
      )}

      {playlists.length === 0 && !creating ? (
        <div className="text-center py-20 px-4">
          <div className="w-18 h-18 rounded-[20px] bg-accent/12 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <h2 className="text-xl font-extrabold mb-2 tracking-[-0.03em]">Nenhuma playlist ainda</h2>
          <p className="text-muted mb-8 text-[0.95rem]">Crie uma playlist para agrupar suas cifras.</p>
          <button onClick={() => setCreating(true)} className="btn-accent py-3 px-8 text-base">
            + Nova Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((p) => (
            <div key={p.id} className="surface p-5 relative">
              <a
                href={`/playlist/${p.id}`}
                className="no-underline block"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9.5 h-9.5 rounded-[10px] bg-accent/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[0.95rem] text-text">{p.name}</p>
                    <p className="text-xs text-muted">{p.cifraIds.length} {p.cifraIds.length === 1 ? 'cifra' : 'cifras'}</p>
                  </div>
                </div>
              </a>
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute top-3 right-3 w-6.5 h-6.5 rounded-md border-none bg-transparent text-faint cursor-pointer flex items-center justify-center text-base leading-none transition-colors hover:text-danger hover:bg-danger/10"
                aria-label="Excluir playlist"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
