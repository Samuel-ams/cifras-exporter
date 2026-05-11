import { Cifra } from '@/models/cifra'
import { Playlist } from '@/models/playlist'

// Buffer.toString('base64url') is Node-only; the Next.js browser polyfill only
// supports 'base64'. We encode as base64 then apply the url-safe substitutions.
function toBase64url(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf-8')
}

export function encodeCifra(cifra: Cifra): string {
  return toBase64url(JSON.stringify(cifra))
}

export function decodeCifra(param: string): Cifra | null {
  try {
    return JSON.parse(fromBase64url(param)) as Cifra
  } catch {
    return null
  }
}

export function buildShareUrl(cifra: Cifra): string {
  const encoded = encodeCifra(cifra)
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/cifra/share#data=${encoded}`
}

// ── Playlist sharing ──────────────────────────────────────────────────────────

export interface PlaylistShareData {
  playlist: Playlist
  cifras: Cifra[]
}

export function encodePlaylistShare(data: PlaylistShareData): string {
  return toBase64url(JSON.stringify(data))
}

export function decodePlaylistShare(param: string): PlaylistShareData | null {
  try {
    return JSON.parse(fromBase64url(param)) as PlaylistShareData
  } catch {
    return null
  }
}

export function buildPlaylistShareUrl(playlist: Playlist, cifras: Cifra[]): string {
  const encoded = encodePlaylistShare({ playlist, cifras })
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/playlist/share#data=${encoded}`
}
