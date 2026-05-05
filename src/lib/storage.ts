import { Cifra } from '@/types/cifra'

const KEY = 'cifras_v1'

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
}
