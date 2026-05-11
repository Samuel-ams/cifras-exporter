'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Cifra } from '@/models/cifra'
import { Playlist } from '@/models/playlist'
import { decodePlaylistShare } from '@/models/share'
import { getCifra, saveCifra, getPlaylist, savePlaylist } from '@/models/storage'
import { v4 as uuidv4 } from 'uuid'

export function usePlaylistShareController() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [alreadySaved, setAlreadySaved] = useState(false)

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) { setInvalid(true); return }
    const decoded = decodePlaylistShare(data)
    if (!decoded) { setInvalid(true); return }
    setPlaylist(decoded.playlist)
    setCifras(decoded.cifras)
    setAlreadySaved(!!getPlaylist(decoded.playlist.id))
  }, [searchParams])

  function handleSave() {
    if (!playlist) return
    // Save all embedded cifras (skip if already exist)
    cifras.forEach((c) => { if (!getCifra(c.id)) saveCifra(c) })
    // If the playlist id already exists locally, save as a new copy with a new id
    const targetId = getPlaylist(playlist.id) ? uuidv4() : playlist.id
    const now = new Date().toISOString()
    savePlaylist({ ...playlist, id: targetId, cifraIds: cifras.map((c) => c.id), updatedAt: now })
    setSaved(true)
    setAlreadySaved(true)
  }

  return { playlist, cifras, invalid, saved, alreadySaved, handleSave, router }
}
