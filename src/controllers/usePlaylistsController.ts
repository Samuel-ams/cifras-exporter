'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Playlist } from '@/models/playlist'
import { getAllPlaylists, savePlaylist, deletePlaylist } from '@/models/storage'

export function usePlaylistsController() {
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => { setPlaylists(getAllPlaylists()) }, [])

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const now = new Date().toISOString()
    const playlist: Playlist = { id: uuidv4(), name, cifraIds: [], createdAt: now, updatedAt: now }
    savePlaylist(playlist)
    setPlaylists(getAllPlaylists())
    setNewName('')
    setCreating(false)
    router.push(`/playlist/${playlist.id}`)
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta playlist?')) return
    deletePlaylist(id)
    setPlaylists(getAllPlaylists())
  }

  return { playlists, creating, setCreating, newName, setNewName, handleCreate, handleDelete }
}
