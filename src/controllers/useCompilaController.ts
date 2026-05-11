'use client'

import { useState, useEffect } from 'react'
import { Cifra } from '@/models/cifra'
import { getAllCifras, getCifra } from '@/models/storage'
import { PdfColumns } from '@/views/PdfDocument'
import { SongbookPdfConfig } from '@/views/SongbookPdfDocument'

export type { SongbookPdfConfig }

type Tab = 'musicas' | 'config'

export const FONT_SIZES = [8, 9, 10, 11, 12, 14] as const
export const COLUMNS: PdfColumns[] = [1, 2, 3]

export function useCompilaController() {
  const [allCifras, setAllCifras] = useState<Cifra[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState<Tab>('musicas')
  const [search, setSearch] = useState('')
  const [config, setConfig] = useState<SongbookPdfConfig>({
    orientation: 'portrait',
    fontSize: 10,
    columns: 1,
  })

  useEffect(() => { setAllCifras(getAllCifras()) }, [])

  const selectedCifras = selected.map((id) => getCifra(id)).filter(Boolean) as Cifra[]

  const filteredCifras = allCifras.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.title.toLowerCase().includes(q) || c.artist.toLowerCase().includes(q)
  })

  function toggle(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setSelected((s) => { const n = [...s]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
  }

  function moveDown(idx: number) {
    setSelected((s) => { if (idx >= s.length - 1) return s; const n = [...s]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n })
  }

  function patchConfig<K extends keyof SongbookPdfConfig>(key: K, val: SongbookPdfConfig[K]) {
    setConfig((c) => ({ ...c, [key]: val }))
  }

  return {
    allCifras, selectedCifras, selected,
    tab, setTab,
    search, setSearch,
    config,
    filteredCifras,
    toggle, moveUp, moveDown, patchConfig,
    getCifra,
  }
}
