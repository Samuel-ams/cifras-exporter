'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Playlist } from '@/models/playlist'
import { Cifra } from '@/models/cifra'
import { getPlaylist, savePlaylist, deletePlaylist, getAllCifras, getCifra } from '@/models/storage'
import { buildPlaylistShareUrl } from '@/models/share'
import { useConfirm } from '@/views/ConfirmModal'

export function usePlaylistDetailController() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const confirm = useConfirm()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [allCifras, setAllCifras] = useState<Cifra[]>([])
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [search, setSearch] = useState('')
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    const p = getPlaylist(id)
    if (!p) { router.replace('/playlist'); return }
    setPlaylist(p)
    setNameInput(p.name)
    setAllCifras(getAllCifras())
  }, [id, router])

  function patch(changes: Partial<Playlist>) {
    const updated: Playlist = { ...playlist!, ...changes, updatedAt: new Date().toISOString() }
    setPlaylist(updated)
    savePlaylist(updated)
  }

  function handleSaveName() {
    const name = nameInput.trim()
    if (!name) return
    patch({ name })
    setEditingName(false)
  }

  function addCifra(cifraId: string) {
    if (playlist!.cifraIds.includes(cifraId)) return
    patch({ cifraIds: [...playlist!.cifraIds, cifraId] })
  }

  async function removeCifra(cifraId: string) {
    const cifra = getCifra(cifraId)
    if (!cifra) return
    const ok = await confirm(`Deseja remover a cifra "${cifra.title}" da playlist "${playlist!.name}"?`)
    if (!ok) return
    patch({ cifraIds: playlist!.cifraIds.filter((id) => id !== cifraId) })
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const ids = [...playlist!.cifraIds]
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    patch({ cifraIds: ids })
  }

  function moveDown(idx: number) {
    if (idx >= playlist!.cifraIds.length - 1) return
    const ids = [...playlist!.cifraIds]
    ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    patch({ cifraIds: ids })
  }

  async function handleDelete() {
    const ok = await confirm(`Deseja excluir a playlist "${playlist!.name}"?`)
    if (!ok) return
    deletePlaylist(id)
    router.push('/playlist')
  }

  const playlistCifras = (playlist?.cifraIds ?? [])
    .map((cid) => getCifra(cid))
    .filter(Boolean) as Cifra[]

  function handleShare() {
    if (!playlist) return
    const url = buildPlaylistShareUrl(playlist, playlistCifras)
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    })
  }

  const availableCifras = allCifras.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.artist.toLowerCase().includes(q)
    const notInPlaylist = !playlist?.cifraIds.includes(c.id)
    return matchesSearch && notInPlaylist
  })

  return {
    playlist,
    playlistCifras,
    availableCifras,
    editingName, setEditingName,
    nameInput, setNameInput,
    search, setSearch,
    handleSaveName,
    addCifra,
    removeCifra,
    moveUp,
    moveDown,
    handleDelete,
    handleShare,
    shareCopied,
    router,
  }
}
