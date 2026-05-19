'use client'

import { useState, useEffect } from 'react'
import { Cifra } from '@/models/cifra'
import { getAllCifras, deleteCifra } from '@/models/storage'
import { useConfirm } from '@/views/ConfirmModal'

export function useHomeController() {
  const confirm = useConfirm()
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { setCifras(getAllCifras()) }, [])

  const filtered = cifras.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.artist.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    const title = cifras.find((c) => c.id === id)?.title ?? 'esta cifra'
    const ok = await confirm(`Deseja excluir a cifra "${title}"?`)
    if (!ok) return
    deleteCifra(id)
    setCifras(getAllCifras())
  }

  return { cifras, filtered, search, setSearch, handleDelete }
}
