'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cifra } from '@/models/cifra'
import { decodeCifra } from '@/models/share'
import { getCifra, saveCifra } from '@/models/storage'

export function useShareController() {
  const router = useRouter()
  const [cifra, setCifra] = useState<Cifra | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [alreadySaved, setAlreadySaved] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1) // strip leading #
    const data = new URLSearchParams(hash).get('data')
    if (!data) { setInvalid(true); return }
    const decoded = decodeCifra(data)
    if (!decoded) { setInvalid(true); return }
    setCifra(decoded)
    setAlreadySaved(!!getCifra(decoded.id))
  }, [])

  function handleSave() {
    if (!cifra) return
    saveCifra(cifra)
    setSaved(true)
    setAlreadySaved(true)
  }

  return { cifra, invalid, saved, alreadySaved, handleSave, router }
}
