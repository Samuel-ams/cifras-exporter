'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Cifra } from '@/models/cifra'
import { parseRawText, extractCapoFromText } from '@/models/parser'
import { getCifra, saveCifra, deleteCifra, getPlaylist } from '@/models/storage'
import { buildShareUrl } from '@/models/share'
import { useConfirm } from '@/views/ConfirmModal'

export type AnnotateMode = 'color' | 'bold' | 'italic' | null

export const COLOR_PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6']

export function useCifraController() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const playlistId = searchParams.get('playlist')

  const confirm = useConfirm()
  const [cifra, setCifra] = useState<Cifra | null>(null)
  const [editing, setEditing] = useState(false)
  const [rawText, setRawText] = useState('')

  function handleRawTextChange(text: string) {
    const { capo: detectedCapo, cleanedText } = extractCapoFromText(text)
    if (detectedCapo > 0) update({ capo: detectedCapo })
    setRawText(cleanedText)
  }
  const [annotateMode, setAnnotateMode] = useState<AnnotateMode>(null)
  const [selectedColor, setSelectedColor] = useState('#ef4444')
  const [autoScrollOpen, setAutoScrollOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    const c = getCifra(id)
    if (!c) { router.replace('/'); return }
    setCifra(c)
    setRawText(c.rawText)
  }, [id, router])

  function update(patch: Partial<Cifra>) {
    const updated: Cifra = { ...cifra!, ...patch, updatedAt: new Date().toISOString() }
    setCifra(updated)
    saveCifra(updated)
  }

  function handleSaveEdit() {
    update({ rawText, lines: parseRawText(rawText) })
    setEditing(false)
  }

  function handleLineClick(idx: number) {
    if (!annotateMode) return
    if (annotateMode === 'color') {
      const newColors = { ...(cifra!.lineColors ?? {}) }
      if (newColors[idx] === selectedColor) delete newColors[idx]
      else newColors[idx] = selectedColor
      update({ lineColors: newColors })
    } else {
      const newStyles = Object.fromEntries(
        Object.entries(cifra!.lineStyles ?? {}).map(([k, v]) => [Number(k), v])
      ) as Record<number, { bold?: boolean; italic?: boolean }>
      const current = newStyles[idx] ?? {}
      const updated = { ...current, [annotateMode]: !current[annotateMode as 'bold' | 'italic'] }
      if (!updated.bold && !updated.italic) delete newStyles[idx]
      else newStyles[idx] = updated
      update({ lineStyles: newStyles })
    }
  }

  async function handleDelete() {
    const ok = await confirm(`Deseja excluir a cifra "${cifra!.title}"?`)
    if (!ok) return
    deleteCifra(cifra!.id)
    router.push('/')
  }

  function handleShare() {
    const url = buildShareUrl(cifra!)
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    })
  }

  // Playlist navigation
  const playlist = playlistId ? getPlaylist(playlistId) : null
  const playlistIndex = playlist ? playlist.cifraIds.indexOf(id) : -1
  const prevCifraId = playlist && playlistIndex > 0 ? playlist.cifraIds[playlistIndex - 1] : null
  const nextCifraId = playlist && playlistIndex < playlist.cifraIds.length - 1 ? playlist.cifraIds[playlistIndex + 1] : null

  function goToPrev() {
    if (prevCifraId) router.push(`/cifra/${prevCifraId}?playlist=${playlistId}`)
  }

  function goToNext() {
    if (nextCifraId) router.push(`/cifra/${nextCifraId}?playlist=${playlistId}`)
  }

  return {
    cifra,
    editing, setEditing,
    rawText, setRawText, handleRawTextChange,
    annotateMode, setAnnotateMode,
    selectedColor, setSelectedColor,
    autoScrollOpen, setAutoScrollOpen,
    shareCopied,
    update,
    handleSaveEdit,
    handleLineClick,
    handleDelete,
    handleShare,
    playlist,
    playlistIndex,
    prevCifraId,
    nextCifraId,
    goToPrev,
    goToNext,
    router,
  }
}
