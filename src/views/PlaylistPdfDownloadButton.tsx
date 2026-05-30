'use client'

import PdfDownloadButton, { PdfConfig } from './PdfDownloadButton'
import SongbookPdfDocument from './SongbookPdfDocument'
import { Cifra } from '@/models/cifra'

interface Props {
  cifras: Cifra[]
  playlistName: string
  cifraColumns?: Record<string, 1 | 2 | 3>
}

export default function PlaylistPdfDownloadButton({ cifras, playlistName, cifraColumns }: Props) {
  const filename = playlistName.replace(/[\/\\:*?"<>|]/g, '_').concat('.pdf')

  const docKey = cifras
    .map((c) => c.id + c.transpose + c.capo + JSON.stringify(c.lineColors ?? {}) + JSON.stringify(c.lineStyles ?? {}))
    .join(',') + JSON.stringify(cifraColumns ?? {})

  const renderDocument = (config: PdfConfig) => (
    <SongbookPdfDocument cifras={cifras} config={config} title={playlistName} cifraColumns={cifraColumns} />
  )

  return <PdfDownloadButton filename={filename} docKey={docKey} renderDocument={renderDocument} />
}
