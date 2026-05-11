'use client'

import { useState, useEffect } from 'react'
import { Cifra } from '@/models/cifra'
import { getAllCifras, deleteCifra } from '@/models/storage'

export function useHomeController() {
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { setCifras(getAllCifras()) }, [])

  const filtered = cifras.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.artist.toLowerCase().includes(search.toLowerCase()),
  )

  function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    if (!confirm('Excluir esta cifra?')) return
    deleteCifra(id)
    setCifras(getAllCifras())
  }

  return { cifras, filtered, search, setSearch, handleDelete }
}
