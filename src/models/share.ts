import { Cifra } from '@/models/cifra'
import { Playlist } from '@/models/playlist'

export function encodeCifra(cifra: Cifra): string {
  const json = JSON.stringify(cifra)
  return Buffer.from(json, 'utf-8').toString('base64url')
}

export function decodeCifra(param: string): Cifra | null {
  try {
    const json = Buffer.from(param, 'base64url').toString('utf-8')
    return JSON.parse(json) as Cifra
  } catch {
    return null
  }
}

export function buildShareUrl(cifra: Cifra): string {
  const encoded = encodeCifra(cifra)
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/cifra/share?data=${encoded}`
}

// ── Playlist sharing ──────────────────────────────────────────────────────────

export interface PlaylistShareData {
  playlist: Playlist
  cifras: Cifra[]
}

export function encodePlaylistShare(data: PlaylistShareData): string {
  return Buffer.from(JSON.stringify(data), 'utf-8').toString('base64url')
}

export function decodePlaylistShare(param: string): PlaylistShareData | null {
  try {
    return JSON.parse(Buffer.from(param, 'base64url').toString('utf-8')) as PlaylistShareData
  } catch {
    return null
  }
}

export function buildPlaylistShareUrl(playlist: Playlist, cifras: Cifra[]): string {
  const encoded = encodePlaylistShare({ playlist, cifras })
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/playlist/share?data=${encoded}`
}
