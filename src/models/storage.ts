import { Cifra } from '@/models/cifra'
import { Playlist } from '@/models/playlist'

const KEY = 'cifras_v1'
const PLAYLIST_KEY = 'playlists_v1'

export function getAllCifras(): Cifra[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Cifra[]
  } catch {
    return []
  }
}

export function getCifra(id: string): Cifra | null {
  return getAllCifras().find((c) => c.id === id) ?? null
}

export function saveCifra(cifra: Cifra): void {
  const all = getAllCifras()
  const idx = all.findIndex((c) => c.id === cifra.id)
  if (idx >= 0) all[idx] = cifra
  else all.unshift(cifra)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deleteCifra(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getAllCifras().filter((c) => c.id !== id)))
  // remove from all playlists too
  const playlists = getAllPlaylists()
  playlists.forEach((p) => {
    p.cifraIds = p.cifraIds.filter((cid) => cid !== id)
  })
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists))
}

// ── Playlists ─────────────────────────────────────────────────────────────────

export function getAllPlaylists(): Playlist[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PLAYLIST_KEY) ?? '[]') as Playlist[]
  } catch {
    return []
  }
}

export function getPlaylist(id: string): Playlist | null {
  return getAllPlaylists().find((p) => p.id === id) ?? null
}

export function savePlaylist(playlist: Playlist): void {
  const all = getAllPlaylists()
  const idx = all.findIndex((p) => p.id === playlist.id)
  if (idx >= 0) all[idx] = playlist
  else all.unshift(playlist)
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(all))
}

export function deletePlaylist(id: string): void {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(getAllPlaylists().filter((p) => p.id !== id)))
}
