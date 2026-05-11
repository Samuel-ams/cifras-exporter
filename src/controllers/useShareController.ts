'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Cifra } from '@/models/cifra'
import { decodeCifra } from '@/models/share'
import { getCifra, saveCifra } from '@/models/storage'

export function useShareController() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cifra, setCifra] = useState<Cifra | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [alreadySaved, setAlreadySaved] = useState(false)

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) { setInvalid(true); return }
    const decoded = decodeCifra(data)
    if (!decoded) { setInvalid(true); return }
    setCifra(decoded)
    setAlreadySaved(!!getCifra(decoded.id))
  }, [searchParams])

  function handleSave() {
    if (!cifra) return
    saveCifra(cifra)
    setSaved(true)
    setAlreadySaved(true)
  }

  return { cifra, invalid, saved, alreadySaved, handleSave, router }
}
