export interface Playlist {
  id: string
  name: string
  cifraIds: string[]
  cifraColumns?: Record<string, 1 | 2 | 3>
  createdAt: string
  updatedAt: string
}
