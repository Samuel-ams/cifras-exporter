import { Cifra } from '@/models/cifra'

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
