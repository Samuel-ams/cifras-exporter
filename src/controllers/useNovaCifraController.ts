'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Cifra } from '@/models/cifra'
import { parseRawText, extractCapoFromText } from '@/models/parser'
import { saveCifra } from '@/models/storage'

export function useNovaCifraController() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [tone, setTone] = useState('')
  const [capo, setCapo] = useState(0)
  const [transpose, setTranspose] = useState(0)
  const [rawText, setRawText] = useState('')
  const [tab, setTab] = useState<'editor' | 'preview'>('editor')

  function handleRawTextChange(text: string) {
    const { capo: detectedCapo, cleanedText } = extractCapoFromText(text)
    if (detectedCapo > 0) setCapo(detectedCapo)
    setRawText(cleanedText)
  }

  const lines = parseRawText(rawText)

  function handleSave() {
    if (!title.trim()) {
      alert('Digite o título da música.')
      return
    }
    const now = new Date().toISOString()
    const cifra: Cifra = {
      id: uuidv4(),
      title: title.trim(),
      artist: artist.trim(),
      tone: tone.trim(),
      capo,
      transpose,
      lines,
      rawText,
      createdAt: now,
      updatedAt: now,
    }
    saveCifra(cifra)
    router.push(`/cifra/${cifra.id}`)
  }

  return {
    title, setTitle,
    artist, setArtist,
    tone, setTone,
    capo, setCapo,
    transpose, setTranspose,
    rawText, setRawText, handleRawTextChange,
    tab, setTab,
    lines,
    handleSave,
    router,
  }
}
